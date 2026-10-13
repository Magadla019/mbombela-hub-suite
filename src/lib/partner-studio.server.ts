import { verifyStaff } from './staff-token.server';

export async function partnerDb(token: string) {
  verifyStaff(token, ['partner', 'master']);
  return (await import('@/integrations/supabase/client.server')).supabaseAdmin;
}