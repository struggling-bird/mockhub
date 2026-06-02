export interface ProjectItem {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  logoUrl?: string | null;
  mockKey?: string | null;
  proxyUrl?: string | null;
  defaultMockMode?: 'static' | 'script' | 'proxy';
  autoCapture?: boolean;
  cookieRewriteMode?: 'off' | 'origin' | 'custom';
  cookieRewriteDomain?: string | null;
}

export interface ProjectFormData {
  name: string;
  description: string;
  proxyUrl: string;
  members: string;
  logo: string;
  defaultMockMode: 'static' | 'script' | 'proxy';
  autoCapture: boolean;
  cookieRewriteMode: 'off' | 'origin' | 'custom';
  cookieRewriteDomain: string;
}
