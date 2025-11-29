import React from 'react';
import { TRANSLATIONS } from '../constants';
import { Lang } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  lang: Lang;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, lang }) => {
  const t = TRANSLATIONS[lang];
  
  const menuItems = [
    { id: 'overview', label: t.menu.overview },
    { id: 'syntax', label: t.menu.syntax },
    { id: 'database', label: t.menu.database },
    { id: 'generator', label: t.menu.generator },
    { id: 'presets', label: t.menu.presets },
  ];

  return (
    <aside className="w-full md:w-64 border-b-2 md:border-b-0 md:border-r-2 border-retro-amber flex flex-col bg-black/30 backdrop-blur-sm z-20">
      <div className="p-5 border-b-2 border-retro-amber text-center">
        <h3 className="m-0 text-xl tracking-widest uppercase font-bold text-retro-amber drop-shadow-[0_0_5px_rgba(255,176,0,0.5)]">
          // MAIN_MENU
        </h3>
      </div>
      <nav className="p-5 flex-grow">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full text-left block px-4 py-3 border border-transparent mb-1 uppercase text-lg transition-all duration-200 font-mono whitespace-nowrap
              ${activeTab === item.id 
                ? 'bg-retro-amber text-black shadow-[0_0_10px_rgba(255,176,0,0.5)]' 
                : 'text-retro-amber hover:border-retro-amber hover:bg-retro-amber/10'
              }`}
          >
            {activeTab === item.id ? '[x] ' : '[ ] '} {item.label}
          </button>
        ))}
      </nav>
      <div className="p-5 border-t border-dashed border-retro-amber text-xs leading-relaxed text-retro-amber/80 font-mono">
        <p>{t.sidebar_stats.mem}</p>
        <p>{t.sidebar_stats.disk}</p>
        <p>{t.sidebar_stats.net}</p>
        <p>{t.sidebar_stats.user}</p>
        <p className="mt-2 text-retro-amber-dim animate-pulse">{t.sidebar_stats.awaiting}</p>
      </div>
    </aside>
  );
};