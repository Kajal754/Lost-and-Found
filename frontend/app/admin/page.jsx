"use client";

import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import ProtectedRoute from "../../components/ProtectedRoute";

export default function AdminPage() {
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    try {
      const [stats, userData] = await Promise.all([api.getAdminOverview(), api.getAdminUsers()]);
      setOverview(stats); setUsers(userData.users || []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { const timer = setTimeout(load, 0); return () => clearTimeout(timer); }, []);

  async function updateRole(user) {
    const role = user.role === "ADMIN" ? "USER" : "ADMIN";
    try { await api.setAdminUserRole(user.id, role); await load(); }
    catch (e) { setError(e.message); }
  }
  async function changeStatus(item, status) {
    try { await api.updateAdminItemStatus(item.type, item.id, status); await load(); }
    catch (e) { setError(e.message); }
  }
  async function removeItem(item) {
    if (!window.confirm(`Delete the ${item.type} report “${item.title}”?`)) return;
    try { await api.deleteAdminItem(item.type, item.id); await load(); }
    catch (e) { setError(e.message); }
  }

  const stats = overview?.stats;
  const cards = [
    ["Total users", stats?.users], ["Lost reports", stats?.lostItems], ["Found reports", stats?.foundItems],
    ["Pending claims", stats?.pendingClaims], ["Items returned", stats?.returnedClaims],
  ];
  const maxBar = Math.max(1, ...(stats?.monthlyRecoveries || []).map((m) => m.returned));

  return <ProtectedRoute><div className="min-h-screen bg-slate-50"><Sidebar/><div className="lg:ml-64"><Navbar/><main className="p-4 sm:p-6 lg:p-8">
    <header className="mb-6"><h1 className="text-2xl sm:text-3xl font-bold">Admin Center</h1><p className="mt-2 text-sm text-slate-500">Platform overview, user access and report moderation.</p></header>
    {error && <p role="alert" className="mb-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
    {loading ? <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{cards.map((_, i)=><div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-200"/> )}</div> : !stats ? <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center"><h2 className="font-bold">Admin access required</h2><p className="mt-2 text-sm text-slate-500">Set ADMIN_EMAIL, register that account, then run <code>npm run promote-admin</code> in the backend folder.</p></div> : <>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{cards.map(([title, value])=><article key={title} className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-xs font-semibold text-slate-500">{title}</p><p className="mt-2 text-2xl font-bold">{value ?? 0}</p></article>)}</section>
      <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5"><h2 className="font-bold">Monthly recoveries · last 6 months</h2><div className="mt-5 grid h-40 grid-cols-6 items-end gap-3">{stats.monthlyRecoveries?.map((month)=><div key={month.month} className="flex h-full flex-col items-center justify-end gap-2"><span className="text-xs font-semibold">{month.returned}</span><div className="w-full max-w-12 rounded-t-lg bg-emerald-700" style={{height:`${Math.max(4,(month.returned/maxBar)*95)}%`}}/><span className="text-[10px] text-slate-500">{new Date(`${month.month}-01`).toLocaleDateString(undefined,{month:"short"})}</span></div>)}</div></section>
      <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-center justify-between"><h2 className="font-bold">Suspicious reports</h2><span className="rounded-full bg-amber-50 px-2 py-1 text-xs font-bold text-amber-700">{overview.suspicious?.length || 0} review signals</span></div><p className="mt-1 text-xs text-slate-500">Similar titles in the same category are flagged for manual review.</p>{!overview.suspicious?.length ? <p className="mt-4 text-sm text-slate-500">No likely duplicates found.</p> : <div className="mt-3 space-y-2">{overview.suspicious.map((item)=><div key={`${item.type}-${item.id}`} className="flex flex-wrap items-center gap-2 rounded-xl bg-amber-50/70 p-3 text-sm"><span className="rounded bg-white px-2 py-1 text-xs font-bold uppercase">{item.type}</span><b>{item.title}</b><span className="text-slate-500">{item.category} · {item.user.name}</span><span className="ml-auto text-xs text-slate-500">#{item.id}</span></div>)}</div>}</section>
      <div className="mt-5 grid gap-5 xl:grid-cols-2"><section className="rounded-2xl border border-slate-200 bg-white p-5"><h2 className="mb-3 font-bold">User management</h2><div className="max-h-[440px] space-y-2 overflow-auto">{users.map((user)=><article key={user.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3"><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{user.name}</p><p className="truncate text-xs text-slate-500">{user.email || user.phone || "No contact"} · {user._count.lostItems + user._count.foundItems} reports</p></div><span className="text-[10px] font-bold">{user.role}</span><button onClick={()=>updateRole(user)} className="rounded-lg border border-slate-200 px-2 py-1 text-xs">{user.role === "ADMIN" ? "Remove admin" : "Make admin"}</button></article>)}</div></section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5"><h2 className="mb-3 font-bold">Recent report moderation</h2><div className="max-h-[440px] space-y-2 overflow-auto">{overview.recentItems?.map((item)=><article key={`${item.type}-${item.id}`} className="rounded-xl border border-slate-100 p-3"><div className="flex items-start gap-2"><span className="rounded bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase">{item.type}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{item.title}</p><p className="text-xs text-slate-500">{item.user.name} · {item.location}</p></div><select value={item.status} onChange={(e)=>changeStatus(item,e.target.value)} className="rounded-lg border border-slate-200 px-2 py-1 text-xs">{(item.type === "lost" ? ["lost","returned"] : ["found","claimed","returned"]).map((s)=><option key={s}>{s}</option>)}</select><button onClick={()=>removeItem(item)} className="rounded-lg px-2 py-1 text-xs font-semibold text-rose-700">Delete</button></div></article>)}</div></section></div>
    </>}
  </main></div></div></ProtectedRoute>;
}
