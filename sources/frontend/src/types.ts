import { 
  LayoutDashboard, 
  Globe, 
  Code2, 
  Users, 
  Settings, 
  Activity, 
  Plus, 
  Search, 
  ChevronRight,
  Database,
  ShieldCheck,
  Zap,
  Clock,
  MoreVertical,
  Play
} from 'lucide-react';

export type ViewType = 'dashboard' | 'apis' | 'proxies' | 'assets' | 'team' | 'stats' | 'projects';

export type ApiMockMode = 'static' | 'script' | 'proxy';

export interface ApiHeaderRow {
  key: string;
  value: string;
  desc?: string;
}

export interface ApiSchemaRow {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'integer';
  required: boolean;
  desc?: string;
  value?: string;
  depth?: number;
  section?: 'query' | 'body' | 'response';
}

export interface ApiItem {
  id: string;
  name: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  status: 'New' | 'Debugged' | 'To Test' | 'Published';
  lastCall: string;

  // 下面字段仅在详情接口中返回，用于接口文档/Mock
  requestHeaders?: ApiHeaderRow[] | null;
  requestParams?: ApiSchemaRow[] | null;
  responseHeaders?: ApiHeaderRow[] | null;
  responseSchema?: ApiSchemaRow[] | null;
  mockStaticBody?: string | null;
  mockScript?: string | null;
  mockMode?: ApiMockMode | null;
  mockProxyUrl?: string | null;
}

export interface PublicAsset {
  id: string;
  name: string;
  value: string;
  type: string;
  category: string;
}

export interface AssetSuggestion {
  id: string;
  name: string;
  value: string;
  type: string;
  category: string;
  source: string;
  count: number;
  confidence: number;
}

export type ProjectRole = string;
export type ProjectMemberStatus = 'Active' | 'Inactive';
export type ProjectPermissionKey =
  | 'project.view'
  | 'project.update'
  | 'project.delete'
  | 'api.view'
  | 'api.create'
  | 'api.update'
  | 'api.delete'
  | 'api.proxy'
  | 'asset.view'
  | 'asset.create'
  | 'asset.update'
  | 'asset.delete'
  | 'asset.suggestion.accept'
  | 'asset.suggestion.ignore'
  | 'team.view'
  | 'team.invite'
  | 'team.member.update'
  | 'team.member.remove'
  | 'team.invitation.revoke'
  | 'role.view'
  | 'role.update';

export interface ProjectMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  company?: string | null;
  role: ProjectRole;
  status: ProjectMemberStatus;
  isOwner: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectInvitation {
  id: string;
  projectId: string;
  projectName: string;
  organizationName: string;
  email: string;
  role: Exclude<ProjectRole, 'Owner'>;
  status: 'Pending' | 'Accepted' | 'Revoked' | 'Expired';
  token: string;
  inviteLink: string;
  inviteMessage: string;
  invitedByEmail: string;
  invitedByName: string;
  expiresAt: string;
  acceptedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMembersResponse {
  currentUserRole: ProjectRole;
  members: ProjectMember[];
  invitations: ProjectInvitation[];
}

export interface ProjectRoleDefinition {
  roleKey: string;
  name: string;
  description?: string | null;
  systemRole: boolean;
  locked: boolean;
  sortOrder: number;
  permissions: ProjectPermissionKey[];
}

export interface ProjectRolePermissionsResponse {
  currentUserRole: ProjectRole;
  roles: ProjectRoleDefinition[];
  permissions: Record<string, ProjectPermissionKey[]>;
  permissionKeys: ProjectPermissionKey[];
  editableRoles: string[];
}

export interface ProxyGroup {
  id: string;
  name: string;
  regex: string;
  autoSave: boolean;
  mode: 'Mock' | 'Proxy' | 'Auto';
  rulesCount: number;
}

export const MOCK_APIS: ApiItem[] = [
  { id: '1', name: 'Get User Profile', path: '/api/v1/user/profile', method: 'GET', status: 'Published', lastCall: '2 mins ago' },
  { id: '2', name: 'Update Settings', path: '/api/v1/settings', method: 'POST', status: 'Debugged', lastCall: '1 hour ago' },
  { id: '3', name: 'Fetch Analytics', path: '/api/v1/stats', method: 'GET', status: 'To Test', lastCall: 'Never' },
  { id: '4', name: 'Delete Account', path: '/api/v1/user', method: 'DELETE', status: 'New', lastCall: 'Never' },
];

export const MOCK_PROXY_GROUPS: ProxyGroup[] = [
  { id: 'g1', name: 'User Service', regex: '^/usr/.*', autoSave: true, mode: 'Auto', rulesCount: 12 },
  { id: 'g2', name: 'App Core', regex: '^/app/.*', autoSave: false, mode: 'Proxy', rulesCount: 5 },
  { id: 'g3', name: 'Legacy API', regex: '^/old/.*', autoSave: true, mode: 'Mock', rulesCount: 8 },
];
