export interface ProjectItem {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  logoUrl?: string | null;
}

export interface ProjectFormData {
  name: string;
  description: string;
  proxyUrl: string;
  members: string;
  logo: string;
}
