import React, { useEffect, useMemo, useState } from 'react';
import { Check, Copy, Mail, Plus, Search, Shield, Trash2, Users, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import type {
  ProjectInvitation,
  ProjectMember,
  ProjectMembersResponse,
  ProjectMemberStatus,
  ProjectPermissionKey,
  ProjectRole,
  ProjectRoleDefinition,
  ProjectRolePermissionsResponse,
} from '../../types';
import { request } from '../../utils/http';

const statuses: ProjectMemberStatus[] = ['Active', 'Inactive'];
const teamTabs = ['members', 'invitations', 'roles'] as const;

const roleLabelKey = (role: ProjectRole) => {
  if (role === 'Owner') return 'teamRoleOwner';
  if (role === 'Admin') return 'teamRoleAdmin';
  if (role === 'Editor') return 'teamRoleEditor';
  return 'teamRoleViewer';
};

const statusLabelKey = (status: ProjectMemberStatus) => (
  status === 'Active' ? 'teamStatusActive' : 'teamStatusInactive'
);

const initials = (member: ProjectMember) => {
  const source = member.name || member.email;
  const parts = source.split(/[\s._-]+/).filter(Boolean);
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'U';
};

const permissionGroups: {
  groupKey: string;
  items: { key: ProjectPermissionKey; labelKey: string }[];
}[] = [
  {
    groupKey: 'teamPermissionGroupProject',
    items: [
      { key: 'project.view', labelKey: 'permissionProjectView' },
      { key: 'project.update', labelKey: 'permissionProjectUpdate' },
      { key: 'project.delete', labelKey: 'permissionProjectDelete' },
    ],
  },
  {
    groupKey: 'teamPermissionGroupApi',
    items: [
      { key: 'api.view', labelKey: 'permissionApiView' },
      { key: 'api.create', labelKey: 'permissionApiCreate' },
      { key: 'api.update', labelKey: 'permissionApiUpdate' },
      { key: 'api.delete', labelKey: 'permissionApiDelete' },
      { key: 'api.proxy', labelKey: 'permissionApiProxy' },
    ],
  },
  {
    groupKey: 'teamPermissionGroupAsset',
    items: [
      { key: 'asset.view', labelKey: 'permissionAssetView' },
      { key: 'asset.create', labelKey: 'permissionAssetCreate' },
      { key: 'asset.update', labelKey: 'permissionAssetUpdate' },
      { key: 'asset.delete', labelKey: 'permissionAssetDelete' },
      { key: 'asset.suggestion.accept', labelKey: 'permissionAssetSuggestionAccept' },
      { key: 'asset.suggestion.ignore', labelKey: 'permissionAssetSuggestionIgnore' },
    ],
  },
  {
    groupKey: 'teamPermissionGroupTeam',
    items: [
      { key: 'team.view', labelKey: 'permissionTeamView' },
      { key: 'team.invite', labelKey: 'permissionTeamInvite' },
      { key: 'team.member.update', labelKey: 'permissionTeamMemberUpdate' },
      { key: 'team.member.remove', labelKey: 'permissionTeamMemberRemove' },
      { key: 'team.invitation.revoke', labelKey: 'permissionTeamInvitationRevoke' },
    ],
  },
  {
    groupKey: 'teamPermissionGroupRole',
    items: [
      { key: 'role.view', labelKey: 'permissionRoleView' },
      { key: 'role.update', labelKey: 'permissionRoleUpdate' },
    ],
  },
];

const TeamManagement: React.FC = () => {
  const { t } = useLanguage();
  const projectId = window.localStorage.getItem('mockhub_project_id');
  const [activeTab, setActiveTab] = useState<typeof teamTabs[number]>('members');
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [invitations, setInvitations] = useState<ProjectInvitation[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<ProjectRole>('Viewer');
  const [roleDefinitions, setRoleDefinitions] = useState<ProjectRoleDefinition[]>([]);
  const [selectedRoleKey, setSelectedRoleKey] = useState('Admin');
  const [roleDraftName, setRoleDraftName] = useState('');
  const [roleDraftDescription, setRoleDraftDescription] = useState('');
  const [roleDraftPermissions, setRoleDraftPermissions] = useState<ProjectPermissionKey[]>([]);
  const [query, setQuery] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<ProjectRole>('Editor');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingPermissions, setSavingPermissions] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');
  const [permissionSaved, setPermissionSaved] = useState(false);

  const currentRoleDefinition = roleDefinitions.find((item) => item.roleKey === currentUserRole);
  const currentPermissions = currentRoleDefinition?.permissions || [];
  const canManage = currentUserRole === 'Owner' || currentPermissions.some((item) =>
    ['team.invite', 'team.member.update', 'team.member.remove', 'team.invitation.revoke'].includes(item),
  );
  const canEditPermissions = currentUserRole === 'Owner';
  const assignableRoles = roleDefinitions.filter((item) => item.roleKey !== 'Owner');
  const selectedRole = roleDefinitions.find((item) => item.roleKey === selectedRoleKey) || roleDefinitions[0];

  const roleDisplayName = (roleKey: ProjectRole) => {
    const definition = roleDefinitions.find((item) => item.roleKey === roleKey);
    return definition?.name || t(roleLabelKey(roleKey));
  };

  const applyTeam = (data: ProjectMembersResponse) => {
    setMembers(data.members);
    setInvitations(data.invitations || []);
    setCurrentUserRole(data.currentUserRole);
  };

  const loadMembers = async () => {
    if (!projectId) {
      setMembers([]);
      setInvitations([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await request<ProjectMembersResponse>(`/api/projects/${projectId}/members`);
      applyTeam(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('teamLoadFailed'));
      setMembers([]);
      setInvitations([]);
    } finally {
      setLoading(false);
    }
  };

  const applyRoles = (data: ProjectRolePermissionsResponse) => {
    setRoleDefinitions(data.roles || []);
    const nextSelected =
      data.roles.find((item) => item.roleKey === selectedRoleKey) ||
      data.roles.find((item) => item.roleKey !== 'Owner') ||
      data.roles[0];
    if (nextSelected) {
      setSelectedRoleKey(nextSelected.roleKey);
      setRoleDraftName(nextSelected.name);
      setRoleDraftDescription(nextSelected.description || '');
      setRoleDraftPermissions(nextSelected.permissions || []);
      if (!data.roles.some((item) => item.roleKey === role) && nextSelected.roleKey !== 'Owner') {
        setRole(nextSelected.roleKey);
      }
    }
  };

  const loadRolePermissions = async () => {
    if (!projectId) return;
    try {
      const data = await request<ProjectRolePermissionsResponse>(
        `/api/projects/${projectId}/members/roles`,
      );
      applyRoles(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('teamLoadFailed'));
    }
  };

  useEffect(() => {
    loadMembers();
    loadRolePermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  useEffect(() => {
    if (activeTab === 'roles') {
      loadRolePermissions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, projectId]);

  const filteredMembers = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return members;
    return members.filter((member) =>
      [member.name, member.email, roleDisplayName(member.role), member.status, member.company || '']
        .join(' ')
        .toLowerCase()
        .includes(keyword),
    );
  }, [members, query, roleDefinitions]);

  const copyInvite = async (invitation: Pick<ProjectInvitation, 'id' | 'inviteMessage'>) => {
    await navigator.clipboard.writeText(invitation.inviteMessage).catch(() => {});
    setCopied(invitation.id);
    window.setTimeout(() => setCopied(''), 1600);
  };

  const inviteMember = async () => {
    if (!projectId || !email.trim() || saving) return;
    setSaving(true);
    try {
      const data = await request<{
        invitation: ProjectInvitation;
        inviteMessage: string;
        team: ProjectMembersResponse;
      }>(`/api/projects/${projectId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), role }),
      });
      applyTeam(data.team);
      await copyInvite({ id: data.invitation.id, inviteMessage: data.inviteMessage });
      setEmail('');
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('teamSaveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const updateMember = async (member: ProjectMember, patch: Partial<Pick<ProjectMember, 'role' | 'status'>>) => {
    if (!projectId || member.isOwner || saving) return;
    setSaving(true);
    try {
      const data = await request<ProjectMembersResponse>(`/api/projects/${projectId}/members/${member.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      applyTeam(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('teamSaveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const removeMember = async (member: ProjectMember) => {
    if (!projectId || member.isOwner || saving) return;
    if (!window.confirm(t('teamRemoveConfirm'))) return;
    setSaving(true);
    try {
      await request(`/api/projects/${projectId}/members/${member.id}`, { method: 'DELETE' });
      await loadMembers();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('teamSaveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const revokeInvitation = async (invitation: ProjectInvitation) => {
    if (!projectId || saving) return;
    if (!window.confirm(t('teamRevokeConfirm'))) return;
    setSaving(true);
    try {
      const data = await request<ProjectMembersResponse>(
        `/api/projects/${projectId}/members/invitations/${invitation.id}`,
        { method: 'DELETE' },
      );
      applyTeam(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('teamSaveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const togglePermission = (permission: ProjectPermissionKey) => {
    if (!canEditPermissions || selectedRole?.locked) return;
    setPermissionSaved(false);
    setRoleDraftPermissions((current) => {
      const next = new Set(current);
      if (next.has(permission)) {
        next.delete(permission);
      } else {
        next.add(permission);
      }
      return Array.from(next);
    });
  };

  const saveCurrentRole = async () => {
    if (!projectId || !selectedRole || savingPermissions || !canEditPermissions) return;
    setSavingPermissions(true);
    try {
      const data = await request<ProjectRolePermissionsResponse>(
        `/api/projects/${projectId}/members/roles/${selectedRole.roleKey}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: roleDraftName,
            description: roleDraftDescription,
            permissions: roleDraftPermissions,
          }),
        },
      );
      applyRoles(data);
      setPermissionSaved(true);
      setError('');
      await loadMembers();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('teamSaveFailed'));
    } finally {
      setSavingPermissions(false);
    }
  };

  const createRole = async () => {
    if (!projectId || savingPermissions || !canEditPermissions) return;
    setSavingPermissions(true);
    try {
      const data = await request<ProjectRolePermissionsResponse>(`/api/projects/${projectId}/members/roles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: t('teamNewRoleName'),
          description: '',
          copyFromRoleKey: selectedRole?.roleKey || 'Viewer',
        }),
      });
      applyRoles(data);
      setPermissionSaved(false);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('teamSaveFailed'));
    } finally {
      setSavingPermissions(false);
    }
  };

  const copyRole = async () => {
    if (!projectId || !selectedRole || savingPermissions || !canEditPermissions) return;
    setSavingPermissions(true);
    try {
      const data = await request<ProjectRolePermissionsResponse>(
        `/api/projects/${projectId}/members/roles/${selectedRole.roleKey}/copy`,
        { method: 'POST' },
      );
      applyRoles(data);
      setPermissionSaved(false);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('teamSaveFailed'));
    } finally {
      setSavingPermissions(false);
    }
  };

  const deleteRole = async () => {
    if (!projectId || !selectedRole || selectedRole.systemRole || savingPermissions || !canEditPermissions) return;
    if (!window.confirm(t('teamDeleteRoleConfirm'))) return;
    setSavingPermissions(true);
    try {
      const data = await request<ProjectRolePermissionsResponse>(
        `/api/projects/${projectId}/members/roles/${selectedRole.roleKey}`,
        { method: 'DELETE' },
      );
      applyRoles(data);
      setPermissionSaved(false);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('teamSaveFailed'));
    } finally {
      setSavingPermissions(false);
    }
  };

  const renderTabs = () => (
    <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
      {teamTabs.map((tab) => {
        const label =
          tab === 'members' ? t('teamMembersTab') :
          tab === 'invitations' ? t('teamInvitesTab') :
          t('teamRolesTab');
        const count = tab === 'members' ? members.length : tab === 'invitations' ? invitations.length : '';
        return (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`rounded-md px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
              activeTab === tab ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {label}
            {count !== '' ? <span className="ml-1 text-[10px] text-slate-400">{count}</span> : null}
          </button>
        );
      })}
    </div>
  );

  const renderMemberManagement = () => (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="hidden grid-cols-12 gap-3 border-b border-slate-100 bg-slate-50 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 md:grid">
        <div className="col-span-5">{t('members')}</div>
        <div className="col-span-2">{t('teamRoleLabel')}</div>
        <div className="col-span-2">{t('teamStatusLabel')}</div>
        <div className="col-span-3 text-right">{canManage ? t('publicAssetsColumnActions') : ''}</div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-400">{t('teamLoading')}</div>
      ) : filteredMembers.length > 0 ? (
        <div className="divide-y divide-slate-100">
          {filteredMembers.map((member) => (
            <div key={member.id} className="grid grid-cols-12 items-center gap-3 px-3 py-2 hover:bg-slate-50">
              <div className="col-span-12 min-w-0 md:col-span-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-xs font-bold text-slate-600">
                    {initials(member)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="truncate text-xs font-semibold text-slate-900">{member.name}</h4>
                    <p className="flex items-center gap-1 truncate text-[10px] text-slate-500">
                      <Mail size={10} /> {member.email}
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-span-6 flex items-center gap-1.5 md:col-span-2">
                <Shield size={12} className="text-slate-400" />
                {canManage && !member.isOwner ? (
                  <select
                    value={member.role}
                    onChange={(event) => updateMember(member, { role: event.target.value as ProjectRole })}
                    disabled={saving}
                    className="rounded border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {assignableRoles.map((item) => (
                      <option key={item.roleKey} value={item.roleKey}>{item.name}</option>
                    ))}
                  </select>
                ) : (
                  <span className="text-[11px] font-medium text-slate-700">{roleDisplayName(member.role)}</span>
                )}
              </div>

              <div className="col-span-6 md:col-span-2">
                {canManage && !member.isOwner ? (
                  <select
                    value={member.status}
                    onChange={(event) => updateMember(member, { status: event.target.value as ProjectMemberStatus })}
                    disabled={saving}
                    className="rounded border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {statuses.map((item) => (
                      <option key={item} value={item}>{t(statusLabelKey(item))}</option>
                    ))}
                  </select>
                ) : (
                  <span className={`rounded-full border px-1.5 py-0.5 text-[9px] font-bold ${
                    member.status === 'Active'
                      ? 'border-emerald-100 bg-emerald-50 text-emerald-600'
                      : 'border-slate-100 bg-slate-50 text-slate-400'
                  }`}>
                    {t(statusLabelKey(member.status))}
                  </span>
                )}
              </div>

              <div className="col-span-12 flex justify-end md:col-span-3">
                {canManage && !member.isOwner ? (
                  <button
                    type="button"
                    onClick={() => removeMember(member)}
                    disabled={saving}
                    className="flex items-center gap-1 rounded border border-rose-100 px-2 py-1 text-[10px] font-bold text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                  >
                    <Trash2 size={12} />
                    {t('teamRemove')}
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-400">
            <Users size={20} />
          </div>
          <h4 className="text-sm font-semibold text-slate-900">{t('teamEmptyTitle')}</h4>
          <p className="mt-1 max-w-sm text-xs text-slate-500">{t('teamEmptyDesc')}</p>
        </div>
      )}
    </div>
  );

  const renderInvitationManagement = () => (
    <div className="space-y-4">
      {canManage ? (
        <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-3">
          <div className="grid grid-cols-1 gap-2 md:grid-cols-12">
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 md:col-span-6"
              placeholder={t('teamMemberEmailPlaceholder')}
            />
            <select
              value={role}
              onChange={(event) => setRole(event.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer md:col-span-3"
            >
              {assignableRoles.map((item) => (
                <option key={item.roleKey} value={item.roleKey}>{item.name}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={inviteMember}
              disabled={saving || !email.trim()}
              className="flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer md:col-span-3"
            >
              <Plus size={14} />
              {t('teamAddMember')}
            </button>
          </div>
          <p className="text-[11px] text-slate-500">{t('teamInviteAcceptHint')}</p>
        </div>
      ) : (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
          {t('teamNoPermission')}
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-3 py-2">
          <h3 className="text-sm font-semibold text-slate-900">{t('teamInvitationsTitle')}</h3>
          <span className="text-[10px] font-medium text-slate-400">{invitations.length}</span>
        </div>
        {invitations.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {invitations.map((invitation) => (
              <div key={invitation.id} className="grid grid-cols-12 items-center gap-3 px-3 py-2 hover:bg-slate-50">
                <div className="col-span-12 min-w-0 md:col-span-5">
                  <div className="truncate text-xs font-semibold text-slate-900">{invitation.email}</div>
                  <div className="truncate text-[10px] text-slate-500">{invitation.inviteLink}</div>
                </div>
                <div className="col-span-4 text-xs font-medium text-slate-600 md:col-span-2">
                  {roleDisplayName(invitation.role)}
                </div>
                <div className="col-span-4 text-[10px] text-slate-400 md:col-span-2">
                  {new Date(invitation.expiresAt).toLocaleDateString()}
                </div>
                <div className="col-span-4 flex justify-end gap-2 md:col-span-3">
                  <button
                    type="button"
                    onClick={() => copyInvite(invitation)}
                    className="flex items-center gap-1 rounded border border-blue-100 px-2 py-1 text-[10px] font-bold text-blue-600 hover:bg-blue-50 cursor-pointer"
                  >
                    <Copy size={12} />
                    {t('teamCopyInvite')}
                  </button>
                  {canManage ? (
                    <button
                      type="button"
                      onClick={() => revokeInvitation(invitation)}
                      disabled={saving}
                      className="rounded border border-rose-100 px-2 py-1 text-[10px] font-bold text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                    >
                      {t('teamRevokeInvite')}
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-5 text-center text-xs text-slate-400">{t('teamInvitationsEmpty')}</div>
        )}
      </div>
    </div>
  );

  const renderRolePermissions = () => (
    <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-3 py-2">
          <h3 className="text-sm font-semibold text-slate-900">{t('teamRolesTab')}</h3>
          {canEditPermissions ? (
            <button
              type="button"
              onClick={createRole}
              disabled={savingPermissions}
              className="flex h-7 items-center gap-1 rounded-md bg-slate-900 px-2 text-[10px] font-bold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300 cursor-pointer"
            >
              <Plus size={12} />
              {t('teamCreateRole')}
            </button>
          ) : null}
        </div>
        <div className="divide-y divide-slate-100">
          {roleDefinitions.map((item) => (
            <button
              key={item.roleKey}
              type="button"
              onClick={() => {
                setSelectedRoleKey(item.roleKey);
                setRoleDraftName(item.name);
                setRoleDraftDescription(item.description || '');
                setRoleDraftPermissions(item.permissions || []);
                setPermissionSaved(false);
              }}
              className={`block w-full px-3 py-2 text-left transition-colors cursor-pointer ${
                selectedRole?.roleKey === item.roleKey ? 'bg-blue-50' : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-xs font-semibold text-slate-900">{item.name}</span>
                {item.systemRole ? (
                  <span className="rounded border border-slate-200 px-1.5 py-0.5 text-[9px] font-bold text-slate-400">
                    SYS
                  </span>
                ) : null}
              </div>
              <p className="mt-0.5 truncate text-[10px] text-slate-500">{item.description || item.roleKey}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="flex flex-col gap-2 border-b border-slate-100 bg-slate-50 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">{t('teamPermissionsTitle')}</h3>
            {!canEditPermissions ? (
              <p className="mt-0.5 text-[11px] text-slate-500">{t('teamPermissionsReadOnly')}</p>
            ) : null}
          </div>
          {canEditPermissions && selectedRole ? (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={copyRole}
                disabled={savingPermissions}
                className="h-8 rounded-md border border-slate-200 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {t('teamCopyRole')}
              </button>
              {!selectedRole.systemRole ? (
                <button
                  type="button"
                  onClick={deleteRole}
                  disabled={savingPermissions}
                  className="h-8 rounded-md border border-rose-100 px-3 text-xs font-semibold text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {t('teamDeleteRole')}
                </button>
              ) : null}
              <button
                type="button"
                onClick={saveCurrentRole}
                disabled={savingPermissions}
                className="h-8 rounded-md bg-slate-900 px-3 text-xs font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300 cursor-pointer"
              >
                {savingPermissions ? t('teamPermissionsSaving') : t('teamPermissionsSave')}
              </button>
            </div>
          ) : null}
        </div>
        {permissionSaved ? (
          <div className="border-b border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
            {t('teamPermissionsSaved')}
          </div>
        ) : null}
        {selectedRole ? (
          <div className="space-y-4 p-3">
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {t('teamRoleName')}
                </label>
                <input
                  value={roleDraftName}
                  onChange={(event) => setRoleDraftName(event.target.value)}
                  disabled={!canEditPermissions || selectedRole.locked}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-slate-50"
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {t('teamRoleDesc')}
                </label>
                <input
                  value={roleDraftDescription}
                  onChange={(event) => setRoleDraftDescription(event.target.value)}
                  disabled={!canEditPermissions || selectedRole.locked}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-slate-50"
                />
              </div>
            </div>

            <div className="divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-200">
              {permissionGroups.map((group) => (
                <div key={group.groupKey}>
                  <div className="bg-slate-50 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {t(group.groupKey)}
                  </div>
                  {group.items.map((row) => {
                    const allowed = selectedRole.locked || roleDraftPermissions.includes(row.key);
                    return (
                      <button
                        key={row.key}
                        type="button"
                        onClick={() => togglePermission(row.key)}
                        disabled={!canEditPermissions || selectedRole.locked}
                        className="flex w-full items-center justify-between border-t border-slate-100 px-3 py-2 text-left text-xs hover:bg-slate-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <span className="font-medium text-slate-600">{t(row.labelKey)}</span>
                        <span className={`flex h-6 w-6 items-center justify-center rounded border ${
                          allowed
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
                            : 'border-slate-200 bg-white text-slate-300'
                        }`}>
                          {allowed ? <Check size={13} /> : <X size={13} />}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-slate-400">{t('teamRolesEmpty')}</div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">{t('teamMembersTitle')}</h2>
          <p className="text-xs text-slate-500">{t('teamMembersDesc')}</p>
        </div>
        {activeTab === 'members' ? (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t('teamFilterPlaceholder')}
                className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-[11px] focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <span className="text-[10px] font-medium text-slate-400">
              {t('teamTotal')} {filteredMembers.length}
            </span>
          </div>
        ) : null}
      </div>

      {renderTabs()}

      {error ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
          {error}
        </div>
      ) : null}
      {copied ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
          {t('teamInviteCopied')}
        </div>
      ) : null}

      {activeTab === 'members' ? renderMemberManagement() : null}
      {activeTab === 'invitations' ? renderInvitationManagement() : null}
      {activeTab === 'roles' ? renderRolePermissions() : null}
    </div>
  );
};

export default TeamManagement;
