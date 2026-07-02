import React, { useState } from 'react';
import { useApp, EditorProfile, Order, PortfolioItem } from '../context/AppContext';
import { 
  Plus, 
  Trash2, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  Award, 
  Sparkles, 
  MessageSquare, 
  Send,
  Video,
  ChevronRight,
  Loader,
  X,
  CreditCard,
  UserCheck
} from 'lucide-react';

export const EditorDashboard: React.FC = () => {
  const { 
    user, 
    editorProfile, 
    orders, 
    registerAsEditor, 
    updateEditorProfile, 
    updateOrderStatus, 
    sendChatMessage,
    requestWithdrawal,
    withdrawals
  } = useApp();

  // Registration States
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regExperience, setRegExperience] = useState('');
  const [regPrice, setRegPrice] = useState(1500);
  const [regPhoto, setRegPhoto] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150');
  const [regSkillInput, setRegSkillInput] = useState('');
  const [regSkills, setRegSkills] = useState<string[]>(['Reels', 'AI Editing']);
  
  // Portfolio States inside registration/profile edit
  const [portTitle, setPortTitle] = useState('');
  const [portVideoUrl, setPortVideoUrl] = useState('');
  const [portThumbnailUrl, setPortThumbnailUrl] = useState('');
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);

  // Editing State (if already an editor)
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Order Submission States
  const [selectedOrderForSubmit, setSelectedOrderForSubmit] = useState<Order | null>(null);
  const [submittedVideoUrl, setSubmittedVideoUrl] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  // Chat/Active Consult State
  const [activeChatOrder, setActiveChatOrder] = useState<Order | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [chatLogs, setChatLogs] = useState<{sender: string, text: string, time: string}[]>([]);

  // Withdraw states
  const [withdrawAmount, setWithdrawAmount] = useState<number>(0);
  const [withdrawSuccess, setWithdrawSuccess] = useState('');
  const [withdrawError, setWithdrawError] = useState('');

  // Handle Skill Add
  const handleAddSkill = () => {
    if (regSkillInput.trim() && !regSkills.includes(regSkillInput.trim())) {
      setRegSkills(prev => [...prev, regSkillInput.trim()]);
      setRegSkillInput('');
    }
  };

  // Handle Skill Remove
  const handleRemoveSkill = (skill: string) => {
    setRegSkills(prev => prev.filter(s => s !== skill));
  };

  // Handle Portfolio Add
  const handleAddPortfolio = () => {
    if (!portTitle || !portVideoUrl) {
      alert("Portfolio Title and Video URL are required!");
      return;
    }
    const newItem: PortfolioItem = {
      id: Math.random().toString(36).substring(7),
      title: portTitle,
      videoUrl: portVideoUrl,
      thumbnailUrl: portThumbnailUrl || 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=300'
    };
    setPortfolioItems(prev => [...prev, newItem]);
    setPortTitle('');
    setPortVideoUrl('');
    setPortThumbnailUrl('');
  };

  // Handle Portfolio Remove
  const handleRemovePortfolio = (id: string) => {
    setPortfolioItems(prev => prev.filter(item => item.id !== id));
  };

  // Handle Registration Submit
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regUsername || !regExperience) {
      alert("Please fill out all registration fields!");
      return;
    }
    try {
      await registerAsEditor({
        name: regName,
        username: regUsername,
        skills: regSkills,
        experience: regExperience,
        portfolio: portfolioItems,
        price: regPrice,
        profilePhoto: regPhoto,
        status: 'active'
      });
    } catch (err) {
      console.error(err);
      alert("Registration failed");
    }
  };

  // Handle Order Deliver File Submit
  const handleDeliverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForSubmit || !submittedVideoUrl) return;

    setSubmitLoading(true);
    try {
      await updateOrderStatus(selectedOrderForSubmit.id, 'submitted', {
        videoUrl: submittedVideoUrl
      });
      setSelectedOrderForSubmit(null);
      setSubmittedVideoUrl('');
    } catch (err) {
      console.error(err);
      alert("Failed to submit delivery");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeChatOrder) return;

    const newLog = {
      sender: "You (Editor)",
      text: chatInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatLogs(prev => [...prev, newLog]);

    const chatId = `${activeChatOrder.clientId}_${activeChatOrder.editorId}`;
    sendChatMessage(chatId, chatInput);
    setChatInput('');
  };

  const handleWithdrawRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError('');
    setWithdrawSuccess('');

    if (!editorProfile) return;
    if (withdrawAmount <= 0) {
      setWithdrawError("Please provide a valid payout amount");
      return;
    }
    if (withdrawAmount > editorProfile.earnings) {
      setWithdrawError("Insufficient balance in active wallet");
      return;
    }

    try {
      await requestWithdrawal(withdrawAmount);
      setWithdrawSuccess(`Payout request of ₹${withdrawAmount} submitted!`);
      setWithdrawAmount(0);
    } catch (err: any) {
      setWithdrawError(err.message || "Withdrawal failed");
    }
  };

  // Filter orders for the editor
  const editorOrders = orders.filter(o => o.editorId === user?.uid);
  const activeOrders = editorOrders.filter(o => o.status !== 'completed' && o.status !== 'rejected');
  const completedOrders = editorOrders.filter(o => o.status === 'completed');

  // VIEW 1: No profile exists (Become an Editor Registration)
  if (!editorProfile) {
    return (
      <div className="max-w-4xl mx-auto bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8 space-y-6">
        <div className="text-center space-y-2 pb-4 border-b border-zinc-850">
          <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto text-amber-500">
            <Video className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-black text-white">Join as a Professional Creator</h2>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            Become an approved editor on RT EDITOR. Set your rates, exhibit your portfolios, and collaborate with top-tier clients.
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-400">Display Name</label>
              <input
                type="text"
                required
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="e.g., Jane Watson"
                className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-700 focus:outline-none focus:border-amber-500 transition"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-400">Professional Username</label>
              <input
                type="text"
                required
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
                placeholder="e.g., jane_edits"
                className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-700 focus:outline-none focus:border-amber-500 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-400">Editing Price per Project (₹20 – ₹5000)</label>
              <input
                type="number"
                min="20"
                max="5000"
                required
                value={regPrice}
                onChange={(e) => setRegPrice(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500 transition"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-400">Avatar Photo URL</label>
              <input
                type="url"
                value={regPhoto}
                onChange={(e) => setRegPhoto(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-700 focus:outline-none focus:border-amber-500 transition"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-400">Skills / Categories (Reels, YouTube, Shorts, Gaming, Wedding, AI Editing)</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={regSkillInput}
                onChange={(e) => setRegSkillInput(e.target.value)}
                placeholder="e.g., Color Grading"
                className="flex-1 px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-4 bg-zinc-900 border border-zinc-800 text-amber-500 font-bold rounded-xl text-xs hover:bg-zinc-800 transition"
              >
                Add Skill
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {regSkills.map(skill => (
                <span key={skill} className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-500 rounded-lg text-xs font-bold uppercase">
                  {skill}
                  <button type="button" onClick={() => handleRemoveSkill(skill)} className="text-zinc-400 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-400">Experience & Bio Description</label>
            <textarea
              rows={4}
              required
              value={regExperience}
              onChange={(e) => setRegExperience(e.target.value)}
              placeholder="Describe your creative style, previous agency works, software tools (Premiere Pro, After Effects, FFmpeg) and pacing specializations..."
              className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-700 focus:outline-none focus:border-amber-500 transition resize-none"
            ></textarea>
          </div>

          {/* Add Portfolio items */}
          <div className="space-y-3.5 p-5 bg-zinc-950/40 border border-zinc-850 rounded-2xl">
            <div>
              <h4 className="text-sm font-bold text-white">Add Portfolio Link</h4>
              <p className="text-xs text-zinc-500">Provide external project links for clients to inspect previous works.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Project Title"
                value={portTitle}
                onChange={(e) => setPortTitle(e.target.value)}
                className="px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white"
              />
              <input
                type="url"
                placeholder="Video Link (YouTube/Drive)"
                value={portVideoUrl}
                onChange={(e) => setPortVideoUrl(e.target.value)}
                className="px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white"
              />
              <input
                type="url"
                placeholder="Optional Thumbnail URL"
                value={portThumbnailUrl}
                onChange={(e) => setPortThumbnailUrl(e.target.value)}
                className="px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white"
              />
            </div>
            <button
              type="button"
              onClick={handleAddPortfolio}
              className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-amber-500 text-xs font-bold rounded-xl hover:bg-zinc-800 transition"
            >
              Add Project to Portfolio
            </button>

            {/* Render items */}
            {portfolioItems.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-4">
                {portfolioItems.map(item => (
                  <div key={item.id} className="p-2 bg-zinc-950 border border-zinc-800 rounded-lg relative">
                    <button 
                      type="button" 
                      onClick={() => handleRemovePortfolio(item.id)}
                      className="absolute -top-1 -right-1 p-1 bg-red-600 hover:bg-red-700 rounded-full text-white z-10 shadow"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    <span className="text-[10px] text-zinc-400 font-bold block truncate">{item.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-black rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-amber-500/10"
          >
            Submit Application / Become Editor
          </button>
        </form>
      </div>
    );
  }

  // VIEW 2: Profile registered but not approved by admin yet
  if (!editorProfile.isApproved) {
    return (
      <div className="max-w-2xl mx-auto bg-zinc-900 border border-zinc-800 rounded-3xl p-8 text-center space-y-5 shadow-2xl">
        <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto text-amber-500 animate-pulse">
          <Clock className="w-7 h-7" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-black text-white">Application Pending Review</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
            Your registration as an editor @{editorProfile.username} has been successfully logged! Our administration team is reviewing your portfolios and specifications.
          </p>
        </div>
        <div className="p-4 bg-zinc-950 rounded-2xl text-left border border-zinc-850 space-y-1.5 text-xs max-w-md mx-auto">
          <p className="font-bold text-white">Application Details:</p>
          <p className="text-zinc-400">Name: <span className="text-zinc-300 font-bold">{editorProfile.name}</span></p>
          <p className="text-zinc-400">Price Quote: <span className="text-zinc-300 font-bold">₹{editorProfile.price}</span></p>
          <p className="text-zinc-400">Skills: <span className="text-zinc-300 font-bold">{editorProfile.skills.join(', ')}</span></p>
        </div>
        <p className="text-[10px] text-zinc-600">Once approved, your dashboard will open instantly here. Thank you for your patience!</p>
      </div>
    );
  }

  // VIEW 3: Editor Profile is approved (Render main Freelance Dashboard)
  return (
    <div className="space-y-8">
      
      {/* Dashboard Top Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Editor Info Panel */}
        <div className="bg-zinc-900 border border-zinc-850 rounded-2xl p-5 flex items-center gap-4">
          {editorProfile.profilePhoto ? (
            <img 
              src={editorProfile.profilePhoto} 
              alt={editorProfile.name} 
              className="w-12 h-12 rounded-full object-cover border border-zinc-800"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-zinc-950 flex items-center justify-center font-black text-amber-500 border border-zinc-800">
              {editorProfile.name[0]}
            </div>
          )}
          <div>
            <div className="flex items-center gap-1">
              <span className="text-sm font-extrabold text-white truncate">{editorProfile.name}</span>
              {editorProfile.isVerified && <span className="text-amber-500"><Award className="w-3.5 h-3.5" /></span>}
            </div>
            <span className="text-[10px] text-zinc-500 font-medium">@{editorProfile.username}</span>
            <span className="text-[9px] font-bold text-emerald-400 bg-emerald-400/10 px-1 rounded block w-max mt-1">APPROVED CREATOR</span>
          </div>
        </div>

        {/* Balance Wallet */}
        <div className="bg-zinc-900 border border-zinc-850 rounded-2xl p-5 space-y-1.5 relative overflow-hidden group">
          <DollarSign className="absolute right-4 top-4 w-10 h-10 text-zinc-800 group-hover:text-amber-500/10 transition duration-300" />
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Active Balance</span>
          <span className="text-2xl font-black text-white">₹{editorProfile.earnings || 0}</span>
          <span className="text-[10px] text-zinc-500 block">Total Withdrawn: ₹{editorProfile.totalWithdrawn || 0}</span>
        </div>

        {/* Active orders */}
        <div className="bg-zinc-900 border border-zinc-850 rounded-2xl p-5 space-y-1.5 relative overflow-hidden">
          <Clock className="absolute right-4 top-4 w-10 h-10 text-zinc-800" />
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Active Escrows</span>
          <span className="text-2xl font-black text-white">{activeOrders.length}</span>
          <span className="text-[10px] text-zinc-500 block">Requires timely delivery</span>
        </div>

        {/* Rating */}
        <div className="bg-zinc-900 border border-zinc-850 rounded-2xl p-5 space-y-1.5 relative overflow-hidden">
          <UserCheck className="absolute right-4 top-4 w-10 h-10 text-zinc-800" />
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Freelancer Rating</span>
          <span className="text-2xl font-black text-white">{editorProfile.rating || 5.0}</span>
          <span className="text-[10px] text-zinc-500 block">Across {editorProfile.reviewsCount || 0} reviews</span>
        </div>

      </div>

      {/* Grid: Orders List & Withdraw Wallet Payout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Active Orders Console left */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-black text-white uppercase tracking-wider">Active Client Orders</h3>
            <span className="text-xs text-zinc-500">Escrow locked payout channel</span>
          </div>

          {activeOrders.length === 0 ? (
            <div className="p-12 text-center bg-zinc-900/30 border border-zinc-850 rounded-2xl">
              <Clock className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-white">No active orders yet</h4>
              <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
                Once a client discovers your profile and hires you, their video requests will land instantly here!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeOrders.map(order => (
                <div key={order.id} className="bg-zinc-900 border border-zinc-850 rounded-2xl p-5 space-y-4 relative overflow-hidden">
                  
                  {/* Card header */}
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-3.5 border-b border-zinc-850">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-white">{order.title}</span>
                        <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded text-[9px] font-bold uppercase">
                          {order.category}
                        </span>
                      </div>
                      <span className="text-[10px] text-zinc-500 font-medium mt-1 block">Client: <span className="text-zinc-300 font-bold">{order.clientName}</span></span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-black text-white bg-zinc-950 border border-zinc-850 px-3 py-1 rounded-xl">
                        ₹{order.price}
                      </span>
                      <span className={`text-[9px] font-black px-2 py-1 rounded uppercase tracking-wider ${
                        order.status === 'pending' ? 'bg-amber-500/10 text-amber-500' :
                        order.status === 'accepted' ? 'bg-blue-500/10 text-blue-400' :
                        order.status === 'submitted' ? 'bg-purple-500/10 text-purple-400' :
                        'bg-zinc-800 text-zinc-400'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>

                  {/* Requirements description */}
                  <p className="text-xs text-zinc-400 leading-relaxed bg-zinc-950/40 p-3 rounded-xl border border-zinc-850">
                    {order.description}
                  </p>

                  {/* Action triggers depending on status */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-2">
                      {order.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateOrderStatus(order.id, 'accepted')}
                            className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-extrabold text-xs rounded-xl transition uppercase"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => updateOrderStatus(order.id, 'rejected')}
                            className="px-3.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-extrabold text-xs border border-red-500/25 rounded-xl transition uppercase"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {order.status === 'accepted' && (
                        <button
                          onClick={() => setSelectedOrderForSubmit(order)}
                          className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-extrabold text-xs rounded-xl transition uppercase"
                        >
                          Submit Delivery
                        </button>
                      )}

                      {order.status === 'submitted' && (
                        <span className="text-[10px] text-zinc-500 italic flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                          Delivery submitted. Waiting for client approval.
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setActiveChatOrder(order);
                        setChatLogs([
                          { sender: order.clientName, text: `Hi! This is regarding our order: "${order.title}". Let me know if you need any clips or references!`, time: "Just now" }
                        ]);
                      }}
                      className="text-xs font-bold text-amber-500 hover:text-amber-600 transition flex items-center gap-1"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Client Consultation
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

        {/* Withdrawal request / wallet right side */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-zinc-900 border border-zinc-850 rounded-2xl p-5 space-y-4">
            <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-850 pb-3">
              <CreditCard className="w-5 h-5 text-amber-500" />
              Withdraw Balance
            </h4>

            {withdrawError && (
              <p className="text-xs text-red-400 bg-red-500/10 p-2.5 rounded-xl border border-red-500/20">{withdrawError}</p>
            )}

            {withdrawSuccess && (
              <p className="text-xs text-emerald-400 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">{withdrawSuccess}</p>
            )}

            <form onSubmit={handleWithdrawRequest} className="space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Wallet Balance</span>
                <span className="text-3xl font-black text-white">₹{editorProfile.earnings || 0}</span>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">Amount to Withdraw</label>
                <input
                  type="number"
                  min="50"
                  max={editorProfile.earnings}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                  placeholder="₹ Amount"
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white"
                />
              </div>

              <button
                type="submit"
                disabled={withdrawAmount <= 0 || withdrawAmount > editorProfile.earnings}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-zinc-800 disabled:text-zinc-600 text-zinc-950 font-black rounded-xl text-xs transition uppercase tracking-widest"
              >
                Request Payout
              </button>
            </form>
          </div>

          {/* Past Withdrawals History */}
          <div className="bg-zinc-900 border border-zinc-850 rounded-2xl p-5 space-y-3.5">
            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider border-b border-zinc-850 pb-2">Withdrawal Log</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {withdrawals.length === 0 ? (
                <p className="text-xs text-zinc-500 py-4 text-center">No withdraw log created yet.</p>
              ) : (
                withdrawals.map(w => (
                  <div key={w.id} className="p-2.5 bg-zinc-950 rounded-xl border border-zinc-850 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-white block">₹{w.amount}</span>
                      <span className="text-[10px] text-zinc-500 block">Requested: {new Date(w.requestedAt).toLocaleDateString()}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                      w.status === 'pending' ? 'bg-amber-500/15 text-amber-500' : 'bg-emerald-500/15 text-emerald-400'
                    }`}>
                      {w.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Delivery Submit Dialog/Modal */}
      {selectedOrderForSubmit && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setSelectedOrderForSubmit(null)}
              className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-lg font-black text-white uppercase tracking-wider mb-2">Submit Delivery</h3>
            <p className="text-xs text-zinc-400 mb-4">Provide the final edited video links for client approval and rating.</p>

            <form onSubmit={handleDeliverSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-400">Final Exported Video URL</label>
                <input
                  type="url"
                  required
                  value={submittedVideoUrl}
                  onChange={(e) => setSubmittedVideoUrl(e.target.value)}
                  placeholder="https://drive.google.com/... or Vimeo/YouTube"
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-amber-500 transition"
                />
              </div>

              <button
                type="submit"
                disabled={submitLoading}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-zinc-800 disabled:text-zinc-600 text-zinc-950 font-extrabold rounded-xl text-xs uppercase"
              >
                {submitLoading ? "Delivering..." : "Submit File Delivery"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Client Chat Dialog/Modal */}
      {activeChatOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[60vh] animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="px-5 py-4 border-b border-zinc-850 flex justify-between items-center bg-zinc-950/45">
              <div>
                <span className="text-xs font-extrabold text-white uppercase block">Client Consult: {activeChatOrder.clientName}</span>
                <span className="text-[10px] text-zinc-500 truncate block max-w-xs">{activeChatOrder.title}</span>
              </div>
              <button onClick={() => setActiveChatOrder(null)} className="text-zinc-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-zinc-950/20">
              {chatLogs.map((chat, idx) => (
                <div key={idx} className={`p-2.5 rounded-xl text-xs max-w-[85%] ${
                  chat.sender.includes("You")
                    ? 'bg-amber-500/10 border border-amber-500/20 text-white ml-auto text-right' 
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-300 mr-auto'
                }`}>
                  <span className="text-[9px] font-bold text-zinc-500 block mb-0.5">{chat.sender}</span>
                  <span>{chat.text}</span>
                </div>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSendChat} className="p-4 border-t border-zinc-850 bg-zinc-950/40 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Discuss revisions, clip feedback, timeline cuts..."
                className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white placeholder-zinc-700"
              />
              <button type="submit" className="p-2 bg-zinc-900 border border-zinc-800 text-amber-500 hover:bg-zinc-800 rounded-lg transition shrink-0">
                <Send className="w-4 h-4" />
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
