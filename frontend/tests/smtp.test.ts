import assert from 'node:assert/strict';
import test from 'node:test';
import {
  SmtpError,
  b64,
  buildData,
  deliverOver,
  dotStuff,
  encodeSubject,
  modeForPort,
  readMailEnv,
  takeReplies,
  type LineTransport,
  type SmtpAuth,
} from '../src/lib/smtp';

const PASS = 'clave-super-secreta';

class Script implements LineTransport {
  events: string[] = [];
  private replies: string[];
  constructor(replies: string[]) {
    this.replies = replies.slice();
  }
  write(chunk: string) {
    this.events.push(chunk);
  }
  async readReply() {
    const next = this.replies.shift();
    if (next === undefined) throw new SmtpError('sin respuesta');
    return next;
  }
  async startTls() {
    this.events.push('TLS');
  }
}

function auth(mode: SmtpAuth['mode']): SmtpAuth {
  return {
    user: 'pedidos@jomstudio.com',
    pass: PASS,
    from: 'pedidos@jomstudio.com',
    mode,
  };
}

const message = {
  to: 'maria@ejemplo.com',
  subject: 'Mi Negocio · pedido #MINE-1',
  text: 'Hola María\n.oculto\nfin',
};

const afterAuth = ['334 VXNlcm5hbWU6', '334 UGFzc3dvcmQ6', '235 ok', '250 sender', '250 rcpt', '354 go', '250 queued', '221 bye'];

test('sin host, clave o puerto 465/587 no hay entorno de envío', () => {
  assert.equal(readMailEnv({}), null);
  assert.equal(readMailEnv({
    SMTP_HOST: 'smtp.jomstudio.com',
    SMTP_PORT: '25',
    SMTP_USER: 'pedidos@jomstudio.com',
    SMTP_PASS: PASS,
    MAIL_FROM: 'pedidos@jomstudio.com',
    ADMIN_PASSWORD: 'otra-clave-larga',
  }), null);
  const ready = readMailEnv({
    SMTP_HOST: 'smtp.jomstudio.com',
    SMTP_PORT: '587',
    SMTP_USER: 'pedidos@jomstudio.com',
    SMTP_PASS: PASS,
    MAIL_FROM: 'pedidos@jomstudio.com',
    ADMIN_PASSWORD: 'otra-clave-larga',
  });
  assert.equal(ready?.port, 587);
  assert.equal(modeForPort(465), 'implicit-tls');
  assert.equal(modeForPort(587), 'starttls');
});

test('el asunto con acento va en RFC 2047 y el punto inicial se duplica', () => {
  assert.equal(encodeSubject('Pedido 1'), 'Pedido 1');
  assert.match(encodeSubject('Mi Negocio · María'), /^=\?UTF-8\?B\?.+\?=$/);
  assert.equal(dotStuff('hola\n.oculto'), 'hola\r\n..oculto');
  const data = buildData('pedidos@jomstudio.com', message);
  assert.match(data, /\r\n\.\.oculto\r\n/);
  assert.match(data, /\r\n\.\r\n$/);
  assert.equal(data.split('\r\n.\r\n').length, 2);
});

test('un buffer a medias no finge una respuesta completa', () => {
  assert.deepEqual(takeReplies('220 listo'), { replies: [], rest: '220 listo' });
  const one = takeReplies('250-STARTTLS\r\n250 AUTH LOGIN\r\n');
  assert.deepEqual(one.replies, ['250-STARTTLS\n250 AUTH LOGIN']);
  assert.equal(one.rest, '');
  const two = takeReplies('220 hi\r\n250 OK\r\n');
  assert.equal(two.replies.length, 2);
});

test('el puerto 587 hace STARTTLS antes de enviar la clave', async () => {
  const script = new Script([
    '220 ready',
    '250-hello\n250-STARTTLS\n250 AUTH LOGIN',
    '220 tls',
    '250 AUTH LOGIN',
    ...afterAuth,
  ]);
  await deliverOver(script, auth('starttls'), message);
  const ehlo = script.events.map((event, index) => ({ event, index })).filter(item => item.event.startsWith('EHLO'));
  const tlsAt = script.events.indexOf('TLS');
  assert.equal(ehlo.length, 2);
  assert.ok(ehlo[0].index < tlsAt && tlsAt < ehlo[1].index);
  const payload = script.events.find(event => event.includes('Subject:'));
  assert.ok(payload);
  assert.match(payload, /\r\n\.\.oculto\r\n/);
  assert.equal(script.events.some(event => event.includes(PASS)), false);
});

test('el puerto 465 no pide STARTTLS', async () => {
  const script = new Script(['220 ready', '250 AUTH LOGIN', ...afterAuth]);
  await deliverOver(script, auth('implicit-tls'), message);
  assert.equal(script.events.includes('TLS'), false);
  assert.equal(script.events.filter(event => event.startsWith('EHLO')).length, 1);
});

test('si la clave es rechazada, el error no la repite y no hay DATA', async () => {
  const script = new Script([
    '220 ready',
    '250 AUTH LOGIN',
    '334 user',
    '334 pass',
    `535 ${PASS}`,
  ]);
  await assert.rejects(
    () => deliverOver(script, auth('implicit-tls'), message),
    (error: unknown) => {
      assert.ok(error instanceof SmtpError);
      assert.match(error.message, /autenticación: el servidor respondió 535/);
      assert.equal(error.message.includes(PASS), false);
      return true;
    },
  );
  assert.equal(script.events.some(event => event.startsWith('DATA')), false);
  assert.equal(script.events.some(event => event.includes(PASS)), false);
});

test('sin AUTH LOGIN no se escribe la clave', async () => {
  const script = new Script(['220 ready', '250 PIPELINING']);
  await assert.rejects(() => deliverOver(script, auth('implicit-tls'), message));
  assert.equal(script.events.some(event => event.includes(b64(PASS))), false);
});

test('una dirección con salto de línea no abre la sesión', async () => {
  const script = new Script(['220 ready']);
  await assert.rejects(
    () => deliverOver(script, auth('implicit-tls'), { ...message, to: 'maria@ejemplo.com\r\nBCC:otro@ejemplo.com' }),
    /dirección de correo inválida/,
  );
  assert.deepEqual(script.events, []);
});
