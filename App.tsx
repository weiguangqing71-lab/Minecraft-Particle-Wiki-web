import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { TerminalBlock } from './components/TerminalBlock';
import { PARTICLES, PRESETS, TRANSLATIONS } from './constants';
import { CommandState, Lang } from './types';

// --- HELPER FUNCTIONS ---
const hexToRgb = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return { 
    r: r.toFixed(2), 
    g: g.toFixed(2), 
    b: b.toFixed(2) 
  };
};

const hexToHue = (hex: string) => {
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;

  if (d === 0) h = 0;
  else if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;

  h = Math.round(h * 60);
  if (h < 0) h += 360;

  // Normalize to 0-1
  return (h / 360).toFixed(2);
};

// --- VISUAL PREVIEW COMPONENT ---
const ParticlePreview: React.FC<{ cmdState: CommandState }> = ({ cmdState }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Track particles
    let particles: {x: number, y: number, vx: number, vy: number, life: number, color: string, size: number}[] = [];
    let animationId: number;

    const getColors = (): string[] => {
      const { particle, dx, dy, dz, count } = cmdState;
      
      // Handle Dust (dust r g b s)
      if (particle.startsWith('dust')) {
         const parts = particle.split(' ');
         if (parts.length >= 4) { 
             const r = Math.floor(parseFloat(parts[1] || '0') * 255);
             const g = Math.floor(parseFloat(parts[2] || '0') * 255);
             const b = Math.floor(parseFloat(parts[3] || '0') * 255);
             return [`rgb(${r},${g},${b})`];
         }
      }

      // Handle Colored Entity Effect / Note (when count is 0)
      if ((particle.includes('entity_effect') || particle.includes('note')) && (count === '0' || count === '0.0')) {
          const r = Math.floor((parseFloat(dx) || 0) * 255);
          const g = Math.floor((parseFloat(dy) || 0) * 255);
          const b = Math.floor((parseFloat(dz) || 0) * 255);
          
          if (particle.includes('note')) return ['#ff0000', '#00ff00', '#0000ff', '#ffff00']; 
          return [`rgb(${Math.max(0,r)},${Math.max(0,g)},${Math.max(0,b)})`];
      }

      // Standard Particle Mappings
      const map: Record<string, string[]> = {
          'flame': ['#ff4500', '#ffa500', '#cf3000'],
          'heart': ['#ff0000', '#cc0000'],
          'crit': ['#ffaa00', '#ffff55'],
          'smoke': ['#555555', '#333333', '#777777'],
          'portal': ['#d02090', '#800080'],
          'end_rod': ['#ffffff', '#eeeeee'],
          'dragon_breath': ['#d02090', '#e030a0'],
          'enchant': ['#ffffff', '#aaaaaa'], 
          'note': ['#ff0000', '#00ff00', '#0000ff', '#ffff00'],
          'cloud': ['#ffffff', '#eeeeee'],
          'witch': ['#800080'],
          'soul': ['#55ffff', '#00aaaa'],
      };
      
      for(const key of Object.keys(map)) {
          if (particle.includes(key)) return map[key];
      }
      return ['#ffffff']; // Default white
    };

    const render = () => {
        // Resize handling
        if (canvas.width !== canvas.clientWidth) {
             canvas.width = canvas.clientWidth;
             canvas.height = canvas.clientHeight;
        }

        // Clear
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw Grid
        ctx.strokeStyle = '#331a00'; 
        ctx.lineWidth = 1;
        ctx.beginPath();
        const gridSize = 20;
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        
        for(let x = cx % gridSize; x < canvas.width; x += gridSize) { ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); }
        for(let y = cy % gridSize; y < canvas.height; y += gridSize) { ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); }
        ctx.stroke();

        // Spawn Logic
        const pCount = parseInt(cmdState.count) || 1;
        const spreadX = parseFloat(cmdState.dx) || 0;
        const spreadY = parseFloat(cmdState.dy) || 0;
        const spd = parseFloat(cmdState.speed) || 0.1;

        // Rate limiter for preview: Spawn up to 5 per frame, max 200 total
        const spawnRate = Math.min(Math.max(1, pCount / 10), 5);
        
        if (particles.length < 200) {
            for(let i=0; i<spawnRate; i++) {
                // Approximate spread area (scaled for visibility)
                const px = (Math.random() - 0.5) * 2 * (spreadX * 20 + 2);
                const py = (Math.random() - 0.5) * 2 * (spreadY * 20 + 2);

                let vx = (Math.random() - 0.5) * spd * 2;
                let vy = (Math.random() - 0.5) * spd * 2;
                
                // Specific particle behaviors
                if (cmdState.particle.includes('flame') || cmdState.particle.includes('smoke') || cmdState.particle.includes('campfire')) {
                    vy -= 0.5 + spd; // Rise up
                }
                if (cmdState.particle.includes('portal') || cmdState.particle.includes('enchant')) {
                    // Move towards center
                    vx = -px * 0.05;
                    vy = -py * 0.05;
                }

                const colors = getColors();
                const color = colors[Math.floor(Math.random() * colors.length)];

                particles.push({
                    x: px,
                    y: py,
                    vx,
                    vy,
                    life: 1.0,
                    color,
                    size: Math.random() * 2 + 1
                });
            }
        }

        // Update & Draw Particles
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.01 + (Math.random() * 0.02); // Random decay

            if (p.life <= 0) {
                particles.splice(i, 1);
                continue;
            }

            const screenX = cx + p.x;
            const screenY = cy + p.y;

            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.fillRect(screenX, screenY, p.size, p.size);
        }
        ctx.globalAlpha = 1.0;
        
        animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [cmdState]);

  return (
    <div className="w-full h-48 bg-black border border-retro-amber/50 mb-4 relative overflow-hidden group">
        <canvas ref={canvasRef} className="w-full h-full block" />
        <div className="absolute top-2 right-2 text-[10px] text-retro-amber-dim uppercase border border-retro-amber-dim/50 px-1 bg-black/50">
           VISUAL_SIM
        </div>
        {/* Simple coordinates overlay */}
        <div className="absolute bottom-2 left-2 text-[10px] text-retro-amber-dim font-mono opacity-50">
           ORIGIN: {cmdState.x} {cmdState.y} {cmdState.z}
        </div>
    </div>
  );
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [lang, setLang] = useState<Lang>('zh'); // Default to Chinese
  
  const t = TRANSLATIONS[lang];

  // Generator State
  const [cmdState, setCmdState] = useState<CommandState>({
    particle: 'flame',
    x: '~', y: '~1', z: '~',
    dx: '0', dy: '0', dz: '0',
    speed: '0.1',
    count: '10',
    mode: 'normal'
  });

  // Track color picker state for each particle
  const [particleColors, setParticleColors] = useState<Record<string, string>>({});

  const [history, setHistory] = useState<CommandState[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (name: string, value: string): string => {
    if (!value.trim()) return 'required';
    
    switch (name) {
      case 'x':
      case 'y':
      case 'z':
        if (!/^([~^]?(\-?\d*(\.\d+)?)?)$/.test(value)) return 'invalid_coord';
        break;
      case 'dx':
      case 'dy':
      case 'dz':
        if (isNaN(Number(value))) return 'invalid_number';
        break;
      case 'speed':
        const s = Number(value);
        if (isNaN(s)) return 'invalid_number';
        if (s < 0) return 'min_zero';
        break;
      case 'count':
        const c = Number(value);
        if (isNaN(c)) return 'invalid_number';
        if (!Number.isInteger(c)) return 'invalid_integer';
        if (c < 0) return 'min_zero';
        break;
    }
    return '';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCmdState(prev => ({ ...prev, [name]: value }));
    
    const errorKey = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: errorKey
    }));
  };

  const generateCommandStr = (state: CommandState) => {
    return `/particle ${state.particle} ${state.x} ${state.y} ${state.z} ${state.dx} ${state.dy} ${state.dz} ${state.speed} ${state.count} ${state.mode}`;
  };

  const generateCommand = () => {
    return generateCommandStr(cmdState);
  };

  const copyToClipboard = (text: string, isPreset: boolean = false) => {
    if (!isPreset) {
      const hasErrors = Object.keys(errors).some(k => errors[k]);
      if (!hasErrors) {
        setHistory(prev => {
          if (prev.length > 0 && generateCommandStr(prev[0]) === text) return prev;
          const newHistory = [cmdState, ...prev];
          return newHistory.slice(0, 10);
        });
      }
    }

    navigator.clipboard.writeText(text);
    alert(t.generator.copied);
  };

  const toggleLang = () => {
    setLang(prev => prev === 'en' ? 'zh' : 'en');
  };

  const renderInput = (name: keyof CommandState, label: string, type: string = 'text', widthClass: string = '') => {
    const errorKey = errors[name];
    const errorMessage = errorKey ? (t.validation as any)[errorKey] : null;
    
    return (
      <div className={widthClass}>
        <label className="text-xs text-retro-amber-dim mb-1 block">{label}</label>
        <input 
          name={name} 
          type={type}
          value={cmdState[name]}
          onChange={handleInputChange}
          className={`w-full bg-black border p-2 text-white focus:outline-none font-mono transition-colors
            ${errorMessage 
              ? 'border-retro-red focus:border-retro-red' 
              : 'border-retro-amber/50 focus:border-retro-amber'
            }`}
        />
        {errorMessage && (
          <span className="text-[10px] text-retro-red mt-1 block uppercase tracking-wider animate-pulse">
            [!] {errorMessage}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen font-mono text-retro-amber selection:bg-retro-amber selection:text-black relative overflow-hidden">
      {/* Scanline Overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] animate-scan opacity-20"></div>
      
      {/* Grid Background */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-retro-bg bg-[linear-gradient(rgba(255,176,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,176,0,0.05)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

      <div className="relative z-10 max-w-7xl mx-auto my-0 md:my-10 border-0 md:border-2 border-retro-amber bg-retro-screen shadow-[0_0_50px_rgba(255,176,0,0.1)] min-h-[90vh] flex flex-col md:flex-row">
        
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} lang={lang} />

        <main className="flex-grow p-6 md:p-10 overflow-y-auto h-[90vh] md:h-auto custom-scrollbar relative">
          
          {/* Header Area */}
          <header className="mb-8 border-b-4 border-retro-amber pb-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl uppercase tracking-[0.2em] font-bold drop-shadow-[0_0_8px_rgba(255,176,0,0.6)]">
                M.I.N.E.C.R.A.F.T. 
              </h1>
              <span className="text-base tracking-normal opacity-80">{t.headers.subtitle}</span>
            </div>

            <button 
              onClick={toggleLang}
              className="border border-retro-amber px-3 py-1 hover:bg-retro-amber hover:text-black transition-colors text-sm uppercase"
            >
              [{lang === 'en' ? 'SWITCH_TO_中文' : 'SWITCH_TO_EN'}]
            </button>
          </header>

          {activeTab === 'overview' && (
            <div className="space-y-6 animate-pulse-fast-once">
              <p className="text-lg leading-relaxed text-justify max-w-3xl">
                {t.overview.init}<br/>
                {t.overview.loading} <span className="text-green-500">{t.overview.complete}</span>
              </p>
              
              <div className="border border-retro-red bg-retro-red/5 p-4 text-retro-red shadow-[0_0_10px_rgba(255,51,51,0.2)]">
                <strong className="block text-xl mb-2">{t.overview.alert_title}</strong>
                {t.overview.alert_desc}
              </div>

              <h2 className="text-2xl mt-12 mb-4 text-black bg-retro-amber inline-block px-2 py-1 font-bold">
                {t.overview.def_title}
              </h2>
              <p className="max-w-3xl opacity-90">
                {t.overview.def_desc}
              </p>
            </div>
          )}

          {activeTab === 'syntax' && (
            <div className="space-y-8">
               <h2 className="text-2xl text-black bg-retro-amber inline-block px-2 py-1 font-bold">
                {t.headers.syntax}
              </h2>
              
              <TerminalBlock 
                label="SYNTAX_REF"
                command="/particle <name> <pos> <delta> <speed> <count> [force|normal] [viewers]" 
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-retro-amber/50 p-4">
                  <h3 className="text-lg font-bold border-b border-retro-amber/30 pb-2 mb-2 text-white">{t.syntax.arg_name_title}</h3>
                  <p className="text-sm opacity-80">{t.syntax.arg_name_desc}</p>
                </div>
                <div className="border border-retro-amber/50 p-4">
                  <h3 className="text-lg font-bold border-b border-retro-amber/30 pb-2 mb-2 text-white">{t.syntax.arg_pos_title}</h3>
                  <p className="text-sm opacity-80">{t.syntax.arg_pos_desc}</p>
                </div>
                <div className="border border-retro-amber/50 p-4">
                  <h3 className="text-lg font-bold border-b border-retro-amber/30 pb-2 mb-2 text-white">{t.syntax.arg_delta_title}</h3>
                  <p className="text-sm opacity-80">{t.syntax.arg_delta_desc}</p>
                </div>
                <div className="border border-retro-amber/50 p-4">
                  <h3 className="text-lg font-bold border-b border-retro-amber/30 pb-2 mb-2 text-white">{t.syntax.arg_speed_title}</h3>
                  <p className="text-sm opacity-80">{t.syntax.arg_speed_desc}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'database' && (
            <div className="space-y-6">
              <h2 className="text-2xl text-black bg-retro-amber inline-block px-2 py-1 font-bold">
                {t.headers.database}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                {PARTICLES.map((p) => {
                  const pColor = particleColors[p.id] || '#ff0000';
                  
                  return (
                    <div key={p.id} className="border border-retro-amber bg-black/50 p-4 hover:bg-retro-amber/10 transition-colors group relative flex flex-col">
                      <div className="absolute top-0 right-0 p-1 text-[10px] border-b border-l border-retro-amber/50 text-retro-amber-dim uppercase">
                        {p.category}
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">{p.name[lang]}</h3>
                      <code className="text-xs bg-retro-amber/10 px-1 py-0.5 text-retro-amber-dim block mb-3 w-fit">
                        minecraft:{p.id}
                      </code>
                      <p className="text-sm opacity-80 mb-4 min-h-[3rem]">{p.description[lang]}</p>
                      
                      {p.note && (
                        <div className="bg-retro-amber/5 border-l-2 border-retro-amber p-2 mb-4 text-[10px] text-retro-amber-dim font-mono leading-tight">
                          <span className="font-bold opacity-75">NOTE:</span> {p.note[lang]}
                        </div>
                      )}

                      <div className="mt-auto space-y-3">
                          {p.supportsColor && (
                            <div className="flex items-center gap-2 bg-retro-amber/5 p-2 border border-retro-amber/20">
                              <label className="text-xs text-retro-amber-dim uppercase w-12">Color:</label>
                              <div className="flex-grow flex items-center gap-2">
                                <input 
                                  type="color" 
                                  value={pColor}
                                  onChange={(e) => setParticleColors(prev => ({...prev, [p.id]: e.target.value}))}
                                  className="bg-black border border-retro-amber h-6 w-8 cursor-pointer p-0.5"
                                />
                                <code className="text-[10px] text-retro-amber/70 font-mono uppercase">{pColor}</code>
                              </div>
                            </div>
                          )}

                          <button 
                          onClick={() => {
                              let defaultId = p.id;
                              let overrides: Partial<CommandState> = {};

                              if (p.supportsColor) {
                                  const hex = particleColors[p.id] || '#ff0000';
                                  const {r, g, b} = hexToRgb(hex);

                                  if (p.id === 'dust') {
                                      defaultId = `dust ${r} ${g} ${b} 1`;
                                  } else if (p.id === 'entity_effect') {
                                       overrides.dx = r;
                                       overrides.dy = g;
                                       overrides.dz = b;
                                       overrides.count = '0';
                                       overrides.speed = '1';
                                  } else if (p.id === 'note') {
                                       const h = hexToHue(hex);
                                       overrides.dx = h;
                                       overrides.count = '0';
                                       overrides.speed = '0';
                                  }
                              } else if (p.example) {
                                  const parts = p.example.split(' ');
                                  if (parts.length > 1) {
                                      defaultId = p.example;
                                  }
                              }

                              setCmdState(prev => ({
                                  ...prev, 
                                  particle: defaultId,
                                  x: '~', y: '~1', z: '~',
                                  dx: '0', dy: '0', dz: '0',
                                  speed: '0.1', count: '10', mode: 'normal',
                                  ...overrides 
                              }));
                              setErrors({});
                          }}
                          className="text-xs border border-retro-amber text-retro-amber px-2 py-2 uppercase hover:bg-retro-amber hover:text-black transition-colors w-full font-bold tracking-wider"
                          >
                          {t.buttons.load}
                          </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'generator' && (
            <div className="space-y-6">
              <h2 className="text-2xl text-black bg-retro-amber inline-block px-2 py-1 font-bold">
                {t.headers.generator}
              </h2>
              
              <div className="bg-black border border-retro-amber p-6 shadow-lg">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column: Inputs */}
                  <div className="space-y-4">
                    
                    <div className="flex flex-col">
                      {renderInput('particle', t.generator.labels.id)}
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {renderInput('x', t.generator.labels.pos_x, 'text', 'text-center')}
                      {renderInput('y', t.generator.labels.pos_y, 'text', 'text-center')}
                      {renderInput('z', t.generator.labels.pos_z, 'text', 'text-center')}
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {renderInput('dx', t.generator.labels.delta_x, 'text', 'text-center')}
                      {renderInput('dy', t.generator.labels.delta_y, 'text', 'text-center')}
                      {renderInput('dz', t.generator.labels.delta_z, 'text', 'text-center')}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       {renderInput('speed', t.generator.labels.speed)}
                       {renderInput('count', t.generator.labels.count, 'number')}
                    </div>
                    
                    <div>
                        <label className="text-xs text-retro-amber-dim mb-1">{t.generator.labels.mode}</label>
                        <select name="mode" value={cmdState.mode} onChange={handleInputChange} className="w-full bg-black border border-retro-amber/50 p-2 text-white focus:border-retro-amber focus:outline-none font-mono">
                          <option value="normal">Normal</option>
                          <option value="force">Force (Visible &gt; 32 blocks)</option>
                        </select>
                    </div>

                  </div>

                  {/* Right Column: Output */}
                  <div className="flex flex-col justify-center">
                    <div className="border border-dashed border-retro-amber p-4 relative h-full flex flex-col justify-center items-center bg-retro-amber/5">
                      
                      {/* --- VISUAL PREVIEW --- */}
                      <ParticlePreview cmdState={cmdState} />

                      <div className="text-xs absolute top-2 left-2 text-retro-amber-dim">{t.generator.preview}</div>
                      
                      <div className="w-full break-all font-mono text-lg mb-6 text-center text-white drop-shadow-md">
                        {generateCommand()}
                      </div>

                      <button 
                        onClick={() => copyToClipboard(generateCommand())}
                        className="bg-retro-amber text-black font-bold uppercase py-3 px-8 hover:bg-white transition-colors shadow-[0_0_15px_rgba(255,176,0,0.5)]"
                      >
                        {t.generator.copy}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* History Section */}
              <div className="border-t border-retro-amber/30 pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-retro-amber uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 bg-retro-amber inline-block"></span>
                    {t.generator.history}
                  </h3>
                  {history.length > 0 && (
                      <button onClick={() => setHistory([])} className="text-xs text-retro-red hover:bg-retro-red/10 px-2 py-1 border border-transparent hover:border-retro-red/30 transition-all">
                          {t.generator.clear}
                      </button>
                  )}
                </div>
                
                {history.length === 0 ? (
                    <div className="text-retro-amber-dim text-sm italic p-4 border border-dashed border-retro-amber/10 bg-black/30">
                      {t.generator.empty}
                    </div>
                ) : (
                    <div className="grid gap-2 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                      {history.map((h, i) => (
                          <div key={i} className="flex justify-between items-center bg-black/40 border border-retro-amber/20 p-3 hover:bg-retro-amber/10 transition-colors group">
                              <code className="text-xs text-retro-amber/80 truncate max-w-[70%] font-mono">
                                  {generateCommandStr(h)}
                              </code>
                              <button
                                  onClick={() => {
                                      setCmdState(h);
                                      setErrors({});
                                  }}
                                  className="text-[10px] border border-retro-amber/30 px-3 py-1 text-retro-amber uppercase hover:bg-retro-amber hover:text-black hover:border-retro-amber transition-all"
                              >
                                  {t.buttons.restore}
                              </button>
                          </div>
                      ))}
                    </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'presets' && (
             <div className="space-y-6">
               <h2 className="text-2xl text-black bg-retro-amber inline-block px-2 py-1 font-bold">
                 {t.headers.presets}
               </h2>
               
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                 {PRESETS.map((preset) => (
                   <div key={preset.id} className="border border-retro-amber bg-black p-5 flex flex-col hover:shadow-[0_0_20px_rgba(255,176,0,0.15)] transition-all">
                     <h3 className="text-xl font-bold text-white mb-2 pb-2 border-b border-retro-amber/30">{preset.name[lang]}</h3>
                     <p className="text-sm text-retro-amber-dim mb-4 h-12 overflow-hidden">{preset.description[lang]}</p>
                     
                     <div className="bg-retro-screen border border-retro-amber/30 p-2 mb-4 font-mono text-xs text-retro-amber break-all h-20 overflow-y-auto custom-scrollbar opacity-80">
                       {preset.command}
                     </div>

                     <button 
                       onClick={() => copyToClipboard(preset.command, true)}
                       className="mt-auto bg-retro-amber/10 border border-retro-amber text-retro-amber uppercase py-2 hover:bg-retro-amber hover:text-black transition-colors font-bold tracking-wider"
                     >
                       {t.buttons.copy}
                     </button>
                   </div>
                 ))}
               </div>
             </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default App;