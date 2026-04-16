import { useState, useEffect, useRef } from 'react';

interface Ticket {
  id: string;
  title: string;
  category: string;
  status: string;
}

interface ParentTicketInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function ParentTicketInput({ value, onChange }: ParentTicketInputProps) {
  const [query, setQuery] = useState(value || '');
  const [results, setResults] = useState<Ticket[]>([]);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const debounce = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setShow(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const search = async (q: string) => {
    if (q.length < 1) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/tickets');
      const data = await res.json();
      const all = [...(data.open || []), ...(data.recentClosed || [])];
      const filtered = all
        .filter(t => t.id.toLowerCase().includes(q.toLowerCase()) || t.title.toLowerCase().includes(q.toLowerCase()))
        .slice(0, 6);
      setResults(filtered);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (q: string) => {
    setQuery(q);
    onChange(q);
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => search(q), 250);
  };

  return (
    <div ref={ref} className="relative">
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={e => handleChange(e.target.value)}
          onFocus={() => query.length >= 1 && search(query)}
          className="flex-1 bg-stone-900 border border-stone-700/60 rounded px-3 py-2 text-sm text-stone-100 focus:outline-none focus:border-amber-600/60"
          placeholder="EPIC-tickets-app-split"
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(''); onChange(''); setResults([]); }}
            className="px-2 text-stone-400 hover:text-stone-200 text-sm"
            title="Clear"
          >
            ✕
          </button>
        )}
      </div>

      {show && (
        <div className="absolute z-50 mt-1 w-full bg-stone-900 border border-stone-700/60 rounded shadow-xl max-h-52 overflow-y-auto">
          {loading && <div className="px-3 py-2 text-xs text-stone-500">Searching...</div>}
          {!loading && results.length === 0 && query.length >= 1 && (
            <div className="px-3 py-2 text-xs text-stone-500">No tickets found for &quot;{query}&quot;</div>
          )}
          {!loading && results.length > 0 && results.map(t => (
            <button
              key={t.id}
              type="button"
              className="w-full text-left px-3 py-2 hover:bg-stone-800 border-b border-stone-800/30 last:border-0"
              onClick={() => {
                setQuery(t.id);
                onChange(t.id);
                setShow(false);
                setResults([]);
              }}
            >
              <span className="text-xs font-mono text-amber-400">{t.id}</span>
              <span className="text-xs text-stone-400 ml-2 truncate">{t.title}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
