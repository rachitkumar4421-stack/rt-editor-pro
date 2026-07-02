import React, { useState } from 'react';
import { useApp, EditorProfile, Order } from '../context/AppContext';
import { 
  Search, 
  CheckCircle, 
  Star, 
  Heart, 
  User, 
  Briefcase, 
  DollarSign, 
  MessageSquare, 
  ChevronRight, 
  Send, 
  Play, 
  Award,
  Clock,
  ExternalLink,
  ChevronLeft
} from 'lucide-react';

export const EditorDirectory: React.FC = () => {
  const { 
    user, 
    userProfile, 
    editors, 
    orders, 
    followEditor, 
    placeOrder, 
    sendChatMessage 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedEditor, setSelectedEditor] = useState<EditorProfile | null>(null);
  
  // Hiring Form States
  const [orderTitle, setOrderTitle] = useState('');
  const [orderDesc, setOrderDesc] = useState('');
  const [orderCategory, setOrderCategory] = useState('Reels');
  const [showHireSuccess, setShowHireSuccess] = useState(false);
  const [hiringLoading, setHiringLoading] = useState(false);

  // Chat/Messages State within editor modal
  const [chatMessage, setChatMessage] = useState('');
  const [activeChatLogs, setActiveChatLogs] = useState<{sender: string, text: string, time: string}[]>([]);

  const categories = [
    'All', 'Reels', 'YouTube', 'Shorts', 'Gaming', 'Wedding', 'Thumbnail', 'AI Editing'
  ];

  // Filtering only approved editors
  const approvedEditors = editors.filter(ed => ed.isApproved);

  const filteredEditors = approvedEditors.filter(ed => {
    const matchesQuery = ed.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         ed.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'All' || 
                            ed.skills.some(s => s.toLowerCase() === selectedCategory.toLowerCase());
    
    return matchesQuery && matchesCategory;
  });

  const handleFollow = async (editorId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      alert("Please log in to follow editors!");
      return;
    }
    await followEditor(editorId);
  };

  const handleHireSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Please log in to hire this editor!");
      return;
    }
    if (!selectedEditor) return;
    if (!orderTitle || !orderDesc) {
      alert("Please fill out all order specifications!");
      return;
    }

    setHiringLoading(true);
    try {
      await placeOrder({
        editorId: selectedEditor.uid,
        editorName: selectedEditor.name,
        title: orderTitle,
        description: orderDesc,
        category: orderCategory,
        price: selectedEditor.price
      });
      setShowHireSuccess(true);
      setOrderTitle('');
      setOrderDesc('');
      setTimeout(() => {
        setShowHireSuccess(false);
      }, 4000);
    } catch (err) {
      console.error(err);
      alert("Failed to create order");
    } finally {
      setHiringLoading(false);
    }
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || !selectedEditor || !userProfile) return;
    
    const newMsg = {
      sender: userProfile.name,
      text: chatMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setActiveChatLogs(prev => [...prev, newMsg]);
    
    // Push simulated chat log to DB
    const chatId = `${user.uid}_${selectedEditor.uid}`;
    sendChatMessage(chatId, chatMessage);
    
    setChatMessage('');
  };

  const isFollowing = (editorId: string) => {
    return userProfile?.followedEditors?.includes(editorId) || false;
  };

  return (
    <div className="space-y-6">
      
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-zinc-900/40 p-5 border border-zinc-800 rounded-2xl">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search editors by name or skill..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-zinc-950 border border-zinc-850 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500 transition"
          />
        </div>

        {/* Categories slider */}
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-1 scrollbar-thin">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                selectedCategory === cat 
                  ? 'bg-amber-500 text-zinc-950' 
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Directory Grid */}
      {filteredEditors.length === 0 ? (
        <div className="text-center py-16 bg-zinc-900/20 border border-zinc-800/50 rounded-2xl">
          <User className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white">No Editors Found</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search queries or category filters to find approved freelancers!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEditors.map(editor => (
            <div 
              key={editor.uid}
              onClick={() => {
                setSelectedEditor(editor);
                setActiveChatLogs([
                  { sender: editor.name, text: `Hello! I'm ${editor.name}. How can I assist you with your editing project today?`, time: "Just now" }
                ]);
              }}
              className="bg-zinc-900 border border-zinc-850 hover:border-zinc-700/80 rounded-2xl p-5 cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition duration-300 relative group flex flex-col justify-between"
            >
              <div>
                {/* Profile Header */}
                <div className="flex items-start gap-3.5">
                  <div className="relative">
                    {editor.profilePhoto ? (
                      <img 
                        src={editor.profilePhoto} 
                        alt={editor.name} 
                        className="w-14 h-14 rounded-full object-cover border-2 border-zinc-800"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-zinc-950 flex items-center justify-center text-lg font-bold text-amber-500 border-2 border-zinc-800">
                        {editor.name[0]}
                      </div>
                    )}
                    {editor.isVerified && (
                      <span className="absolute -bottom-1 -right-1 bg-amber-500 text-zinc-950 p-0.5 rounded-full" title="Verified Editor">
                        <Award className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-extrabold text-white truncate">{editor.name}</h4>
                      {editor.isApproved && (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 truncate">@{editor.username}</p>
                    
                    {/* Rating */}
                    <div className="flex items-center gap-1 mt-1 text-xs">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span className="font-bold text-amber-500">{editor.rating || 5.0}</span>
                      <span className="text-zinc-500">({editor.reviewsCount || 0} reviews)</span>
                    </div>
                  </div>

                  {/* Follow Heart */}
                  <button 
                    onClick={(e) => handleFollow(editor.uid, e)}
                    className="p-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-500 hover:text-red-500 transition shrink-0"
                  >
                    <Heart className={`w-4 h-4 ${isFollowing(editor.uid) ? 'fill-red-500 text-red-500' : ''}`} />
                  </button>
                </div>

                {/* Experience Bio */}
                <p className="text-xs text-zinc-400 mt-4 line-clamp-2 leading-relaxed bg-zinc-950/40 p-2.5 rounded-xl border border-zinc-850">
                  {editor.experience}
                </p>

                {/* Skills tags */}
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {editor.skills.slice(0, 4).map(skill => (
                    <span key={skill} className="px-2.5 py-0.5 bg-zinc-950 border border-zinc-850 rounded-lg text-[10px] font-bold text-zinc-400 uppercase tracking-wide">
                      {skill}
                    </span>
                  ))}
                  {editor.skills.length > 4 && (
                    <span className="text-[10px] text-zinc-600 font-bold px-1 mt-0.5">+{editor.skills.length - 4} more</span>
                  )}
                </div>
              </div>

              {/* Price footer */}
              <div className="mt-5 pt-4 border-t border-zinc-850 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-zinc-500 font-bold block uppercase tracking-wider">Starting from</span>
                  <span className="text-lg font-black text-white">₹{editor.price} <span className="text-xs font-semibold text-zinc-500">/ project</span></span>
                </div>
                <div className="flex items-center gap-1 text-xs text-amber-500 font-bold group-hover:translate-x-1 transition duration-200">
                  <span>View Details</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Detail & Hiring Modal */}
      {selectedEditor && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-5xl bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in duration-200">
            
            {/* Modal Navigation */}
            <div className="px-6 py-4 border-b border-zinc-850 flex justify-between items-center bg-zinc-950/40">
              <button 
                onClick={() => setSelectedEditor(null)}
                className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white font-bold transition"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Directory
              </button>
              <span className="text-xs font-extrabold text-amber-500 uppercase tracking-widest bg-amber-500/10 px-2.5 py-1 rounded-lg">
                Premium Editor Profile
              </span>
            </div>

            {/* Split Grid Profile/Hiring */}
            <div className="grid grid-cols-1 lg:grid-cols-12 max-h-[75vh] overflow-y-auto">
              
              {/* Profile Details left */}
              <div className="lg:col-span-7 p-6 space-y-6 border-b lg:border-b-0 lg:border-r border-zinc-850">
                
                {/* Bio Block */}
                <div className="flex items-start gap-4">
                  {selectedEditor.profilePhoto ? (
                    <img 
                      src={selectedEditor.profilePhoto} 
                      alt={selectedEditor.name} 
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-zinc-800 shadow-xl"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-zinc-950 flex items-center justify-center text-3xl font-bold text-amber-500 border-2 border-zinc-800 shadow-xl">
                      {selectedEditor.name[0]}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-2xl font-black text-white">{selectedEditor.name}</h3>
                      {selectedEditor.isVerified && <span className="bg-amber-500 text-zinc-950 p-0.5 rounded-full text-xs font-bold"><Award className="w-4 h-4" /></span>}
                    </div>
                    <p className="text-sm text-zinc-400 font-semibold">@{selectedEditor.username}</p>
                    <p className="text-xs text-zinc-500 mt-1">Skills: {selectedEditor.skills.join(', ')}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h5 className="text-xs font-extrabold text-white uppercase tracking-wider">Experience & Background</h5>
                  <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-950/50 p-4 rounded-xl border border-zinc-850">
                    {selectedEditor.experience}
                  </p>
                </div>

                {/* Portfolios */}
                <div className="space-y-3">
                  <h5 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-amber-500" />
                    Portfolio Highlights
                  </h5>
                  {selectedEditor.portfolio && selectedEditor.portfolio.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedEditor.portfolio.map((port, index) => (
                        <div key={port.id || index} className="group relative bg-zinc-950 rounded-xl overflow-hidden border border-zinc-850 p-1.5 hover:border-zinc-700 transition">
                          <div className="relative aspect-video rounded-lg overflow-hidden bg-zinc-900 flex items-center justify-center">
                            {port.thumbnailUrl ? (
                              <img src={port.thumbnailUrl} alt={port.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                            ) : (
                              <div className="flex flex-col items-center">
                                <Play className="w-8 h-8 text-amber-500 fill-amber-500/20" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200">
                              <a 
                                href={port.videoUrl || "#"} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="p-2 rounded-full bg-amber-500 text-zinc-950 hover:bg-amber-600 transition shadow-lg"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </div>
                          </div>
                          <span className="text-[11px] font-bold text-zinc-300 px-1 mt-2 block truncate">{port.title}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-500 bg-zinc-950/20 p-4 text-center rounded-xl">No portfolio highlights uploaded yet.</p>
                  )}
                </div>

                {/* Rating & Reviews */}
                <div className="space-y-2.5">
                  <h5 className="text-xs font-extrabold text-white uppercase tracking-wider">Client Reviews & Endorsements</h5>
                  <div className="bg-zinc-950/40 border border-zinc-850 p-4 rounded-xl space-y-3">
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                      <span className="text-md font-extrabold text-white">{selectedEditor.rating} / 5.0</span>
                      <span className="text-xs text-zinc-500">Based on verified project fulfillments</span>
                    </div>
                    {selectedEditor.reviewsCount === 0 ? (
                      <p className="text-xs text-zinc-500 pt-1">No client reviews logged yet.</p>
                    ) : (
                      <div className="border-t border-zinc-900 pt-3 space-y-2.5">
                        <div className="bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800">
                          <div className="flex justify-between items-center text-[10px] text-zinc-500">
                            <span className="font-bold text-zinc-300">Rachit K. (Client)</span>
                            <span className="flex items-center gap-0.5"><Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" /> 5.0</span>
                          </div>
                          <p className="text-xs text-zinc-400 mt-1 italic">"Unbelievable dynamic subtitle timing! The AI editing was polished precisely as requested."</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Hire & Chat Right Side */}
              <div className="lg:col-span-5 flex flex-col justify-between bg-zinc-950/30">
                
                {/* Place Order Block */}
                <div className="p-6 border-b border-zinc-850">
                  <h4 className="text-md font-bold text-white flex items-center gap-1.5 mb-1.5">
                    <DollarSign className="w-5 h-5 text-amber-500" />
                    Place Order Specification
                  </h4>
                  <p className="text-xs text-zinc-400 mb-4">
                    Send instructions to {selectedEditor.name}. Payout is locked in escrow until you approve completeness.
                  </p>

                  {showHireSuccess ? (
                    <div className="bg-emerald-500/15 border border-emerald-500/30 p-4 rounded-xl text-emerald-400 space-y-1 text-xs">
                      <p className="font-bold">Order Placed Successfully! 🎉</p>
                      <p className="text-[11px] text-emerald-500/80">
                        Check updates inside your notifications or chat logs. The editor will review your instructions shortly.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleHireSubmit} className="space-y-3.5">
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">Video Project Title</label>
                        <input
                          type="text"
                          required
                          value={orderTitle}
                          onChange={(e) => setOrderTitle(e.target.value)}
                          placeholder="e.g., Cooking Vlog YouTube Reel"
                          className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 transition"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">Category</label>
                          <select
                            value={orderCategory}
                            onChange={(e) => setOrderCategory(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 transition"
                          >
                            <option value="Reels">Reels</option>
                            <option value="YouTube">YouTube</option>
                            <option value="Shorts">Shorts</option>
                            <option value="Gaming">Gaming</option>
                            <option value="Wedding">Wedding</option>
                            <option value="Thumbnail">Thumbnail</option>
                            <option value="AI Editing">AI Editing</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">Price</label>
                          <div className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-300 font-bold flex items-center">
                            ₹{selectedEditor.price} (Locked)
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">Project Description / Requirements</label>
                        <textarea
                          rows={3}
                          required
                          value={orderDesc}
                          onChange={(e) => setOrderDesc(e.target.value)}
                          placeholder="Describe cut preferences, text styles, color palettes, and overall video flow details..."
                          className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 transition resize-none"
                        ></textarea>
                      </div>

                      <button
                        type="submit"
                        disabled={hiringLoading}
                        className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-zinc-800 disabled:text-zinc-600 text-zinc-950 font-black rounded-xl text-xs transition uppercase tracking-widest"
                      >
                        {hiringLoading ? "Locking Escrow..." : "Hire Now / Place Order"}
                      </button>
                    </form>
                  )}
                </div>

                {/* Instant Chat Block */}
                <div className="p-6 flex flex-col h-[30vh]">
                  <h4 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                    <MessageSquare className="w-4 h-4 text-amber-500" />
                    Instant Project Consult
                  </h4>
                  <div className="flex-1 overflow-y-auto bg-zinc-950/70 p-3 rounded-xl border border-zinc-850 space-y-2 mb-2.5">
                    {activeChatLogs.map((chat, idx) => (
                      <div key={idx} className={`p-2.5 rounded-xl text-xs max-w-[85%] ${
                        chat.sender === userProfile?.name 
                          ? 'bg-amber-500/10 border border-amber-500/20 text-white ml-auto text-right' 
                          : 'bg-zinc-900 border border-zinc-800 text-zinc-300 mr-auto'
                      }`}>
                        <span className="text-[9px] font-bold text-zinc-500 block mb-0.5">{chat.sender}</span>
                        <span>{chat.text}</span>
                      </div>
                    ))}
                  </div>
                  <form onSubmit={handleSendChat} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ask questions about timelines, quotes, custom edits..."
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                    <button type="submit" className="p-2 bg-zinc-900 border border-zinc-800 text-amber-500 hover:bg-zinc-800 rounded-lg transition shrink-0">
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
