import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Plus } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface SelectableInputProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  inputClassName?: string;
  showSearch?: boolean;
  allowCustom?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const SelectableInput: React.FC<SelectableInputProps> = ({ 
  options, 
  value, 
  onChange, 
  placeholder, 
  label, 
  className = "w-full",
  inputClassName = "",
  showSearch = true,
  allowCustom = true,
  size = 'md'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  const sizeStyles = {
    sm: "px-2 py-1 text-[10px] font-bold",
    md: "px-4 py-2 text-xs font-bold",
    lg: "px-4 py-2.5 text-sm"
  };

  const iconSizes = {
    sm: 10,
    md: 14,
    lg: 16
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => 
    opt.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">{label}</label>}
      <div className="relative h-full">
        <input
          type="text"
          value={value}
          onChange={(e) => allowCustom && onChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          readOnly={!allowCustom}
          placeholder={placeholder}
          className={`w-full h-full outline-none focus:ring-2 focus:ring-blue-500/20 transition-all pr-8 cursor-pointer border border-slate-200 rounded-xl bg-white ${sizeStyles[size]} ${inputClassName}`}
        />
        <button 
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <ChevronDown size={iconSizes[size]} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-50 min-w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {showSearch && (
            <div className="p-2 border-b border-slate-100 bg-slate-50/50">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                  <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('selectableSearchPlaceholder')}
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                />
              </div>
            </div>
          )}
          <div className="max-h-48 overflow-y-auto py-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center justify-between group"
                >
                  {opt}
                  {value === opt && <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-xs text-slate-400 text-center italic">
                {t('selectableNoMatch')}
              </div>
            )}
          </div>
          {allowCustom && search && !options.includes(search) && (
            <button
              onClick={() => {
                onChange(search);
                setIsOpen(false);
                setSearch('');
              }}
              className="w-full text-left px-4 py-2.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors flex items-center gap-2 border-t border-blue-100"
            >
              <Plus size={14} />
              {t('selectableUseValue').replace('{value}', search)}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SelectableInput;
