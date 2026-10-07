/**
 * Entrega la cola outboundMail al buzón del dominio.
 *
 * No guarda la clave. Léela del entorno y no la imprimas:
 *   SMTP_HOST, SMTP_PORT (465 o 587), SMTP_USER, SMTP_PASS, MAIL_FROM
 *   ADMIN_PASSWORD  (la de Firebase, ya rotada)
 *
 * Sin esas variables el script no entra a Firebase y no abre un socket.
 * Marca "enviado" solo después de que el servidor SMTP responda 250 al DATA.
 * La tienda igual muestra la carta en Mi cuenta y en la pestaña Correos.
 */
import net from 'node:net';
import tls from 'node:tls';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { ADMIN_EMAIL } from '../lib/commerce';
import {
  SmtpError,
  deliverOver,
  modeForPort,
  readMailEnv,
  takeReplies,
  type LineTransport,
} from '../lib/smtp';

function scrub(error: unknown, pass: string): string {
  const raw = error instanceof Error ? error.message : 'falló el envío';
  const cleaned = pass && raw.includes(pass) ? raw.split(pass).join('[clave]') : raw;
  return cleaned.slice(0, 300);
}

function openSmtp(host: string, port: number, secure: boolean): Promise<{ transport: LineTransport; close: () => void }> {
  return new Promise((resolve, reject) => {
    let buffer = '';
    const queued: string[] = [];
    let waiter: ((reply: string) => void) | null = null;
    let waiterFail: ((error: Error) => void) | null = null;
    let opened = false;
    let current: net.Socket;

    const failWaiter = (error: Error) => {
      if (!opened) {
        opened = true;
        reject(error);
        return;
      }
      if (waiterFail) {
        const fail = waiterFail;
        waiter = null;
        waiterFail = null;
        fail(error);
      }
    };

    const pump = () => {
      const taken = takeReplies(buffer);
      buffer = taken.rest;
      for (const reply of taken.replies) {
        if (waiter) {
          const done = waiter;
          waiter = null;
          waiterFail = null;
          done(reply);
        } else {
          queued.push(reply);
        }
      }
    };

    const onData = (chunk: Buffer | string) => {
      buffer += typeof chunk === 'string' ? chunk : chunk.toString('utf8');
      pump();
    };

    const watch = (socket: net.Socket) => {
      current = socket;
      socket.setTimeout(20_000);
      socket.on('timeout', () => {
        socket.destroy();
        failWaiter(new SmtpError('el servidor de correo no respondió'));
      });
      socket.on('data', onData);
      socket.on('error', failWaiter);
    };

    const finishOpen = () => {
      if (opened) return;
      opened = true;
      const transport: LineTransport = {
        write(chunk) {
          current.write(chunk);
        },
        readReply() {
          const next = queued.shift();
          if (next !== undefined) return Promise.resolve(next);
          return new Promise((res, rej) => {
            const timer = setTimeout(() => {
              if (waiter) {
                waiter = null;
                waiterFail = null;
                rej(new SmtpError('la respuesta SMTP tardó demasiado'));
              }
            }, 20_000);
            waiter = reply => {
              clearTimeout(timer);
              res(reply);
            };
            waiterFail = error => {
              clearTimeout(timer);
              rej(error);
            };
          });
        },
        startTls() {
          const plain = current;
          plain.removeListener('data', onData);
          return new Promise<void>((res, rej) => {
            const upgraded = tls.connect({ socket: plain, servername: host });
            upgraded.once('secureConnect', () => {
              watch(upgraded);
              res();
            });
            upgraded.once('error', rej);
          });
        },
      };
      resolve({
        transport,
        close() {
          current.destroy();
        },
      });
    };

    if (secure) {
      const socket = tls.connect({ host, port, servername: host });
      watch(socket);
      socket.once('secureConnect', finishOpen);
    } else {
      const socket = net.connect({ host, port });
      watch(socket);
      socket.once('connect', finishOpen);
    }
  });
}

async function markError(id: string, sendError: string): Promise<void> {
  await updateDoc(doc(db, 'outboundMail', id), { status: 'error', sendError });
}

async function main(): Promise<void> {
  const env = readMailEnv(process.env);
  if (!env) {
    console.log('Falta SMTP o ADMIN_PASSWORD, o SMTP_PORT no es 465 ni 587. No se abrió Firebase ni el correo.');
    console.log('Cuando el buzón exista: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM y ADMIN_PASSWORD.');
    return;
  }

  await signInWithEmailAndPassword(auth, ADMIN_EMAIL, env.adminPassword);
  const pending = await getDocs(query(collection(db, 'outboundMail'), where('status', '==', 'pendiente')));
  if (pending.empty) {
    console.log('No hay cartas pendientes. No se abrió el servidor de correo.');
    return;
  }

  let sent = 0;
  let failed = 0;
  for (const item of pending.docs) {
    const data = item.data() as Record<string, unknown>;
    const to = typeof data.to === 'string' ? data.to : '';
    const subject = typeof data.subject === 'string' ? data.subject : '';
    const text = typeof data.text === 'string' ? data.text : '';
    if (!to || !subject || !text) {
      failed += 1;
      try {
        await markError(item.id, 'carta incompleta');
      } catch {
        console.error(`No pude marcar la carta incompleta ${item.id}.`);
      }
      continue;
    }

    let opened: { transport: LineTransport; close: () => void } | null = null;
    try {
      opened = await openSmtp(env.host, env.port, env.port === 465);
      await deliverOver(opened.transport, {
        user: env.user,
        pass: env.pass,
        from: env.from,
        mode: modeForPort(env.port),
      }, { to, subject, text });
      try {
        await updateDoc(doc(db, 'outboundMail', item.id), {
          status: 'enviado',
          sentAt: new Date().toISOString(),
          sendError: '',
        });
        sent += 1;
        console.log(`Aceptada por el servidor: ${item.id}`);
      } catch {
        failed += 1;
        console.error(`La carta ${item.id} ya fue aceptada, pero sigue en pendiente. No vuelvas a correr el script ahora: se enviaría otra vez.`);
      }
    } catch (error) {
      failed += 1;
      const message = scrub(error, env.pass);
      console.error(`No salió ${item.id}: ${message}`);
      try {
        await markError(item.id, message);
      } catch {
        console.error(`Tampoco pude marcar el error de ${item.id}.`);
      }
    } finally {
      opened?.close();
    }
  }
  console.log(`Listo. Aceptadas: ${sent}. Con error: ${failed}. Leídas: ${pending.size}.`);
}

main().catch(error => {
  const pass = process.env.SMTP_PASS || '';
  console.error('No se pudo entregar la cola.');
  console.error(scrub(error, pass));
  process.exitCode = 1;
});
