import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Sparkles, 
  Send, 
  BookOpen, 
  HelpCircle, 
  Zap, 
  PlusCircle,
  MessageCircle,
  Clock
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const AIChatAssistant: React.FC = () => {
  const { user } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hi! I'm your RT Editor AI Assistant. Ask me how to pacing-cut vlogs, write viral hook scripts, suggest cinematic color grading formulas, or improve subtitle readability!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (textToSend?: string) => {
    const rawMsg = textToSend || input;
    if (!rawMsg.trim()) return;

    // Add user message
    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      role: 'user',
      content: rawMsg,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const chatHistory = [...messages, userMsg].map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: chatHistory
        })
      });
      const data = await response.json();
      
      const assistantMsg: ChatMessage = {
        id: Math.random().toString(),
        role: 'assistant',
        content: data.text || "I apologize, I experienced an integration issue. How else can I help you?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      const errMsg: ChatMessage = {
        id: Math.random().toString(),
        role: 'assistant',
        content: "Failed to establish secure communications with the server. Please verify your internet connections.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    { title: "Generate Travel Vlog Hooks", prompt: "Create 3 engaging high retention hook scripts for a Travel Vlog in Tokyo." },
    { title: "Suggest Cinematic Color Lookup", prompt: "Suggest color grading LUT values or adjustment layers for a Moody Cyberpunk aesthetic." },
    { title: "Beats Cut Synchronization", prompt: "What are the core practices to sync raw action video clips precisely to fast tempo music beats?" }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[75vh]">
      
      {/* Quick reference guide left */}
      <div className="lg:col-span-4 space-y-4 hidden lg:block">
        
        <div className="bg-zinc-900 border border-zinc-850 p-5 rounded-2xl space-y-4">
          <h4 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-amber-500" />
            AI Editorial Reference
          </h4>
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            RT Editor's AI Chat companion uses fine-tuned models to guide formatting, pacing rules, thumbnail copy rates, and export configurations.
          </p>
          <div className="space-y-2">
            <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-850 text-xs">
              <span className="font-bold text-white block mb-0.5">Rule of 3 Pacing</span>
              <span className="text-zinc-400 text-[11px]">Make a cut or apply scaling/zoom variations every 3 seconds to preserve optimal audience retention.</span>
            </div>
            <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-850 text-xs">
              <span className="font-bold text-white block mb-0.5">Dynamic Subtitles</span>
              <span className="text-zinc-400 text-[11px]">Keep captions centered, limited to 2-3 words per line, using high contrast colors.</span>
            </div>
          </div>
        </div>

        {/* Quick Prompts */}
        <div className="bg-zinc-900 border border-zinc-850 p-5 rounded-2xl space-y-3.5">
          <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">Suggested Prompts</h4>
          <div className="space-y-2">
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(qp.prompt)}
                className="w-full text-left p-3 bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 rounded-xl text-xs text-zinc-300 font-medium transition flex items-center gap-2"
              >
                <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>{qp.title}</span>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Main Chat Box right */}
      <div className="lg:col-span-8 flex flex-col justify-between bg-zinc-900 border border-zinc-850 rounded-3xl overflow-hidden h-full">
        
        {/* Chat header */}
        <div className="px-5 py-4 border-b border-zinc-850 bg-zinc-950/45 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-extrabold text-white uppercase tracking-wider">RT EDITOR Chat AI</span>
          </div>
          <span className="text-[10px] text-zinc-500">Supercharged by Gemini</span>
        </div>

        {/* Chat Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-zinc-950/25">
          {messages.map((m) => (
            <div 
              key={m.id}
              className={`flex flex-col max-w-[85%] ${m.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
            >
              <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                m.role === 'user' 
                  ? 'bg-amber-500 text-zinc-950 font-semibold shadow-lg shadow-amber-500/5' 
                  : 'bg-zinc-950 border border-zinc-850 text-zinc-300'
              }`}>
                {m.content}
              </div>
              <span className="text-[9px] text-zinc-500 mt-1 flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" />
                {m.timestamp}
              </span>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 p-3 bg-zinc-950 border border-zinc-850 text-zinc-400 rounded-2xl text-xs w-max animate-pulse">
              <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
              <span>AI Companion is thinking...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="p-4 border-t border-zinc-850 bg-zinc-950/50 flex gap-2.5"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your creative editorial queries or paste vlog transcripts here..."
            className="flex-1 px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-amber-500 transition"
          />
          <button 
            type="submit" 
            disabled={loading || !input.trim()}
            className="p-3 bg-amber-500 hover:bg-amber-600 disabled:bg-zinc-800 disabled:text-zinc-600 text-zinc-950 rounded-xl transition shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>

    </div>
  );
};
