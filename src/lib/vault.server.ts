import { verifyStaff } from './staff-token.server';
// Partner-only secrets vault. Values are AES-GCM encrypted on the server and never returned to the browser.
export async function admin(token: string) {
  verifyStaff(token, ['partner', 'master']);
  return (await import('@/integrations/supabase/client.server')).supabaseAdmin;
}
async function aesKey() {
  const secret = process.env['STAFF_TOKEN_SECRET'];
  if (!secret) throw new Error('Server is missing its encryption secret');
  const raw = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('vault:' + secret));
  return crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt', 'decrypt']);
}
const b64 = (u: Uint8Array) => Buffer.from(u).toString('base64');
export async function encrypt(plain: string) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await aesKey(), new TextEncoder().encode(plain)));
  return `v1:${b64(iv)}:${b64(ct)}`;
}
async function decrypt(stored: string) {
  const [, iv = '', ct = ''] = stored.split(':');
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: Buffer.from(iv, 'base64') }, await aesKey(), Buffer.from(ct, 'base64'));
  return new TextDecoder().decode(pt);
}
type Db = Awaited<ReturnType<typeof admin>>;
export async function readKey(db: Db, name: string) {
  const { data } = await db.from('env_vault').select('key_value,is_active').eq('key_name', name).maybeSingle();
  if (!data?.key_value || !data.is_active) return '';
  try { return await decrypt(data.key_value); } catch { return ''; }
}

