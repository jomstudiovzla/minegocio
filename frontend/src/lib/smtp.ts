/**
 * SMTP mínimo para la cola de pedidos.
 * Esta capa no abre sockets: deliverMail.ts pone el transporte.
 * Los tests hablan con un transporte falso y no salen a la red.
 */

export class SmtpError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SmtpError';
  }
}

export interface SmtpMessage {
  to: string;
  subject: string;
  text: string;
}

export interface SmtpAuth {
  user: string;
  pass: string;
  from: string;
  /** 465 ya entra cifrado. 587 pide STARTTLS antes de la clave. */
  mode: 'implicit-tls' | 'starttls';
}

export interface LineTransport {
  write(chunk: string): void;
  readReply(): Promise<string>;
  startTls(): Promise<void>;
}

export interface MailEnv {
  host: string;
  port: 465 | 587;
  user: string;
  pass: string;
  from: string;
  adminPassword: string;
}

const MAILBOX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

/** null = faltan datos o el puerto no es 465 ni 587. En ese caso no hay que conectar. */
export function readMailEnv(env: Record<string, string | undefined>): MailEnv | null {
  const host = (env.SMTP_HOST || '').trim();
  const user = (env.SMTP_USER || '').trim();
  const pass = env.SMTP_PASS || '';
  const from = (env.MAIL_FROM || '').trim();
  const adminPassword = env.ADMIN_PASSWORD || '';
  const port = Number((env.SMTP_PORT || '').trim());
  if (!host || !user || !pass || !from || !adminPassword) return null;
  if (port !== 465 && port !== 587) return null;
  if (!MAILBOX.test(from)) return null;
  return { host, port, user, pass, from, adminPassword };
}

export function modeForPort(port: 465 | 587): SmtpAuth['mode'] {
  return port === 465 ? 'implicit-tls' : 'starttls';
}

export function b64(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

/** RFC 2047. Un asunto con acentos o saltos de línea no puede ir en claro. */
export function encodeSubject(subject: string): string {
  const single = subject.replace(/\s+/g, ' ').trim();
  if (/^[\x20-\x7E]*$/.test(single)) return single;
  return `=?UTF-8?B?${b64(single)}?=`;
}

/** Una línea que empieza por punto se duplica para que no cierre el DATA. */
export function dotStuff(text: string): string {
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  return normalized
    .split('\n')
    .map(line => (line.startsWith('.') ? `.${line}` : line))
    .join('\r\n');
}

export function buildData(from: string, message: SmtpMessage): string {
  const headers = [
    `From: ${from}`,
    `To: ${message.to}`,
    `Subject: ${encodeSubject(message.subject)}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
  ].join('\r\n');
  return `${headers}\r\n\r\n${dotStuff(message.text)}\r\n.\r\n`;
}

export function replyCode(reply: string): number {
  const lines = reply.split('\n').map(line => line.replace(/\r$/, '')).filter(line => line.length > 0);
  const last = lines[lines.length - 1] || '';
  const match = /^(\d{3})[ -]/.exec(last);
  if (!match) throw new SmtpError('respuesta SMTP ilegible');
  return Number(match[1]);
}

export function capabilities(reply: string): Set<string> {
  const words = new Set<string>();
  for (const line of reply.split('\n')) {
    const text = line.replace(/^\d{3}[- ]/, '').trim().toUpperCase();
    for (const word of text.split(/\s+/)) {
      if (word) words.add(word);
    }
  }
  return words;
}

export function offersLogin(reply: string): boolean {
  return /AUTH[^\n]*LOGIN/i.test(reply);
}

/**
 * Saca respuestas SMTP completas de un buffer.
 * Una respuesta termina en una línea "250 texto", no en "250-sigue".
 * Lo que aún no tiene salto de línea queda en rest.
 */
export function takeReplies(buffer: string): { replies: string[]; rest: string } {
  const replies: string[] = [];
  let offset = 0;
  let lineStart = 0;
  while (lineStart < buffer.length) {
    const nl = buffer.indexOf('\n', lineStart);
    if (nl === -1) break;
    const line = buffer.slice(lineStart, nl).replace(/\r$/, '');
    if (/^\d{3} /.test(line)) {
      const raw = buffer.slice(offset, nl);
      replies.push(raw.split('\n').map(part => part.replace(/\r$/, '')).join('\n'));
      offset = nl + 1;
      lineStart = offset;
      continue;
    }
    if (line !== '' && !/^\d{3}-/.test(line)) break;
    lineStart = nl + 1;
  }
  return { replies, rest: buffer.slice(offset) };
}

function safeAddress(value: string): string {
  const trimmed = value.trim();
  if (!MAILBOX.test(trimmed)) throw new SmtpError('dirección de correo inválida');
  return trimmed;
}

function cmd(transport: LineTransport, line: string) {
  transport.write(`${line}\r\n`);
}

async function expectCode(transport: LineTransport, code: number, label: string): Promise<string> {
  const reply = await transport.readReply();
  const got = replyCode(reply);
  if (got !== code) throw new SmtpError(`${label}: el servidor respondió ${got}`);
  return reply;
}

/**
 * Entrega una carta. Solo resuelve si el servidor respondió 250 al DATA.
 * El QUIT posterior no cambia ese resultado. Los errores no incluyen la clave.
 */
export async function deliverOver(transport: LineTransport, auth: SmtpAuth, message: SmtpMessage): Promise<void> {
  const from = safeAddress(auth.from);
  const to = safeAddress(message.to);
  let session = false;
  try {
    await expectCode(transport, 220, 'saludo');
    session = true;
    cmd(transport, 'EHLO minegocio.local');
    let hello = await expectCode(transport, 250, 'presentación');
    if (auth.mode === 'starttls') {
      if (!capabilities(hello).has('STARTTLS')) {
        throw new SmtpError('presentación: el servidor no ofrece STARTTLS');
      }
      cmd(transport, 'STARTTLS');
      await expectCode(transport, 220, 'inicio TLS');
      await transport.startTls();
      cmd(transport, 'EHLO minegocio.local');
      hello = await expectCode(transport, 250, 'presentación');
    }
    if (!offersLogin(hello)) {
      throw new SmtpError('presentación: el servidor no acepta AUTH LOGIN');
    }
    cmd(transport, 'AUTH LOGIN');
    await expectCode(transport, 334, 'usuario');
    cmd(transport, b64(auth.user));
    await expectCode(transport, 334, 'clave');
    cmd(transport, b64(auth.pass));
    await expectCode(transport, 235, 'autenticación');
    cmd(transport, `MAIL FROM:<${from}>`);
    await expectCode(transport, 250, 'remitente');
    cmd(transport, `RCPT TO:<${to}>`);
    await expectCode(transport, 250, 'destinatario');
    cmd(transport, 'DATA');
    await expectCode(transport, 354, 'cuerpo');
    transport.write(buildData(from, { ...message, to }));
    await expectCode(transport, 250, 'envío');
  } finally {
    if (session) {
      try {
        cmd(transport, 'QUIT');
        await transport.readReply();
      } catch {
        // El cierre no decide si el mensaje fue aceptado.
      }
    }
  }
}
