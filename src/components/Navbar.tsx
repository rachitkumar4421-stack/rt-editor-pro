import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LoginModal } from './LoginModal';
import { 
  Bell, 
  User, 
  LogOut, 
  Sliders, 
  UserCheck, 
  Sparkles, 
  LayoutGrid, 
  Search, 
  ShieldAlert, 
  X, 
  CircleDot 
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openBecomeEditor: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, openBecomeEditor }) => {
  const { user, userProfile, editorProfile, notifications, logout } = useApp();
  const [showLogin, setShowLogin] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo and Brand */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('video-editor')}>
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-600 shadow-md">
            <Sliders className="w-4 h-4 text-zinc-950" />
          </div>
          <div className="flex flex-col">
            <span className="text-md font-extrabold tracking-wider text-white">RT EDITOR</span>
            <span className="text-[9px] font-bold tracking-widest text-amber-500 bg-amber-500/10 px-1 rounded uppercase">AI PRO</span>
          </div>
        </div>

        {/* View Selection Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-zinc-900/55 border border-zinc-800/60 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('video-editor')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'video-editor' 
                ? 'bg-amber-500 text-zinc-950' 
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI Video Editor
          </button>
          
          <button
            onClick={() => setActiveTab('thumbnail-gen')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'thumbnail-gen' 
                ? 'bg-amber-500 text-zinc-950' 
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Thumbnail Designer
          </button>

          <button
            onClick={() => setActiveTab('chat-assistant')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'chat-assistant' 
                ? 'bg-amber-500 text-zinc-950' 
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI Assistant
          </button>

          <button
            onClick={() => setActiveTab('editor-directory')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'editor-directory' 
                ? 'bg-amber-500 text-zinc-950' 
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            Find Editors
          </button>

          {editorProfile && (
            <button
              onClick={() => setActiveTab('editor-dashboard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'editor-dashboard' 
                  ? 'bg-amber-500 text-zinc-950' 
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              Editor Dashboard
            </button>
          )}

          {userProfile?.role === 'admin' && (
            <button
              onClick={() => setActiveTab('admin-dashboard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'admin-dashboard' 
                  ? 'bg-amber-500 text-zinc-950' 
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Admin
            </button>
          )}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          
          {/* Become Editor Trigger */}
          {user && !editorProfile && (
            <button
              onClick={openBecomeEditor}
              className="hidden lg:flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-extrabold text-amber-500 border border-amber-500/30 hover:bg-amber-500/10 transition"
            >
              Become an Editor
            </button>
          )}

          {/* Notifications Trigger */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white transition relative"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-[10px] font-extrabold text-white flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
                  <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                    <span className="text-xs font-extrabold text-white uppercase tracking-wider">In-App Notifications</span>
                    <button 
                      onClick={() => setShowNotifications(false)}
                      className="text-zinc-500 hover:text-white p-0.5"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="mt-3 space-y-2 max-h-60 overflow-y-auto pr-1">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-zinc-500 text-center py-4">No recent notifications</p>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className="p-2.5 rounded-xl bg-zinc-950/50 border border-zinc-800/60 text-left">
                          <div className="flex items-center gap-1.5">
                            <CircleDot className="w-2.5 h-2.5 text-amber-500 shrink-0" />
                            <span className="text-xs font-bold text-white">{n.title}</span>
                          </div>
                          <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">{n.message}</p>
                          <span className="text-[9px] text-zinc-600 mt-1 block">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Auth Button */}
          {user ? (
            <div className="flex items-center gap-2 bg-zinc-900/40 p-1 pl-2.5 pr-2.5 border border-zinc-800 rounded-xl">
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-xs font-bold text-white">{userProfile?.name || 'User'}</span>
                <span className="text-[9px] text-zinc-500 font-medium capitalize">{userProfile?.role || 'Client'}</span>
              </div>
              <button
                onClick={logout}
                title="Sign Out"
                className="p-1.5 rounded-lg hover:bg-zinc-800/60 text-zinc-400 hover:text-red-400 transition ml-1"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowLogin(true)}
              className="flex items-center gap-1.5 px-4.5 py-2 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-xl text-xs transition shadow-lg shadow-amber-500/15"
            >
              <User className="w-3.5 h-3.5" />
              Sign In
            </button>
          )}

        </div>
      </div>

      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </header>
  );
};
