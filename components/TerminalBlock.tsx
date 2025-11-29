import React from 'react';

interface TerminalBlockProps {
  command: string;
  output?: string;
  label?: string;
}

export const TerminalBlock: React.FC<TerminalBlockProps> = ({ command, output, label }) => {
  return (
    <div className="bg-black border border-retro-amber p-4 font-mono my-4 relative group">
      {label && (
        <div className="absolute -top-3 left-2 bg-black px-2 text-xs text-retro-amber-dim uppercase tracking-widest border border-retro-amber-dim/30">
          {label}
        </div>
      )}
      <div className="mb-2 text-retro-amber">
        <span className="text-retro-amber-dim select-none">root@mc-server:~$ </span>
        {command}
      </div>
      {output && (
        <div className="text-retro-amber-dim text-sm pl-4 border-l-2 border-retro-amber-dim/30">
          # {output}
        </div>
      )}
      <div className="inline-block w-2.5 h-4 bg-retro-amber animate-pulse mt-1 align-middle ml-1"></div>
    </div>
  );
};