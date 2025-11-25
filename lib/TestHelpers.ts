import { query } from './db';

export async function deleteUserByEmail(email: string) {
  try {
    await query('DELETE FROM Users WHERE email = ?', [email]);
  } catch (e) {
    // best-effort
    // eslint-disable-next-line no-console
    console.error('deleteUserByEmail failed', e);
  }
}

export async function deleteItemById(id: number) {
  try {
    await query('DELETE FROM Items WHERE id = ?', [id]);
  } catch (e) {
    // best-effort
    // eslint-disable-next-line no-console
    console.error('deleteItemById failed', e);
  }
}
