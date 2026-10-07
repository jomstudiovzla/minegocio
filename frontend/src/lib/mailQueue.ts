/**
 * Encola una carta en Firestore. No la envía al buzón:
 * eso lo hace el script deliverMail.ts cuando existe SMTP del dominio.
 * Si la escritura falla, el pedido no se deshace.
 */
import { collection, doc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import type { OutboundLetter } from './mail';

export async function queueOutboundMail(letter: OutboundLetter): Promise<void> {
  const ref = doc(collection(db, 'outboundMail'));
  await setDoc(ref, {
    id: ref.id,
    kind: letter.kind,
    to: letter.to,
    toUid: letter.toUid || '',
    fromUid: auth.currentUser?.uid || '',
    orderId: letter.orderId,
    // Las reglas exigen size() < 180 y size() < 8000. 180 y 8000 serían rechazados.
    subject: letter.subject.slice(0, 179),
    text: letter.text.slice(0, 7999),
    status: 'pendiente',
    createdAt: new Date().toISOString(),
  });
}
