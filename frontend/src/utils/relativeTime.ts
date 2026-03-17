/**
 * 将 ISO 时间字符串格式化为相对时间显示（如 "2 mins ago"）
 */
export function formatLastCall(iso: string | null | undefined): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} mins ago`;
  if (diffHours < 24) return `${diffHours} hour(s) ago`;
  if (diffDays < 7) return `${diffDays} day(s) ago`;
  return date.toLocaleDateString();
}
