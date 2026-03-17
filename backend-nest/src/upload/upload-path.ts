import { basename, join } from 'path';

export function getUploadRoot() {
  return join(process.cwd(), 'uploads');
}

export function getLogoUploadDir() {
  return join(getUploadRoot(), 'logos');
}

const LOGOS_URL_PREFIXES = ['/api/upload/logos/', '/uploads/logos/', '/api/uploads/logos/'];

export function isManagedLogoUrl(logoUrl?: string | null) {
  return Boolean(
    logoUrl && LOGOS_URL_PREFIXES.some((p) => logoUrl.startsWith(p)),
  );
}

export function resolveLogoPathFromUrl(logoUrl: string) {
  const name = basename(logoUrl);
  return join(getLogoUploadDir(), name);
}

