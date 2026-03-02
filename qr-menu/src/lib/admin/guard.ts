import { isAdmin } from '../api/menu';
import { getSession } from '../auth';

export async function getAdminStatus() {
  const session = await getSession();
  if (!session?.user) {
    return { session: null, isAdmin: false };
  }

  const admin = await isAdmin(session.user.id);
  return { session, isAdmin: admin };
}
