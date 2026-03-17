import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'zh';

interface Translations {
  [key: string]: {
    [key in Language]: string;
  };
}

export const translations: Translations = {
  // Global / App
  appName: { en: 'MockDev Platform', zh: 'MockDev 平台' },
  appBrand: { en: 'MockDev', zh: 'MockDev' },
  appTagline: { en: 'Enterprise Mock Platform', zh: '企业级 Mock 平台' },
  moduleUnderDevelopment: { en: 'Module under development', zh: '模块开发中' },
  moduleComingSoon: {
    en: 'This feature will be available in the next release.',
    zh: '该功能将在下一个版本中提供。',
  },

  // Sidebar
  dashboard: { en: 'Dashboard', zh: '仪表盘' },
  apis: { en: 'API Management', zh: '接口管理' },
  proxies: { en: 'Proxy Rules', zh: '代理规则' },
  assets: { en: 'Public Assets', zh: '公共资产' },
  team: { en: 'Team Members', zh: '团队成员' },
  stats: { en: 'Analytics', zh: '统计分析' },
  settings: { en: 'Settings', zh: '设置' },
  projects: { en: 'Projects', zh: '项目管理' },

  // Auth
  login: { en: 'Login', zh: '登录' },
  register: { en: 'Register', zh: '注册' },
  email: { en: 'Email', zh: '邮箱' },
  password: { en: 'Password', zh: '密码' },
  username: { en: 'Username', zh: '用户名' },
  company: { en: 'Company', zh: '公司名称' },
  companyPlaceholder: { en: 'Acme Corp', zh: '示例公司' },
  usernamePlaceholder: { en: 'johndoe', zh: '张三' },
  emailPlaceholder: { en: 'name@company.com', zh: 'name@company.com' },
  noAccount: { en: "Don't have an account?", zh: '没有账号？' },
  hasAccount: { en: 'Already have an account?', zh: '已有账号？' },
  welcomeBack: { en: 'Welcome Back', zh: '欢迎回来' },
  createAccount: { en: 'Create Account', zh: '创建账号' },

  // Dashboard
  totalApis: { en: 'Total APIs', zh: '接口总数' },
  activeProxies: { en: 'Active Proxies', zh: '活跃代理' },
  requestsHr: { en: 'Requests/hr', zh: '请求数/小时' },
  recentActivity: { en: 'Recent Activity', zh: '最近动态' },
  systemStatus: { en: 'System Status', zh: '系统状态' },
  viewAll: { en: 'View All', zh: '查看全部' },
  activityExample: {
    en: 'Alex Chen updated mock data for /api/v1/user',
    zh: 'Alex Chen 更新了 /api/v1/user 的 Mock 数据',
  },
  activityTimeAgo: { en: '14 minutes ago', zh: '14 分钟前' },
  statusProxyEngine: { en: 'Proxy Engine', zh: '代理引擎' },
  statusMockStorage: { en: 'Mock Storage', zh: 'Mock 存储' },
  statusAuthService: { en: 'Auth Service', zh: '认证服务' },
  statusOperational: { en: 'OPERATIONAL', zh: '运行正常' },
  statusLatency: { en: 'LATENCY', zh: '延迟' },
  teamTipTitle: { en: 'Team Tip', zh: '团队小贴士' },
  teamTipDesc: {
    en: 'Use Script Mode to simulate dynamic responses like pagination or time-based tokens.',
    zh: '使用脚本模式可以模拟分页或基于时间的令牌等动态响应。',
  },
  teamTipCta: { en: 'Read Documentation', zh: '查看文档' },
  scriptMode: { en: 'Script Mode', zh: '脚本模式' },

  // Projects
  myProjects: { en: 'My Projects', zh: '我的项目' },
  createProject: { en: 'Create Project', zh: '创建项目' },
  joinProject: { en: 'Join Project', zh: '加入项目' },
  projectName: { en: 'Project Name', zh: '项目名称' },
  projectDesc: { en: 'Description', zh: '项目描述' },
  editProject: { en: 'Edit Project', zh: '编辑项目' },
  editProjectSubtitle: {
    en: 'Update project settings and configuration.',
    zh: '更新项目设置和配置。',
  },
  createProjectSubtitle: {
    en: 'Set up a new workspace for your team.',
    zh: '为团队创建新的工作空间。',
  },
  mockKey: { en: 'Mock Key', zh: 'Mock 密钥' },
  copyKey: { en: 'Copy Key', zh: '复制密钥' },
  proxyInstructions: { en: 'Proxy Instructions', zh: '代理使用说明' },
  headerRequired: { en: 'Include this key in your request headers as "x-mock-key"', zh: '在请求头中包含 "x-mock-key" 字段并填入此密钥' },
  owner: { en: 'Owner', zh: '创建人' },
  members: { en: 'Members', zh: '成员' },
  projectLogo: { en: 'Project Logo', zh: '项目 Logo' },
  projectLogoDesc: {
    en: 'Upload a custom logo for your project. Recommended size: 256x256px.',
    zh: '为项目上传自定义 Logo，推荐尺寸：256x256 像素。',
  },
  projectLogoUploading: { en: 'Uploading logo...', zh: 'Logo 上传中…' },
  projectLogoPlaceholder: {
    en: 'Or paste a logo URL here...',
    zh: '或在此粘贴 Logo 的 URL...',
  },
  projectNamePlaceholder: {
    en: 'e.g. Payment Gateway Mock',
    zh: '例如：支付网关 Mock',
  },
  projectDescPlaceholder: {
    en: 'Briefly describe the purpose of this project...',
    zh: '简单描述该项目的用途...',
  },
  initialMembers: { en: 'Initial Members', zh: '初始成员数' },
  membersJustMe: { en: 'Just me', zh: '仅我自己' },
  membersSmallTeam: { en: 'Small Team (3+)', zh: '小团队（3+）' },
  membersLargeTeam: { en: 'Large Team (10+)', zh: '大团队（10+）' },
  proxyUrl: { en: 'Proxy URL', zh: '代理地址' },
  proxyUrlPlaceholder: {
    en: 'https://proxy.example.com',
    zh: 'https://proxy.example.com',
  },
  cancel: { en: 'Cancel', zh: '取消' },
  saveCreateProject: { en: 'Create Project', zh: '创建项目' },
  saveUpdateProject: { en: 'Update Project', zh: '更新项目' },
  projectSaveError: { en: 'Network error, failed to save project', zh: '网络异常，无法保存项目' },
  projectLogoUploadError: { en: 'Network error, logo upload failed', zh: '网络异常，Logo 上传失败' },

  // Public Assets
  publicAssetsTitle: { en: 'Public Assets', zh: '公共资产' },
  publicAssetsDesc: {
    en: 'Shared definitions and infrastructure endpoints for your project.',
    zh: '项目中共享的定义和基础设施端点。',
  },
  publicAssetsAdd: { en: 'Add Asset', zh: '新增资产' },
  assetsCategoryInfrastructure: { en: 'Infrastructure', zh: '基础设施' },
  assetsCategoryDefinitions: { en: 'Definitions', zh: '定义' },
  assetsNameAuthEndpoint: { en: 'Auth Endpoint', zh: '认证服务地址' },
  assetsNameUserRoles: { en: 'User Roles', zh: '用户角色' },
  assetsNameErrorCodes: { en: 'Error Codes', zh: '错误码' },
  assetsNameCdnBase: { en: 'CDN Base', zh: 'CDN 基地址' },
  publicAssetsEmptyTitle: { en: 'Centralize your constants', zh: '集中管理你的常量' },
  publicAssetsEmptyDesc: {
    en: 'Define enums, base URLs, and shared schemas here to ensure consistency across all your mock endpoints.',
    zh: '在此维护枚举、基础 URL 和共享 Schema，保证所有 Mock 接口的一致性。',
  },

  // Selectable input
  selectableSearchPlaceholder: { en: 'Search...', zh: '搜索...' },
  selectableNoMatch: { en: 'No matches found.', zh: '未找到匹配项。' },
  selectableUseValue: { en: 'Use "{value}"', zh: '使用 “{value}”' },

  // API Table / Interface management
  interfacesTitle: { en: 'Interfaces', zh: '接口列表' },
  interfacesSearchPlaceholder: { en: 'Search APIs...', zh: '搜索接口...' },
  interfacesNew: { en: 'New Interface', zh: '新建接口' },
  basicInfoTitle: { en: 'Basic Information', zh: '基础信息' },
  interfaceNameLabel: { en: 'Interface Name', zh: '接口名称' },
  endpointPathLabel: { en: 'Endpoint Path', zh: '接口路径' },
  responseModeLabel: { en: 'Response Mode', zh: '响应模式' },
  responseModeStatic: { en: 'Static Mock', zh: '静态 Mock' },
  responseModeScript: { en: 'Dynamic Script', zh: '动态脚本' },
  responseModeProxy: { en: 'Real Proxy', zh: '真实代理' },
  proxyUrlSelectPlaceholder: {
    en: 'Select or enter target URL...',
    zh: '选择或输入目标 URL...',
  },
  tabsHeaders: { en: 'Headers', zh: '请求头' },
  tabsParams: { en: 'Request Params', zh: '请求参数' },
  tabsResponseHeaders: { en: 'Response Headers', zh: '响应头' },
  tabsResponse: { en: 'Response', zh: '响应结构' },
  tabsMock: { en: 'Mock', zh: 'Mock 配置' },
  schemaQueryTitle: { en: 'Query Parameters Schema', zh: '查询参数结构' },
  schemaBodyTitle: {
    en: 'Request Body Schema (JSON)',
    zh: '请求体结构（JSON）',
  },
  schemaAddField: { en: 'Add Field', zh: '新增字段' },
  schemaFieldName: { en: 'Field Name', zh: '字段名' },
  schemaType: { en: 'Type', zh: '类型' },
  schemaRequired: { en: 'Required', zh: '必填' },
  schemaDescription: { en: 'Description', zh: '说明' },
  schemaViewTable: { en: 'Table View', zh: '表格视图' },
  schemaViewJson: { en: 'JSON View', zh: 'JSON 视图' },
  schemaJsonInvalid: {
    en: 'Invalid JSON format, please check.',
    zh: 'JSON 格式有误，请检查后重试。',
  },
  schemaJsonFormat: { en: 'Format JSON', zh: '格式化 JSON' },
  schemaJsonPreview: { en: 'Highlighted Preview', zh: '高亮预览' },
  schemaJsonSynced: {
    en: 'Auto-synced from table view.',
    zh: '已自动从表格视图同步。',
  },
  schemaJsonDirty: {
    en: 'JSON modified. Blur to validate and apply.',
    zh: 'JSON 已修改，失焦后校验并应用。',
  },
  schemaJsonApplied: {
    en: 'JSON validated and applied.',
    zh: 'JSON 校验通过并已应用。',
  },
  headersRequestTitle: { en: 'Request Headers', zh: '请求头' },
  headersKey: { en: 'Key', zh: '键名' },
  headersValue: { en: 'Value', zh: '取值' },
  responseHeadersTitle: { en: 'Response Headers', zh: '响应头' },
  responseSchemaTitle: { en: 'Response Schema', zh: '响应结构' },
  responseSchemaField: { en: 'Field', zh: '字段' },
  responseSchemaDescShort: { en: 'Desc', zh: '说明' },
  mockStaticPreviewTitle: { en: 'Static JSON Preview', zh: '静态 JSON 预览' },
  mockProxyBadge: { en: 'Proxy Mode Active', zh: '代理模式已启用' },
  mockProxyTitle: { en: 'Proxy Mode Active', zh: '代理模式已启用' },
  mockProxyDesc: {
    en: 'This interface is currently configured to forward requests to',
    zh: '该接口当前将请求转发至',
  },
  mockProxySwitchToMock: {
    en: 'Switch to Mock Mode',
    zh: '切换到 Mock 模式',
  },
  mockProxyRun: { en: 'Run Interface', zh: '运行接口' },
  mockDynamicTitle: {
    en: 'Dynamic Mock Script (Node.js)',
    zh: '动态 Mock 脚本（Node.js）',
  },
  mockDynamicLive: { en: 'Live Execution', zh: '实时执行' },
  mockNoSelectionTitle: {
    en: 'No Interface Selected',
    zh: '未选择接口',
  },
  mockNoSelectionDesc: {
    en: 'Select an interface from the left to view or edit details.',
    zh: '在左侧选择一个接口以查看或编辑详情。',
  },
  interfaceUpdatedAgo: {
    en: 'Updated 2h ago',
    zh: '2 小时前更新',
  },
  interfaceSaveChanges: { en: 'Save Changes', zh: '保存修改' },
  apisNoProject: { en: 'No project selected', zh: '未选择项目' },
  apisSelectProject: { en: 'Select a project in the header to manage APIs.', zh: '请在顶部选择一个项目以管理接口。' },
  apisLoading: { en: 'Loading...', zh: '加载中...' },
  apisEmpty: { en: 'No interfaces yet', zh: '暂无接口' },
  apisEmptyHint: { en: 'Click "New Interface" to add one.', zh: '点击「新建接口」添加。' },
  lastCallNever: { en: 'Never', zh: '从未' },
  apiNewTitle: { en: 'New Interface', zh: '新建接口' },
  apiNewName: { en: 'Name', zh: '名称' },
  apiNewPath: { en: 'Path', zh: '路径' },
  apiCreate: { en: 'Create', zh: '创建' },
  saveSuccess: { en: 'Saved', zh: '已保存' },
  deleteSuccess: { en: 'Deleted', zh: '已删除' },

  // Proxy config
  proxyGroupsTitle: { en: 'Proxy Groups', zh: '代理分组' },
  proxyGroupsDesc: {
    en: 'Manage regex-based routing and automatic mock generation.',
    zh: '管理基于正则的路由和自动 Mock 生成。',
  },
  proxyGroupsAdd: { en: 'Add Group', zh: '新增分组' },
  proxyAutoSave: { en: 'Auto-save', zh: '自动保存' },
  proxyAutoSaveOn: { en: 'On', zh: '开' },
  proxyAutoSaveOff: { en: 'Off', zh: '关' },
  proxyRulesCount: { en: 'Rules', zh: '条规则' },
  proxyGlobalTitle: { en: 'Global Proxy Server', zh: '全局代理服务' },
  proxyGlobalDesc: {
    en: 'Your project proxy is active at:',
    zh: '项目代理服务已启动，地址为：',
  },
  proxyCopyUrl: { en: 'Copy URL', zh: '复制地址' },
  proxyRestart: { en: 'Restart Server', zh: '重启服务' },

  // Team management
  teamMembersTitle: { en: 'Team Members', zh: '团队成员' },
  teamMembersDesc: {
    en: 'Manage access and permissions for your project collaborators.',
    zh: '管理项目协作者的访问与权限。',
  },
  teamInviteMember: { en: 'Invite Member', zh: '邀请成员' },
  teamFilterPlaceholder: { en: 'Filter members...', zh: '筛选成员...' },
  teamTotal: { en: 'Total:', zh: '共计：' },
  teamRoleLabel: { en: 'Role', zh: '角色' },
  teamStatusActive: { en: 'Active', zh: '活跃' },
  teamStatusInactive: { en: 'Inactive', zh: '停用' },

  // Project management
  projectsDesc: {
    en: 'Manage your development environments and team access.',
    zh: '管理开发环境及团队访问权限。',
  },
  projectsEnter: { en: 'Enter', zh: '进入' },
  projectsLoading: { en: 'Loading projects...', zh: '项目加载中...' },
  projectsLoadError: { en: 'Failed to load project list', zh: '加载项目列表失败' },
  projectsNetworkError: {
    en: 'Network error, unable to load project list',
    zh: '网络异常，无法加载项目列表',
  },
  projectNoDescription: { en: 'No description', zh: '暂无描述' },
  projectStatusActive: { en: 'Active', zh: '活跃' },
  projectCurrentUser: { en: 'You', zh: '你' },
  projectRename: { en: 'Rename', zh: '重命名' },
  projectRenamePrompt: { en: 'Rename project', zh: '重命名项目' },
  projectRenameFailed: { en: 'Network error, rename failed', zh: '网络异常，重命名失败' },
  projectDelete: { en: 'Delete', zh: '删除' },
  projectDeleteConfirm: {
    en: 'Are you sure you want to delete this project?',
    zh: '确定要删除该项目吗？',
  },
  projectDeleteFailed: { en: 'Network error, delete failed', zh: '网络异常，删除失败' },

  // Mock editor
  mockEditorTitle: { en: 'Edit Mock Data', zh: '编辑 Mock 数据' },
  mockEditorJsonTab: { en: 'JSON', zh: 'JSON' },
  mockEditorScriptTab: { en: 'SCRIPT', zh: '脚本' },
  mockEditorCopy: { en: 'Copy', zh: '复制' },
  mockEditorCopied: { en: 'Copied', zh: '已复制' },
  mockEditorTestRun: { en: 'Test Run', zh: '测试运行' },
  mockEditorLastSaved: {
    en: 'Last saved: Today at 14:22',
    zh: '上次保存：今天 14:22',
  },
  mockEditorCancel: { en: 'Cancel', zh: '取消' },
  mockEditorSaveChanges: { en: 'Save Changes', zh: '保存修改' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('zh');

  const t = (key: string) => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
