import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Users, 
  CheckCircle, 
  Award, 
  ShieldCheck, 
  FileText, 
  DollarSign, 
  Clock, 
  Trash2,
  AlertCircle
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { 
    editors, 
    orders, 
    withdrawals, 
    approveEditor, 
    verifyEditor, 
    updateOrderStatus 
  } = useApp();

  // Sort editors by approvals
  const pendingEditors = editors.filter(ed => !ed.isApproved);
  const approvedEditors = editors.filter(ed => ed.isApproved);

  const pendingPayouts = withdrawals.filter(w => w.status === 'pending');
  const completedPayouts = withdrawals.filter(w => w.status === 'approved');

  // Metrics
  const totalUsers = editors.length + 12; // simulated additional base client base
  const activeOrdersCount = orders.filter(o => o.status !== 'completed' && o.status !== 'rejected').length;
  const completedOrdersCount = orders.filter(o => o.status === 'completed').length;
  const totalPlatformVolume = orders
    .filter(o => o.status === 'completed')
    .reduce((sum, o) => sum + o.price, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Admin Title */}
      <div className="flex items-center gap-3 bg-zinc-900/45 p-6 border border-zinc-800 rounded-3xl">
        <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-wider">Platform Administration</h2>
          <p className="text-xs text-zinc-500">Approve freelance applicants, verify elite portfolios, and release payouts</p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-zinc-900 border border-zinc-850 p-5 rounded-2xl relative overflow-hidden">
          <Users className="absolute right-4 top-4 w-10 h-10 text-zinc-800" />
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Total Users</span>
          <span className="text-2xl font-black text-white">{totalUsers}</span>
          <span className="text-[10px] text-zinc-500 block">Active platform members</span>
        </div>

        <div className="bg-zinc-900 border border-zinc-850 p-5 rounded-2xl relative overflow-hidden">
          <Clock className="absolute right-4 top-4 w-10 h-10 text-zinc-800" />
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Active Orders</span>
          <span className="text-2xl font-black text-white">{activeOrdersCount}</span>
          <span className="text-[10px] text-zinc-500 block">{completedOrdersCount} projects completed</span>
        </div>

        <div className="bg-zinc-900 border border-zinc-850 p-5 rounded-2xl relative overflow-hidden">
          <DollarSign className="absolute right-4 top-4 w-10 h-10 text-zinc-800" />
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Platform Volume</span>
          <span className="text-2xl font-black text-white">₹{totalPlatformVolume}</span>
          <span className="text-[10px] text-zinc-500 block">Escrow transactions cleared</span>
        </div>

        <div className="bg-zinc-900 border border-zinc-850 p-5 rounded-2xl relative overflow-hidden">
          <CheckCircle className="absolute right-4 top-4 w-10 h-10 text-zinc-800" />
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Pending Approvals</span>
          <span className="text-2xl font-black text-white text-amber-500">{pendingEditors.length}</span>
          <span className="text-[10px] text-zinc-500 block">Editor applications waiting</span>
        </div>

      </div>

      {/* Main Admin Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Approvals left */}
        <div className="lg:col-span-8 space-y-4">
          <h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-5 h-5 text-amber-500" />
            Editor Applications Pending Approval ({pendingEditors.length})
          </h3>

          {pendingEditors.length === 0 ? (
            <div className="p-12 text-center bg-zinc-900/30 border border-zinc-850 rounded-2xl">
              <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-white">All applications cleared!</h4>
              <p className="text-xs text-zinc-500 mt-1">There are no pending editor registration forms requiring review.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingEditors.map(editor => (
                <div key={editor.uid} className="bg-zinc-900 border border-zinc-850 rounded-2xl p-5 space-y-4">
                  
                  {/* Header */}
                  <div className="flex items-start justify-between pb-3 border-b border-zinc-850">
                    <div>
                      <h4 className="text-sm font-black text-white">{editor.name}</h4>
                      <p className="text-[10px] text-zinc-500">@{editor.username} | {editor.email}</p>
                    </div>
                    <span className="text-xs font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-xl">
                      ₹{editor.price} Quote
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wide block">Skills:</span>
                    <div className="flex flex-wrap gap-1">
                      {editor.skills.map(s => (
                        <span key={s} className="px-2 py-0.5 bg-zinc-950 border border-zinc-800 text-[9px] text-zinc-400 uppercase rounded font-bold">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wide block">Application Bio & Portfolios:</span>
                    <p className="text-xs text-zinc-400 leading-relaxed bg-zinc-950/40 p-3 rounded-xl border border-zinc-850">
                      {editor.experience}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => approveEditor(editor.uid)}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 text-xs font-black rounded-xl transition uppercase tracking-wider"
                    >
                      Approve Editor
                    </button>
                    <button
                      onClick={() => verifyEditor(editor.uid)}
                      className="px-4 py-2 bg-zinc-950 border border-zinc-800 text-amber-500 text-xs font-black rounded-xl hover:bg-zinc-900 transition uppercase tracking-wider flex items-center gap-1"
                    >
                      <Award className="w-4 h-4" />
                      Verify Profile
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}

          {/* List of Approved Editors */}
          {approvedEditors.length > 0 && (
            <div className="space-y-3.5 pt-4">
              <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">Approved Active Freelancers ({approvedEditors.length})</h3>
              <div className="bg-zinc-900/40 border border-zinc-850 rounded-2xl p-4 divide-y divide-zinc-850">
                {approvedEditors.map(editor => (
                  <div key={editor.uid} className="py-2.5 flex items-center justify-between text-xs first:pt-0 last:pb-0">
                    <div>
                      <span className="font-bold text-white flex items-center gap-1">
                        {editor.name}
                        {editor.isVerified && <span className="text-amber-500"><Award className="w-3.5 h-3.5" /></span>}
                      </span>
                      <span className="text-[10px] text-zinc-500">@{editor.username} | ₹{editor.price}/project</span>
                    </div>
                    
                    {!editor.isVerified && (
                      <button
                        onClick={() => verifyEditor(editor.uid)}
                        className="px-2.5 py-1 border border-amber-500/20 hover:bg-amber-500/10 rounded text-amber-500 font-bold text-[10px]"
                      >
                        Verify
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Withdrawals Right side */}
        <div className="lg:col-span-4 space-y-6">
          <h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-1.5">
            <DollarSign className="w-5 h-5 text-amber-500" />
            Payout Requests
          </h3>

          <div className="bg-zinc-900 border border-zinc-850 p-5 rounded-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-850 pb-3">
              <span className="text-xs font-bold text-zinc-400">Escrow Withdrawals</span>
              <span className="text-[10px] text-amber-500 font-bold uppercase">{pendingPayouts.length} Pending</span>
            </div>

            {pendingPayouts.length === 0 ? (
              <p className="text-xs text-zinc-500 py-6 text-center">No pending payout orders.</p>
            ) : (
              <div className="space-y-3">
                {pendingPayouts.map(w => (
                  <div key={w.id} className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl text-xs space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-bold text-white block">{w.editorName}</span>
                        <span className="text-[10px] text-zinc-500 block">Requested: {new Date(w.requestedAt).toLocaleDateString()}</span>
                      </div>
                      <span className="font-black text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded text-[11px]">
                        ₹{w.amount}
                      </span>
                    </div>
                    {/* To keep firestore updates simple in prototype without complex sub-writes, just complete simulated approvals */}
                    <p className="text-[10px] text-zinc-500 italic">Verify editor completed projects before releasing funds.</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
