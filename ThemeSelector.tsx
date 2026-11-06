import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Palette, Check, ChevronDown } from 'lucide-react';

export const ThemeSelector: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { theme, setTheme, themes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeTheme = themes.find((t) => t.id === theme) || themes[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        data-testid="theme-selector"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 rounded-xl transition touch-target ${
          compact
            ? 'p-2 bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs'
            : 'px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-medium shadow-sm'
        }`}
        aria-label="Change Color Theme"
        title={`Theme: ${activeTheme.name}`}
      >
        <span
          className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm transition-colors"
          style={{ backgroundColor: activeTheme.dotColor }}
        />
        <Palette className="w-3.5 h-3.5 text-slate-400" />
        <span className="hidden sm:inline font-mono text-[11px] font-semibold">{activeTheme.name}</span>
        <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          data-testid="theme-dropdown-menu"
          className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#0b0f19]/95 backdrop-blur-xl border border-white/10 shadow-2xl p-2 z-50 animate-fade-in"
        >
          <div className="px-3 py-2 border-b border-white/05 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-semibold block">
              Curated Luxury Themes
            </span>
          </div>

          <div className="space-y-1">
            {themes.map((t) => {
              const isSelected = t.id === theme;
              return (
                <button
                  key={t.id}
                  type="button"
                  data-testid={`theme-option-${t.id}`}
                  onClick={() => {
                    setTheme(t.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition ${
                    isSelected
                      ? 'bg-slate-800/90 border border-white/10 text-white'
                      : 'hover:bg-slate-800/50 text-slate-300 hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: t.dotColor }}
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold font-display tracking-tight text-white">
                        {t.name}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate font-mono">
                        {t.tagline}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
