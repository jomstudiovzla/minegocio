/**
 * La muestra abre el panel sin sesión de Firebase. Las escrituras del panel
 * se rechazan mientras esa sesión sea la única credencial, para no modificar
 * el catálogo ni los pedidos en vivo.
 */
import { auth } from './firebase';
import { isAdminEmail, readSampleAdminSession, SAMPLE_WRITE_MESSAGE } from './commerce';

export function assertRealAdminWrite(): void {
  if (!readSampleAdminSession()) return;
  if (isAdminEmail(auth.currentUser?.email)) return;
  throw new Error(SAMPLE_WRITE_MESSAGE);
}
