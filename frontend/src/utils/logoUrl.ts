/**
 * 将后端返回的 logo URL 统一为带 /api 前缀的预览地址，兼容旧数据 /uploads/logos/xxx
 */
export function normalizeLogoUrlForPreview(
  url: string | null | undefined,
): string {
  if (!url) return '';
  const name = url.split('/').pop();
  return name ? `/api/upload/logos/${name}` : url;
}
