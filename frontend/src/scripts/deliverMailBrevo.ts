/**
 * Entrega la cola `outboundMail` usando la API de Brevo (transaccional).
 *
 * A diferencia de deliverMail.ts (SMTP crudo), aquí no se abre ningún socket:
 * se hace una llamada HTTPS a Brevo por cada carta pendiente. Esto permite
 * enviar desde un sitio estático sin backend propio: el trabajo lo corre
 * GitHub Actions cada pocos minutos con la clave guardada en Secrets, así la
 * clave NUNCA viaja al navegador del cliente.
 *
 * Variables de entorno (en GitHub → Settings → Secrets and variables → Actions):
 *   BREVO_API_KEY     clave "API key" de Brevo (empieza por "xkeysib-").
 *   BREVO_SENDER      correo remitente verificado en Brevo (ej. info@tudominio).
 *   BREVO_SENDER_NAME nombre que ve quien recibe (opcional, por defecto "Mi Negocio").
 *   ADMIN_PASSWORD    la clave de Firebase del dueño (para leer/actualizar la cola).
 *
 * Marca "enviado" solo cuando Brevo acepta la carta (HTTP 201). Si falla, deja
 * la carta en "error" con el motivo recortado, sin exponer la clave.
 */
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { ADMIN_EMAIL } from '../lib/commerce';

const BREVO_ENDPOINT = 'https://api.brevo.com/v3/smtp/email';
const MAILBOX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

interface BrevoEnv {
  apiKey: string;
  sender: string;
  senderName: string;
  adminPassword: string;
}

/** null = faltan datos. En ese caso no se abre Firebase ni se llama a Brevo. */
function readBrevoEnv(env: NodeJS.ProcessEnv): BrevoEnv | null {
  const apiKey = (env.BREVO_API_KEY || '').trim();
  const sender = (env.BREVO_SENDER || '').trim();
  const senderName = (env.BREVO_SENDER_NAME || 'Mi Negocio').trim();
  const adminPassword = env.ADMIN_PASSWORD || '';
  if (!apiKey || !sender || !adminPassword) return null;
  if (!MAILBOX.test(sender)) return null;
  return { apiKey, sender, senderName, adminPassword };
}

/** Quita la clave de cualquier mensaje de error antes de imprimirlo. */
function scrub(error: unknown, apiKey: string): string {
  const raw = error instanceof Error ? error.message : 'falló el envío';
  const cleaned = apiKey && raw.includes(apiKey) ? raw.split(apiKey).join('[clave]') : raw;
  return cleaned.slice(0, 300);
}

async function sendViaBrevo(env: BrevoEnv, to: string, subject: string, text: string): Promise<void> {
  const res = await fetch(BREVO_ENDPOINT, {
    method: 'POST',
    headers: {
      'api-key': env.apiKey,
      'Content-Type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify({
      sender: { email: env.sender, name: env.senderName },
      to: [{ email: to }],
      subject,
      textContent: text,
    }),
  });
  if (res.status !== 201) {
    let detail = '';
    try {
      const data = (await res.json()) as { message?: string };
      detail = data?.message ? `: ${data.message}` : '';
    } catch {
      /* cuerpo no-JSON */
    }
    throw new Error(`Brevo respondió ${res.status}${detail}`);
  }
}

async function markError(id: string, sendError: string): Promise<void> {
  await updateDoc(doc(db, 'outboundMail', id), { status: 'error', sendError });
}

async function main(): Promise<void> {
  const env = readBrevoEnv(process.env);
  if (!env) {
    console.log('Faltan BREVO_API_KEY, BREVO_SENDER o ADMIN_PASSWORD (o el remitente no es un correo válido).');
    console.log('No se abrió Firebase ni se llamó a Brevo.');
    return;
  }

  await signInWithEmailAndPassword(auth, ADMIN_EMAIL, env.adminPassword);
  const pending = await getDocs(query(collection(db, 'outboundMail'), where('status', '==', 'pendiente')));
  if (pending.empty) {
    console.log('No hay cartas pendientes.');
    return;
  }

  let sent = 0;
  let failed = 0;
  for (const item of pending.docs) {
    const data = item.data() as Record<string, unknown>;
    const to = typeof data.to === 'string' ? data.to : '';
    const subject = typeof data.subject === 'string' ? data.subject : '';
    const text = typeof data.text === 'string' ? data.text : '';
    if (!MAILBOX.test(to) || !subject || !text) {
      failed += 1;
      try {
        await markError(item.id, 'carta incompleta o destinatario inválido');
      } catch {
        console.error(`No pude marcar la carta incompleta ${item.id}.`);
      }
      continue;
    }

    try {
      await sendViaBrevo(env, to, subject, text);
      try {
        await updateDoc(doc(db, 'outboundMail', item.id), {
          status: 'enviado',
          sentAt: new Date().toISOString(),
          sendError: '',
        });
        sent += 1;
        console.log(`Enviada: ${item.id}`);
      } catch {
        failed += 1;
        console.error(`La carta ${item.id} se envió, pero sigue en "pendiente". No vuelvas a correr el script ahora: se enviaría otra vez.`);
      }
    } catch (error) {
      failed += 1;
      const message = scrub(error, env.apiKey);
      console.error(`No salió ${item.id}: ${message}`);
      try {
        await markError(item.id, message);
      } catch {
        console.error(`Tampoco pude marcar el error de ${item.id}.`);
      }
    }
  }
  console.log(`Listo. Enviadas: ${sent}. Con error: ${failed}. Leídas: ${pending.size}.`);
}

main().catch(error => {
  const apiKey = process.env.BREVO_API_KEY || '';
  console.error('No se pudo entregar la cola.');
  console.error(scrub(error, apiKey));
  process.exitCode = 1;
});
