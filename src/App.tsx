import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { AIVideoEditor } from './components/AIVideoEditor';
import { AIThumbnailGenerator } from './components/AIThumbnailGenerator';
import { AIChatAssistant } from './components/AIChatAssistant';
import { EditorDirectory } from './components/EditorDirectory';
import { EditorDashboard } from './components/EditorDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { 
  Sparkles, 
  Video, 
  LayoutGrid, 
  Users, 
  MessageSquare, 
  ShieldAlert,
  Sliders,
  Play
} from 'lucide-react';

function AppContent() {
  const { user, userProfile, editorProfile } = useApp();
  const [activeTab, setActiveTab] = useState<string>('video-editor');

  const openBecomeEditor = () => {
    setActiveTab('editor-dashboard');
  };

  const renderActiveTab = () => {
    switch(activeTab) {
      case 'video-editor':
        return <AIVideoEditor />;
      case 'thumbnail-gen':
        return <AIThumbnailGenerator />;
      case 'chat-assistant':
        return <AIChatAssistant />;
      case 'editor-directory':
        return <EditorDirectory />;
      case 'editor-dashboard':
        return <EditorDashboard />;
      case 'admin-dashboard':
        return <AdminDashboard />;
      default:
        return <AIVideoEditor />;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-amber-500 selection:text-zinc-950">
      
      {/* Navigation Bar */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        openBecomeEditor={openBecomeEditor} 
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Dynamic Header Promo Banner */}
        <div className="relative p-6 sm:p-8 bg-zinc-900 border border-zinc-850 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          
          {/* Radial amber backdrop glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-tr from-amber-500/5 to-orange-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full uppercase tracking-widest">
                RT Editor Freelance Network
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              Premium AI Video Suite & Freelance Hub
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl">
              Automate subtitle timing, draft high retention vlog hooks, and design vibrant thumbnails. Or find certified editor networks to execute your creative directions perfectly!
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setActiveTab('editor-directory')}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-zinc-950 text-xs font-black rounded-xl transition shadow-lg shadow-amber-500/15 uppercase tracking-wider"
            >
              <Users className="w-3.5 h-3.5" />
              Find Freelancers
            </button>
            
            {!editorProfile && (
              <button
                onClick={openBecomeEditor}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-white text-xs font-bold rounded-xl transition uppercase tracking-wider"
              >
                Become Editor
              </button>
            )}
          </div>

        </div>

        {/* Tab content view container */}
        <div className="min-h-[50vh]">
          {renderActiveTab()}
        </div>

      </main>

      {/* Mobile Sticky Footer Tab Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 border-t border-zinc-900 p-2 flex justify-around items-center backdrop-blur">
        <button
          onClick={() => setActiveTab('video-editor')}
          className={`flex flex-col items-center p-1.5 text-[9px] font-bold ${activeTab === 'video-editor' ? 'text-amber-500' : 'text-zinc-500'}`}
        >
          <Video className="w-4 h-4 mb-0.5" />
          Editor
        </button>
        <button
          onClick={() => setActiveTab('thumbnail-gen')}
          className={`flex flex-col items-center p-1.5 text-[9px] font-bold ${activeTab === 'thumbnail-gen' ? 'text-amber-500' : 'text-zinc-500'}`}
        >
          <LayoutGrid className="w-4 h-4 mb-0.5" />
          Thumbnails
        </button>
        <button
          onClick={() => setActiveTab('chat-assistant')}
          className={`flex flex-col items-center p-1.5 text-[9px] font-bold ${activeTab === 'chat-assistant' ? 'text-amber-500' : 'text-zinc-500'}`}
        >
          <Sparkles className="w-4 h-4 mb-0.5" />
          AI Chat
        </button>
        <button
          onClick={() => setActiveTab('editor-directory')}
          className={`flex flex-col items-center p-1.5 text-[9px] font-bold ${activeTab === 'editor-directory' ? 'text-amber-500' : 'text-zinc-500'}`}
        >
          <Users className="w-4 h-4 mb-0.5" />
          Freelance
        </button>
        {editorProfile && (
          <button
            onClick={() => setActiveTab('editor-dashboard')}
            className={`flex flex-col items-center p-1.5 text-[9px] font-bold ${activeTab === 'editor-dashboard' ? 'text-amber-500' : 'text-zinc-500'}`}
          >
            <Sliders className="w-4 h-4 mb-0.5" />
            My Studio
          </button>
        )}
      </div>

      {/* Desktop simple footer */}
      <footer className="py-6 border-t border-zinc-900 text-center text-[11px] text-zinc-600 hidden sm:block">
        <p>© 2026 RT EDITOR Inc. Powered by Firebase, Gemini Pro, and Web-Canvas Transcoders. All rights reserved.</p>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
