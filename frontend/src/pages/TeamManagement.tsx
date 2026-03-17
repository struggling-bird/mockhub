import React from 'react';
import { Users, Mail, Shield, MoreVertical, Plus, Search } from 'lucide-react';

const TeamManagement: React.FC = () => {
  const members = [
    { name: 'Dong S.', email: 'dong.stupidboy@gmail.com', role: 'Admin', status: 'Active', avatar: 'DS' },
    { name: 'Sarah Miller', email: 'sarah.m@example.com', role: 'Editor', status: 'Active', avatar: 'SM' },
    { name: 'James Wilson', email: 'james.w@example.com', role: 'Viewer', status: 'Inactive', avatar: 'JW' },
    { name: 'Elena Rodriguez', email: 'elena.r@example.com', role: 'Editor', status: 'Active', avatar: 'ER' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Team Members</h2>
          <p className="text-xs text-slate-500">Manage access and permissions for your project collaborators.</p>
        </div>
        <button className="flex items-center gap-2 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-slate-800 transition-colors">
          <Plus size={14} />
          Invite Member
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-3 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
            <input 
              type="text" 
              placeholder="Filter members..." 
              className="w-full pl-8 pr-3 py-1 bg-white border border-slate-200 rounded-lg text-[11px] focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 font-medium">Total: {members.length}</span>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {members.map((member, i) => (
            <div key={i} className="p-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs border border-slate-200">
                  {member.avatar}
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-900">{member.name}</h4>
                  <p className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Mail size={10} /> {member.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-1.5">
                  <Shield size={12} className="text-slate-400" />
                  <span className="text-[11px] font-medium text-slate-700">{member.role}</span>
                </div>
                <div className="w-20">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${
                    member.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'
                  }`}>
                    {member.status}
                  </span>
                </div>
                <button className="text-slate-400 hover:text-slate-600">
                  <MoreVertical size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeamManagement;
