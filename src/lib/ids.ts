/**
 * Makes a short unique id like "g_m3x9k2a7f1".
 * prefix tells us what it is: g = group, m = member, e = expense, s = settlement
 */
export function createId(prefix: string): string {
  const time = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${time}${random}`;
}