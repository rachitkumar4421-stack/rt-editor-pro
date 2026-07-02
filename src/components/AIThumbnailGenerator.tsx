import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Sparkles, 
  Download, 
  Image as ImageIcon, 
  Type, 
  Layers, 
  RefreshCw,
  Sliders,
  CheckCircle2
} from 'lucide-react';

export const AIThumbnailGenerator: React.FC = () => {
  const { user } = useApp();
  
  // Custom design configurations
  const [title, setTitle] = useState('UNLEASH THE POWER');
  const [subtitle, setSubtitle] = useState('Supercharge Your Pacing');
  const [theme, setTheme] = useState('Cyberpunk Neon');
  const [style, setStyle] = useState('Bold YouTube');

  // Generated specifications state
  const [designSpec, setDesignSpec] = useState<any>({
    backgroundColor: '#07070a',
    accentColor: '#fbbf24',
    textColor: '#ffffff',
    title: 'UNLEASH THE POWER',
    subtitle: 'SUPERCHARGE YOUR PACING',
    emojis: ['⚡', '🔥'],
    layoutType: 'left-split',
    compositionElements: ['mesh-gradient', 'glow-radial', 'neon-border']
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Redraw Canvas whenever designSpec, title, or subtitle updates
  useEffect(() => {
    drawThumbnail();
  }, [designSpec, title, subtitle]);

  const drawThumbnail = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Standard YouTube 16:9 Thumbnail dimensions
    const width = 1280;
    const height = 720;
    canvas.width = width;
    canvas.height = height;

    // 1. Draw Background
    const gradient = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, width / 1.2);
    gradient.addColorStop(0, designSpec.accentColor + '22'); // subtle glow color
    gradient.addColorStop(1, designSpec.backgroundColor);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Decorative composition elements (e.g., mesh glow or grids)
    if (designSpec.compositionElements.includes('mesh-gradient')) {
      ctx.fillStyle = designSpec.accentColor + '11';
      ctx.beginPath();
      ctx.arc(width * 0.8, height * 0.2, 350, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ef444408'; // red accent flare
      ctx.beginPath();
      ctx.arc(width * 0.2, height * 0.8, 400, 0, Math.PI * 2);
      ctx.fill();
    }

    if (designSpec.compositionElements.includes('neon-border')) {
      ctx.strokeStyle = designSpec.accentColor + '77';
      ctx.lineWidth = 12;
      ctx.strokeRect(10, 10, width - 20, height - 20);
    }

    // 2. Render Text Content based on layout type
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';

    const layout = designSpec.layoutType;

    if (layout === 'left-split') {
      // Draw split visual indicator or banner on the right
      ctx.fillStyle = 'rgba(255, 255, 255, 0.015)';
      ctx.fillRect(width * 0.6, 0, width * 0.4, height);
      
      // Giant neon decorative stripe
      ctx.strokeStyle = designSpec.accentColor + '33';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(width * 0.6, 0);
      ctx.lineTo(width * 0.6, height);
      ctx.stroke();

      // Draw Main Title Left
      ctx.textAlign = 'left';
      
      // Title Glow Effect
      ctx.shadowColor = designSpec.accentColor;
      ctx.shadowBlur = 15;

      ctx.font = 'black 64px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 72px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
      
      // Word wrap title if long
      const words = title.toUpperCase().split(' ');
      let line1 = '';
      let line2 = '';
      if (words.length > 2) {
        line1 = words.slice(0, 2).join(' ');
        line2 = words.slice(2).join(' ');
      } else {
        line1 = title.toUpperCase();
      }

      ctx.fillStyle = designSpec.accentColor;
      ctx.fillText(line1, 80, height * 0.35);
      
      if (line2) {
        ctx.fillStyle = '#ffffff';
        ctx.fillText(line2, 80, height * 0.5);
      }

      // Draw Subtitle Left
      ctx.shadowBlur = 0;
      ctx.font = 'bold 36px sans-serif';
      ctx.fillStyle = '#a1a1aa'; // slate-400
      ctx.fillText(subtitle, 80, line2 ? height * 0.65 : height * 0.52);

      // Render giant Emojis on the Right
      ctx.font = '160px serif';
      ctx.textAlign = 'center';
      if (designSpec.emojis && designSpec.emojis.length > 0) {
        ctx.fillText(designSpec.emojis[0], width * 0.8, height * 0.45);
        if (designSpec.emojis.length > 1) {
          ctx.font = '110px serif';
          ctx.fillText(designSpec.emojis[1], width * 0.82, height * 0.7);
        }
      }

    } else if (layout === 'centered-bold') {
      // Centered layout
      ctx.textAlign = 'center';

      // Draw emojis flanking the title
      ctx.font = '100px serif';
      if (designSpec.emojis && designSpec.emojis.length > 0) {
        ctx.fillText(designSpec.emojis[0], width * 0.2, height * 0.4);
        if (designSpec.emojis.length > 1) {
          ctx.fillText(designSpec.emojis[1], width * 0.8, height * 0.4);
        }
      }

      // Main Title
      ctx.shadowColor = designSpec.accentColor;
      ctx.shadowBlur = 20;
      ctx.font = '900 80px sans-serif';
      ctx.fillStyle = designSpec.accentColor;
      ctx.fillText(title.toUpperCase(), width / 2, height * 0.42);

      // Subtitle
      ctx.shadowBlur = 0;
      ctx.font = 'bold 38px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(subtitle, width / 2, height * 0.58);

    } else {
      // Diagonal/Split layout default
      ctx.textAlign = 'left';
      
      // Background colored block on the left
      ctx.fillStyle = designSpec.accentColor + '15';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(width * 0.55, 0);
      ctx.lineTo(width * 0.4, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fill();

      // Main Title
      ctx.font = '900 70px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(title.toUpperCase(), 70, height * 0.38);

      // Subtitle
      ctx.font = 'bold 34px sans-serif';
      ctx.fillStyle = designSpec.accentColor;
      ctx.fillText(subtitle, 70, height * 0.52);

      // Emojis floating right
      ctx.font = '150px serif';
      ctx.textAlign = 'center';
      if (designSpec.emojis && designSpec.emojis.length > 0) {
        ctx.fillText(designSpec.emojis[0], width * 0.75, height * 0.48);
      }
    }
  };

  // Trigger Gemini API to generate the perfect high converting color palette and emojis
  const handleGenerateDesign = async () => {
    setLoading(true);
    setSuccess(false);
    try {
      const response = await fetch('/api/gemini/thumbnail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, subtitle, theme, style })
      });
      const data = await response.json();
      if (data) {
        setDesignSpec(data);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Gemini design trigger failed", err);
    } finally {
      setLoading(false);
    }
  };

  // Download rendered canvas as PNG
  const handleDownloadPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `RT_EDITOR_THUMBNAIL_${title.toLowerCase().replace(/\s+/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      {/* Canvas Designer Preview Left (col-span-8) */}
      <div className="lg:col-span-8 space-y-4">
        
        {/* Responsive Canvas Wrapper */}
        <div className="relative aspect-video rounded-3xl bg-zinc-950 border border-zinc-850 overflow-hidden shadow-2xl flex items-center justify-center">
          <canvas 
            ref={canvasRef} 
            className="w-full h-full object-contain select-none"
          />
        </div>

        {/* Thumbnail Designer Toolbar */}
        <div className="bg-zinc-900 border border-zinc-850 p-4 rounded-2xl flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Active Canvas:</span>
            <span className="text-xs font-bold text-white bg-zinc-950 border border-zinc-800 px-3 py-1.5 rounded-xl capitalize">
              Layout: {designSpec.layoutType.replace('-', ' ')}
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleDownloadPNG}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-zinc-950 font-extrabold rounded-xl text-xs uppercase tracking-wider transition shadow-lg shadow-amber-500/10"
            >
              <Download className="w-3.5 h-3.5" />
              Download PNG
            </button>
          </div>
        </div>

        {success && (
          <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs animate-in slide-in-from-bottom-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Gemini successfully structured a matching cyberpunk color palette & layouts! Redrawn instantly.</span>
          </div>
        )}

      </div>

      {/* Inputs Form Right (col-span-4) */}
      <div className="lg:col-span-4 space-y-6">
        
        <div className="bg-zinc-900 border border-zinc-850 p-5 rounded-2xl space-y-4">
          <h4 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            AI Designer Prompts
          </h4>

          <div className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-wider block">Thumbnail Theme Vibe</label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 rounded-xl focus:outline-none"
              >
                <option value="Cyberpunk Neon">Cyberpunk Neon</option>
                <option value="Moody Cinematic">Moody Cinematic Dark</option>
                <option value="Bright Gaming Duotone">Bright Gaming Duotone</option>
                <option value="Golden Sunset Warm">Golden Sunset Warm</option>
                <option value="Minimalist Clean Professional">Minimalist Clean Professional</option>
              </select>
            </div>

            <button
              onClick={handleGenerateDesign}
              disabled={loading}
              className="w-full py-2.5 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-amber-500 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-md uppercase tracking-wider"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              {loading ? "Re-structuring..." : "AI Generate Layout"}
            </button>
          </div>
        </div>

        {/* Text Customizer Form */}
        <div className="bg-zinc-900 border border-zinc-850 p-5 rounded-2xl space-y-4">
          <h4 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Type className="w-4 h-4 text-amber-500" />
            Real-time Text Customizer
          </h4>

          <div className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-wider block">Headline Header</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., CINEMATIC OUTLINE"
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 text-xs text-white rounded-xl focus:outline-none focus:border-amber-500 transition"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-wider block">Sub-headline / Label</label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g., 5 simple pacing secrets"
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 text-xs text-white rounded-xl focus:outline-none focus:border-amber-500 transition"
              />
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
