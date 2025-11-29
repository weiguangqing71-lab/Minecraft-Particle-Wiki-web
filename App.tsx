import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { TerminalBlock } from './components/TerminalBlock';
import { PARTICLES, PRESETS, TRANSLATIONS } from './constants';
import { CommandState, Lang } from './types';

// --- HELPERS ---
const hexToRgb = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return { r, g, b };
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
  return (h / 360).toFixed(2);
};

// Parse Command
const parseCommandToState = (cmdString: string): CommandState | null => {
  const clean = cmdString.replace(/^\/?particle\s+/, '');
  const parts = clean.split(' ');
  const len = parts.length;
  if (len < 9) return null;
  return {
    mode: parts[len-1] as 'force'|'normal',
    count: parts[len-2],
    speed: parts[len-3],
    dz: parts[len-4],
    dy: parts[len-5],
    dx: parts[len-6],
    z: parts[len-7],
    y: parts[len-8],
    x: parts[len-9],
    particle: parts.slice(0, len-9).join(' ')
  };
};

const generateCommandStr = (state: CommandState) => {
  return `/particle ${state.particle} ${state.x} ${state.y} ${state.z} ${state.dx} ${state.dy} ${state.dz} ${state.speed} ${state.count} ${state.mode}`;
};

// --- COMPONENTS ---

const Toast = ({ message, show }: { message: string, show: boolean }) => {
  return (
    <div className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 z-[9999] transition-all duration-300 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
      <div className="bg-black border border-retro-amber px-6 py-3 shadow-[0_0_15px_rgba(255,176,0,0.3)] flex items-center gap-3">
        <div className="w-2 h-2 bg-retro-amber animate-pulse"></div>
        <span className="text-retro-amber font-mono text-sm uppercase tracking-wider">{message}</span>
      </div>
    </div>
  );
};

// --- VISUAL PREVIEW COMPONENT ---
const ParticlePreview: React.FC<{ cmdState: CommandState }> = ({ cmdState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: {x: number, y: number, vx: number, vy: number, life: number, color: string, size: number}[] = [];
    let animationId: number;

    const getColors = (): string[] => {
      const { particle, dx, dy, dz, count } = cmdState;
      
      if (particle.startsWith('dust')) {
         const parts = particle.split(' ');
         if (parts.length >= 4) { 
             const r = Math.floor(parseFloat(parts[1] || '0') * 255);
             const g = Math.floor(parseFloat(parts[2] || '0') * 255);
             const b = Math.floor(parseFloat(parts[3] || '0') * 255);
             return [`rgb(${r},${g},${b})`];
         }
      }

      if ((particle.includes('entity_effect') || particle.includes('note')) && (count === '0' || count === '0.0')) {
          const r = Math.floor((parseFloat(dx) || 0) * 255);
          const g = Math.floor((parseFloat(dy) || 0) * 255);
          const b = Math.floor((parseFloat(dz) || 0) * 255);
          if (particle.includes('note')) return ['#ff0000', '#00ff00', '#0000ff', '#ffff00']; 
          return [`rgb(${Math.max(0,r)},${Math.max(0,g)},${Math.max(0,b)})`];
      }

      const map: Record<string, string[]> = {
          'flame': ['#ff4500', '#ffa500', '#cf3000'],
          'trial_spawner': ['#ffaa00', '#ff8800', '#cc5500'],
          'ominous': ['#00aaaa', '#00ffaa', '#0044aa'],
          'pale_oak': ['#eeeeee', '#dddddd', '#cccccc'],
          'creaking': ['#ffaa00', '#aa5500'],
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
          'electric_spark': ['#ffffaa', '#ffffff'],
          'sonic_explosion': ['#aaddff', '#ffffff'],
          'cherry_leaves': ['#ffb7c5', '#ffc0cb'],
          'squid_ink': ['#000000', '#1a1a1a'],
          'snowflake': ['#ffffff', '#eeeeee'],
          'happy_villager': ['#00ff00', '#55ff55'],
          'lava': ['#ff4500', '#cf1020'],
          'vault': ['#aaaaaa', '#ffaa00']
      };
      
      for(const key of Object.keys(map)) {
          if (particle.includes(key)) return map[key];
      }
      return ['#ffffff']; 
    };

    const getPhysics = (id: string) => {
        let gravity = 0;
        let drag = 0.95;
        let baseVy = 0;
        let collide = false;
        
        if (id.includes('flame') || id.includes('smoke') || id.includes('campfire') || id.includes('soul') || id.includes('bubble') || id.includes('nautilus') || id.includes('ink') || id.includes('spawner') || id.includes('ominous')) {
            gravity = -0.03; 
            baseVy = -0.5;
            drag = 0.96;
        } else if (id.includes('lava') || id.includes('water') || id.includes('drip') || id.includes('tear') || id.includes('sculk_charge')) {
             gravity = 0.05; 
             collide = true;
        } else if (id.includes('cherry') || id.includes('leaves') || id.includes('pale_oak')) {
             gravity = 0.015; 
             drag = 0.92;
        } else if (id.includes('firework')) {
             gravity = 0.04;
             drag = 0.98;
        } else if (id.includes('snowflake') || id.includes('ash') || id.includes('spore') || id.includes('gust')) {
             gravity = 0.005;
             drag = 0.90;
        } else if (id.includes('cloud')) {
            gravity = 0;
            drag = 0.98;
        }

        return { gravity, drag, baseVy, collide };
    };

    const render = () => {
        if (canvas.width !== canvas.clientWidth) {
             canvas.width = canvas.clientWidth;
             canvas.height = canvas.clientHeight;
        }

        const width = canvas.width;
        const height = canvas.height;
        const cx = width / 2;
        const cy = height / 2;

        // Reset composite operation to ensure background clears correctly
        ctx.globalCompositeOperation = 'source-over';

        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, width, height);
        
        ctx.strokeStyle = '#331a00'; 
        ctx.lineWidth = 1;
        ctx.beginPath();
        const gridSize = 20;
        for(let x = cx % gridSize; x < width; x += gridSize) { ctx.moveTo(x, 0); ctx.lineTo(x, height); }
        for(let y = cy % gridSize; y < height; y += gridSize) { ctx.moveTo(0, y); ctx.lineTo(width, y); }
        ctx.stroke();

        const phys = getPhysics(cmdState.particle);
        const pCount = parseInt(cmdState.count) || 1;
        const spreadX = parseFloat(cmdState.dx) || 0;
        const spreadY = parseFloat(cmdState.dy) || 0;
        const spd = parseFloat(cmdState.speed) || 0.1;
        const spawnRate = Math.min(Math.max(1, pCount / 10), 10);
        
        if (particles.length < 300) {
            for(let i=0; i<spawnRate; i++) {
                const px = (Math.random() - 0.5) * 2 * (spreadX * 20 + 2);
                const py = (Math.random() - 0.5) * 2 * (spreadY * 20 + 2);
                let vx = (Math.random() - 0.5) * spd * 3;
                let vy = (Math.random() - 0.5) * spd * 3;
                
                if (cmdState.particle.includes('portal') || cmdState.particle.includes('enchant') || cmdState.particle.includes('reverse') || cmdState.particle.includes('vault')) {
                    const angle = Math.random() * Math.PI * 2;
                    const radius = 20 + Math.random() * 40;
                    const startX = px || (Math.cos(angle) * radius);
                    const startY = py || (Math.sin(angle) * radius);
                    vx = -startX * 0.05; 
                    vy = -startY * 0.05;
                } else {
                    vy += phys.baseVy;
                }

                const colors = getColors();
                const color = colors[Math.floor(Math.random() * colors.length)];

                particles.push({
                    x: px,
                    y: py,
                    vx, vy,
                    life: 1.0,
                    color,
                    size: Math.random() * 2 + 1
                });
            }
        }

        if (cmdState.particle.includes('flame') || cmdState.particle.includes('magic') || cmdState.particle.includes('portal') || cmdState.particle.includes('firework') || cmdState.particle.includes('light') || cmdState.particle.includes('spawner') || cmdState.particle.includes('ominous') || cmdState.particle.includes('creaking')) {
           ctx.globalCompositeOperation = 'lighter';
        } else {
           ctx.globalCompositeOperation = 'source-over';
        }

        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            
            p.vx *= phys.drag;
            p.vy *= phys.drag;
            p.vy += phys.gravity;

            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.01 + (Math.random() * 0.01);

            // Floor collision logic (simulated floor at bottom of canvas)
            if (phys.collide && (cy + p.y > height - 10)) {
                p.y = height/2 - 10; // Reset to floor level relative to center
                p.vy = -p.vy * 0.5; // Bounce with dampening
                p.vx *= 0.8; // Friction
                if(Math.abs(p.vy) < 0.5) {
                    p.life -= 0.05; // Quick decay on rest
                }
            }

            if (p.life <= 0) {
                particles.splice(i, 1);
                continue;
            }

            const screenX = cx + p.x;
            const screenY = cy + p.y;

            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.fillRect(Math.floor(screenX), Math.floor(screenY), p.size, p.size);
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
        <div className="absolute bottom-2 left-2 text-[10px] text-retro-amber-dim font-mono opacity-50">
           ORIGIN: {cmdState.x} {cmdState.y} {cmdState.z}
        </div>
    </div>
  );
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [lang, setLang] = useState<Lang>('zh'); 
  const t = TRANSLATIONS[lang];

  // Toast State
  const [toast, setToast] = useState({ show: false, msg: '' });

  const showToast = (msg: string) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 2000);
  };

  const [cmdState, setCmdState] = useState<CommandState>({
    particle: 'flame',
    x: '~', y: '~1', z: '~',
    dx: '0', dy: '0', dz: '0',
    speed: '0.1',
    count: '10',
    mode: 'normal'
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [activePreset, setActivePreset] = useState<any>(null);
  const [particleColors, setParticleColors] = useState<Record<string, string>>({});
  const [history, setHistory] = useState<CommandState[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (name: string, value: string): string => {
    if (!value.trim()) return 'required';
    switch (name) {
      case 'x': case 'y': case 'z':
        if (!/^([~^]?(\-?\d*(\.\d+)?)?)$/.test(value)) return 'invalid_coord';
        break;
      case 'dx': case 'dy': case 'dz':
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
    setErrors(prev => ({ ...prev, [name]: errorKey }));
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
    showToast(t.toast.success);
  };

  const toggleLang = () => setLang(prev => prev === 'en' ? 'zh' : 'en');

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
            ${errorMessage ? 'border-retro-red focus:border-retro-red' : 'border-retro-amber/50 focus:border-retro-amber'}`}
        />
        {errorMessage && (
          <span className="text-[10px] text-retro-red mt-1 block uppercase tracking-wider animate-pulse">[!] {errorMessage}</span>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen font-mono text-retro-amber selection:bg-retro-amber selection:text-black relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] animate-scan opacity-20"></div>
      <div className="fixed inset-0 pointer-events-none z-0 bg-retro-bg bg-[linear-gradient(rgba(255,176,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,176,0,0.05)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

      <Toast message={toast.msg} show={toast.show} />

      <div className="relative z-10 max-w-7xl mx-auto my-0 md:my-10 border-0 md:border-2 border-retro-amber bg-retro-screen shadow-[0_0_50px_rgba(255,176,0,0.1)] min-h-[90vh] flex flex-col md:flex-row">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} lang={lang} />

        <main className="flex-grow p-6 md:p-10 overflow-y-auto h-[90vh] md:h-auto custom-scrollbar relative">
          <header className="mb-8 border-b-4 border-retro-amber pb-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl uppercase tracking-[0.2em] font-bold drop-shadow-[0_0_8px_rgba(255,176,0,0.6)]">M.I.N.E.C.R.A.F.T.</h1>
              <span className="text-base tracking-normal opacity-80">{t.headers.subtitle}</span>
            </div>
            <button onClick={toggleLang} className="border border-retro-amber px-3 py-1 hover:bg-retro-amber hover:text-black transition-colors text-sm uppercase">
              [{lang === 'en' ? 'SWITCH_TO_中文' : 'SWITCH_TO_EN'}]
            </button>
          </header>

          {activePreset && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setActivePreset(null)}>
              <div className="bg-retro-screen border-2 border-retro-amber p-6 max-w-2xl w-full mx-4 shadow-[0_0_50px_rgba(255,176,0,0.2)] relative" onClick={e => e.stopPropagation()}>
                  <div className="flex justify-between items-start mb-4 border-b border-retro-amber/30 pb-2">
                    <h2 className="text-2xl font-bold uppercase">{activePreset.name[lang]}</h2>
                    <button onClick={() => setActivePreset(null)} className="text-retro-red hover:text-white uppercase font-bold text-sm">{t.buttons.close}</button>
                  </div>
                  <div className="mb-4">
                    {(() => {
                      const parsed = parseCommandToState(activePreset.command);
                      return parsed ? <ParticlePreview cmdState={parsed} /> : <div className="text-retro-red">ERROR PARSING COMMAND</div>;
                    })()}
                  </div>
                  <p className="text-sm text-retro-amber-dim mb-4">{activePreset.description[lang]}</p>
                  <code className="block bg-black border border-retro-amber/30 p-3 mb-6 font-mono text-xs break-all text-retro-amber">{activePreset.command}</code>
                  <div className="flex justify-end gap-4">
                    <button onClick={() => copyToClipboard(activePreset.command, true)} className="bg-retro-amber text-black font-bold uppercase py-2 px-6 hover:bg-white transition-colors">{t.buttons.copy}</button>
                  </div>
              </div>
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="space-y-6 animate-pulse-fast-once">
              <p className="text-lg leading-relaxed text-justify max-w-3xl">{t.overview.init}<br/>{t.overview.loading} <span className="text-green-500">{t.overview.complete}</span></p>
              <div className="border border-retro-red bg-retro-red/5 p-4 text-retro-red shadow-[0_0_10px_rgba(255,51,51,0.2)]"><strong className="block text-xl mb-2">{t.overview.alert_title}</strong>{t.overview.alert_desc}</div>
              <h2 className="text-2xl mt-12 mb-4 text-black bg-retro-amber inline-block px-2 py-1 font-bold">{t.overview.def_title}</h2>
              <p className="max-w-3xl opacity-90">{t.overview.def_desc}</p>
            </div>
          )}

          {activeTab === 'syntax' && (
            <div className="space-y-8">
               <h2 className="text-2xl text-black bg-retro-amber inline-block px-2 py-1 font-bold">{t.headers.syntax}</h2>
               <TerminalBlock label="SYNTAX_REF" command="/particle <name> <pos> <delta> <speed> <count> [force|normal] [viewers]" />
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {[t.syntax.arg_name_title, t.syntax.arg_pos_title, t.syntax.arg_delta_title, t.syntax.arg_speed_title].map((title, i) => (
                   <div key={i} className="border border-retro-amber/50 p-4">
                     <h3 className="text-lg font-bold border-b border-retro-amber/30 pb-2 mb-2 text-white">{title}</h3>
                     <p className="text-sm opacity-80">{[t.syntax.arg_name_desc, t.syntax.arg_pos_desc, t.syntax.arg_delta_desc, t.syntax.arg_speed_desc][i]}</p>
                   </div>
                 ))}
               </div>
            </div>
          )}

          {activeTab === 'database' && (
            <div className="space-y-6">
              <h2 className="text-2xl text-black bg-retro-amber inline-block px-2 py-1 font-bold">{t.headers.database}</h2>
              <div className="mb-6">
                <input type="text" placeholder={t.database.search_placeholder} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-black border border-retro-amber p-3 text-retro-amber focus:outline-none focus:shadow-[0_0_10px_rgba(255,176,0,0.3)] font-mono placeholder-retro-amber-dim/50 uppercase"/>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                {PARTICLES.filter(p => p.id.toLowerCase().includes(searchQuery.toLowerCase()) || p.name[lang].toLowerCase().includes(searchQuery.toLowerCase())).map((p) => {
                  const pColor = particleColors[p.id] || '#ff0000';
                  return (
                    <div key={p.id} className="border border-retro-amber bg-black/50 p-4 hover:bg-retro-amber/10 transition-colors group relative flex flex-col">
                      <div className="absolute top-0 right-0 p-1 text-[10px] border-b border-l border-retro-amber/50 text-retro-amber-dim uppercase">{p.category}</div>
                      <h3 className="text-xl font-bold text-white mb-2">{p.name[lang]}</h3>
                      <code className="text-xs bg-retro-amber/10 px-1 py-0.5 text-retro-amber-dim block mb-3 w-fit">minecraft:{p.id}</code>
                      <p className="text-sm opacity-80 mb-4 min-h-[3rem]">{p.description[lang]}</p>
                      {p.note && <div className="bg-retro-amber/5 border-l-2 border-retro-amber p-2 mb-4 text-[10px] text-retro-amber-dim font-mono leading-tight"><span className="font-bold opacity-75">NOTE:</span> {p.note[lang]}</div>}
                      <div className="mt-auto space-y-3">
                          {p.supportsColor && (
                            <div className="flex items-center gap-2 bg-retro-amber/5 p-2 border border-retro-amber/20">
                              <label className="text-xs text-retro-amber-dim uppercase w-12">Color:</label>
                              <div className="flex-grow flex items-center gap-2">
                                <input type="color" value={pColor} onChange={(e) => setParticleColors(prev => ({...prev, [p.id]: e.target.value}))} className="bg-black border border-retro-amber h-6 w-8 cursor-pointer p-0.5"/>
                                <code className="text-[10px] text-retro-amber/70 font-mono uppercase">{pColor}</code>
                              </div>
                            </div>
                          )}
                          <button onClick={() => {
                              let defaultId = p.id;
                              let overrides: any = {};
                              if (p.supportsColor) {
                                  const hex = particleColors[p.id] || '#ff0000';
                                  const {r, g, b} = hexToRgb(hex);
                                  if (p.id === 'dust') defaultId = `dust ${r} ${g} ${b} 1`;
                                  else if (p.id === 'entity_effect') { overrides.dx = r; overrides.dy = g; overrides.dz = b; overrides.count = '0'; overrides.speed = '1'; }
                                  else if (p.id === 'note') { overrides.dx = hexToHue(hex); overrides.count = '0'; overrides.speed = '0'; }
                              } else if (p.example && p.example.split(' ').length > 1) defaultId = p.example;
                              setCmdState(prev => ({ ...prev, particle: defaultId, x: '~', y: '~1', z: '~', dx: '0', dy: '0', dz: '0', speed: '0.1', count: '10', mode: 'normal', ...overrides }));
                              setErrors({});
                          }} className="text-xs border border-retro-amber text-retro-amber px-2 py-1 uppercase hover:bg-retro-amber hover:text-black transition-colors w-full">{t.buttons.load}</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'generator' && (
            <div className="space-y-6">
              <h2 className="text-2xl text-black bg-retro-amber inline-block px-2 py-1 font-bold">{t.headers.generator}</h2>
              <div className="bg-black border border-retro-amber p-6 shadow-lg">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex flex-col">{renderInput('particle', t.generator.labels.id)}</div>
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
                  <div className="flex flex-col justify-center">
                    <div className="border border-dashed border-retro-amber p-4 relative h-full flex flex-col justify-center items-center bg-retro-amber/5">
                      <ParticlePreview cmdState={cmdState} />
                      <div className="text-xs absolute top-2 left-2 text-retro-amber-dim">{t.generator.preview}</div>
                      <div className="w-full break-all font-mono text-lg mb-6 text-center text-white drop-shadow-md">{generateCommand()}</div>
                      <button onClick={() => copyToClipboard(generateCommand())} className="bg-retro-amber text-black font-bold uppercase py-3 px-8 hover:bg-white transition-colors shadow-[0_0_15px_rgba(255,176,0,0.5)]">{t.generator.copy}</button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="border-t border-retro-amber/30 pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-retro-amber uppercase tracking-wider flex items-center gap-2"><span className="w-2 h-2 bg-retro-amber inline-block"></span>{t.generator.history}</h3>
                  {history.length > 0 && <button onClick={() => setHistory([])} className="text-xs text-retro-red hover:bg-retro-red/10 px-2 py-1 border border-transparent hover:border-retro-red/30 transition-all">{t.generator.clear}</button>}
                </div>
                {history.length === 0 ? <div className="text-retro-amber-dim text-sm italic p-4 border border-dashed border-retro-amber/10 bg-black/30">{t.generator.empty}</div> : (
                    <div className="grid gap-2 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                      {history.map((h, i) => (
                          <div key={i} className="flex justify-between items-center bg-black/40 border border-retro-amber/20 p-3 hover:bg-retro-amber/10 transition-colors group">
                              <code className="text-xs text-retro-amber/80 truncate max-w-[70%] font-mono">{generateCommandStr(h)}</code>
                              <button onClick={() => { setCmdState(h); setErrors({}); }} className="text-[10px] border border-retro-amber/30 px-3 py-1 text-retro-amber uppercase hover:bg-retro-amber hover:text-black hover:border-retro-amber transition-all">{t.buttons.restore}</button>
                          </div>
                      ))}
                    </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'presets' && (
             <div className="space-y-6">
               <h2 className="text-2xl text-black bg-retro-amber inline-block px-2 py-1 font-bold">{t.headers.presets}</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                 {PRESETS.map((preset) => (
                   <div key={preset.id} className="border border-retro-amber bg-black p-5 flex flex-col hover:shadow-[0_0_20px_rgba(255,176,0,0.15)] transition-all">
                     <h3 className="text-xl font-bold text-white mb-2 pb-2 border-b border-retro-amber/30">{preset.name[lang]}</h3>
                     <p className="text-sm text-retro-amber-dim mb-4 h-12 overflow-hidden">{preset.description[lang]}</p>
                     <div className="bg-retro-screen border border-retro-amber/30 p-2 mb-4 font-mono text-xs text-retro-amber break-all h-20 overflow-y-auto custom-scrollbar opacity-80">{preset.command}</div>
                     <div className="mt-auto flex gap-2">
                        <button onClick={() => setActivePreset(preset)} className="flex-1 bg-retro-amber/10 border border-retro-amber text-retro-amber uppercase py-2 hover:bg-retro-amber hover:text-black transition-colors font-bold tracking-wider text-xs">{t.buttons.preview}</button>
                        <button onClick={() => copyToClipboard(preset.command, true)} className="flex-1 bg-retro-amber/10 border border-retro-amber text-retro-amber uppercase py-2 hover:bg-retro-amber hover:text-black transition-colors font-bold tracking-wider text-xs">{t.buttons.copy}</button>
                     </div>
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