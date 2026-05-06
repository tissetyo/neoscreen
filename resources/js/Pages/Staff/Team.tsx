import StaffLayout from '@/Layouts/StaffLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, ShieldCheck, UserRound, Ban } from 'lucide-react';

interface TeamUser {
  id: string;
  name: string;
  email: string;
  role: 'manager' | 'frontoffice';
  is_suspended: boolean;
}

interface Props {
  slug: string;
  users: TeamUser[];
}

export default function Team({ slug, users }: Props) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'frontoffice' });

  const create = () => {
    router.post(`/${slug}/frontoffice/team`, form, {
      onSuccess: () => {
        setOpen(false);
        setForm({ name: '', email: '', password: '', role: 'frontoffice' });
      },
    });
  };

  return (
    <StaffLayout header="Team">
      <Head title="Team" />
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-medium text-slate-900">Hotel Team</h1>
            <p className="mt-1 text-sm text-slate-500">Create and suspend hotel manager or front-office accounts.</p>
          </div>
          <button onClick={() => setOpen(true)} className="flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700">
            <Plus size={16} /> Add User
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-medium uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(user => (
                <tr key={user.id}>
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium capitalize text-slate-700">
                      {user.role === 'manager' ? <ShieldCheck size={13} /> : <UserRound size={13} />}
                      {user.role.replace('frontoffice', 'front office')}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${user.is_suspended ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
                      {user.is_suspended ? 'Suspended' : 'Active'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button onClick={() => router.patch(`/${slug}/frontoffice/team/${user.id}/suspend`)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50">
                      <Ban size={13} /> {user.is_suspended ? 'Reactivate' : 'Suspend'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-[420px] rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-medium text-slate-900">Add Team Member</h2>
            <div className="mt-5 space-y-3">
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Full name" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-500" />
              <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email" type="email" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-500" />
              <input value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Temporary password" type="password" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-500" />
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-500">
                <option value="frontoffice">Front Office</option>
                <option value="manager">Manager</option>
              </select>
            </div>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setOpen(false)} className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-medium text-slate-600">Cancel</button>
              <button onClick={create} disabled={!form.name || !form.email || form.password.length < 8} className="flex-1 rounded-xl bg-teal-600 py-3 text-sm font-medium text-white disabled:opacity-50">Create</button>
            </div>
          </div>
        </div>
      )}
    </StaffLayout>
  );
}
