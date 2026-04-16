'use client';

import { useEffect, useState } from 'react';
import ParentTicketInput from './ParentTicketInput';

interface TicketDetail {
  id: string;
  status: string;
  category: string;
  title: string;
  tags: string[];
  date_opened: string | null;
  date_closed: string | null;
  last_updated: string | null;
  priority: string | null;
  body: string;
  filename: string;
  rawContent: string;
  type?: string;
}

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketId: string | null;
  ticketTitle?: string;
}

const CATEGORIES = ['Infrastructure', 'Software', 'Hardware', 'Networking', 'Gaming', 'Community', 'Product', 'Project', 'Docs', 'Appliances', 'Personal', 'Other'] as const;
const PRIORITIES = ['high', 'medium', 'low'] as const;
const TYPES = ['bug', 'task', 'epic'] as const;
const STATUSES = ['open', 'in-progress', 'closed'] as const;

const categoryColors: Record<string, string> = {
  Hardware:        'bg-orange-900/50 text-orange-300 border-orange-700/40',
  Infrastructure:  'bg-cyan-900/50 text-cyan-300 border-cyan-700/40',
  Software:        'bg-violet-900/50 text-violet-300 border-violet-700/40',
  Networking:      'bg-blue-900/50 text-blue-300 border-blue-700/40',
  Gaming:          'bg-purple-900/50 text-purple-300 border-purple-700/40',
  Appliances:      'bg-amber-900/50 text-amber-300 border-amber-700/40',
  Product:         'bg-emerald-900/50 text-emerald-300 border-emerald-700/40',
  Community:       'bg-rose-900/50 text-rose-300 border-rose-700/40',
  Personal:        'bg-teal-900/50 text-teal-300 border-teal-700/40',
  FearOS:          'bg-fuchsia-900/50 text-fuchsia-300 border-fuchsia-700/40',
  Project:         'bg-indigo-900/50 text-indigo-300 border-indigo-700/40',
  Other:           'bg-sky-900/50 text-sky-300 border-sky-700/40',
};

const priorityColors: Record<string, string> = {
  high:   'text-red-400',
  medium: 'text-yellow-400',
  low:    'text-slate-400',
};

const priorityIcons: Record<string, string> = {
  high:   '🔴',
  medium: '🟡',
  low:    '⚪',
};

function formatDate(d: string | null) {
  if (!d || d === '~') return null;
  try {
    return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric'
    });
  } catch {
    return d;
  }
}

// Simple markdown → HTML converter
function simpleMarkdownToHtml(markdown: string): string {
  let html = markdown;
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  html = html.replace(/^#### (.*$)/gm, '<h4 class="text-base font-bold text-amber-100 mt-4 mb-2">$1</h4>');
  html = html.replace(/^### (.*$)/gm, '<h3 class="text-lg font-bold text-amber-100 mt-5 mb-2">$1</h3>');
  html = html.replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold text-amber-200 mt-6 mb-3 border-b border-stone-700/50 pb-1">$1</h2>');
  html = html.replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold text-amber-100 mt-6 mb-3">$1</h1>');
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-amber-100">$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em class="italic text-amber-200/80">$1</em>');
  html = html.replace(/```[\w]*\n?([\s\S]*?)```/g, '<pre class="bg-stone-900 border border-stone-700/40 rounded p-3 my-3 overflow-x-auto"><code class="text-sm text-emerald-300 font-mono">$1</code></pre>');
  html = html.replace(/`([^`]+)`/g, '<code class="bg-stone-800 px-1.5 py-0.5 rounded text-sm text-emerald-300 font-mono">$1</code>');
  html = html.replace(/^\s*[-*]\s+(.*)$/gm, '<li class="ml-5 mb-1 list-disc">$1</li>');
  html = html.replace(/(<li class="ml-5 mb-1 list-disc">[\s\S]*?<\/li>\n?)+/g, (m) => `<ul class="text-stone-200 my-3 space-y-0.5">${m}</ul>`);
  html = html.replace(/^\s*\d+\.\s+(.*)$/gm, '<li class="ml-5 mb-1 list-decimal">$1</li>');
  html = html.replace(/^&gt;\s+(.*)$/gm, '<blockquote class="border-l-4 border-amber-600/60 pl-4 my-3 text-amber-300/70 italic">$1</blockquote>');
  html = html.replace(/^---$/gm, '<hr class="border-t border-stone-700/50 my-5" />');
  html = html.replace(/\n\n+/g, '</p><p class="text-stone-200 mb-3 leading-relaxed">');
  html = '<p class="text-stone-200 mb-3 leading-relaxed">' + html + '</p>';
  html = html.replace(/\n/g, '<br />');
  return html;
}

// Parse frontmatter from rawContent
function parseFrontmatter(raw: string): Record<string, string> {
  const fields: Record<string, string> = {};
  const match = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return fields;
  for (const line of match[1].split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    let value = line.slice(colonIdx + 1).trim();
    if (value.startsWith('[') && value.endsWith(']')) {
      // Parse array
      value = value.slice(1, -1);
      fields[key] = value;
    } else {
      fields[key] = value;
    }
  }
  return fields;
}

// Extract body (everything after the second ---)
function extractBody(raw: string): string {
  const idx = raw.indexOf('---', 4);
  return idx !== -1 ? raw.slice(idx + 3).trim() : '';
}

// Build new rawContent from form fields
function buildRawContent(fields: {
  id: string;
  status: string;
  category: string;
  title: string;
  type: string;
  priority: string;
  tags: string;
  date_opened: string;
  date_closed: string;
  closed_reason: string;
  parent: string;
}, body: string): string {
  const lines: string[] = ['---'];
  lines.push(`id: ${fields.id}`);
  lines.push(`status: ${fields.status}`);
  lines.push(`category: ${fields.category}`);
  lines.push(`title: ${fields.title}`);
  if (fields.type) lines.push(`type: ${fields.type}`);
  if (fields.priority) lines.push(`priority: ${fields.priority}`);
  if (fields.tags) {
    const tagList = fields.tags.split(',').map(t => t.trim()).filter(Boolean);
    if (tagList.length) lines.push(`tags: [${tagList.join(', ')}]`);
  }
  if (fields.parent) lines.push(`parent: ${fields.parent}`);  lines.push(`date_opened: ${fields.date_opened}`);
  if (fields.status === 'closed' && fields.date_closed) {
    lines.push(`date_closed: ${fields.date_closed}`);
  }
  if (fields.closed_reason) lines.push(`closed_reason: ${fields.closed_reason}`);
  lines.push('---');
  if (body) lines.push(body);
  return lines.join('\n');
}

type EditFields = {
  status: string;
  category: string;
  title: string;
  type: string;
  priority: string;
  tags: string;
  date_opened: string;
  date_closed: string;
  closed_reason: string;
  parent: string;
};

export default function TicketModal({ isOpen, onClose, ticketId, ticketTitle }: TicketModalProps) {
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editFields, setEditFields] = useState<EditFields>({
    status: 'open', category: 'Other', title: '', type: '', priority: '', tags: '', date_opened: '', date_closed: '', closed_reason: '', parent: ''
  });
  const [editBody, setEditBody] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && ticketId) {
      fetchTicket(ticketId);
      setEditing(false);
      setSaveError(null);
      setSaveSuccess(false);
    } else if (!isOpen) {
      setTicket(null);
      setError(null);
      setEditing(false);
      setSaveError(null);
      setSaveSuccess(false);
    }
  }, [isOpen, ticketId]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (editing) setEditing(false);
        else onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, editing]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const fetchTicket = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/tickets/${encodeURIComponent(id)}`);
      if (!res.ok) {
        setError(res.status === 404 ? 'Ticket not found.' : 'Failed to load ticket.');
        setLoading(false);
        return;
      }
      const data = await res.json();
      setTicket(data);
    } catch {
      setError('Failed to load ticket.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditStart = () => {
    if (!ticket) return;
    const fm = parseFrontmatter(ticket.rawContent);
    const body = extractBody(ticket.rawContent);
    setEditFields({
      status: fm.status || 'open',
      category: fm.category || 'Other',
      title: fm.title || ticket.title || '',
      type: fm.type || '',
      priority: fm.priority || '',
      tags: Array.isArray(ticket.tags) ? ticket.tags.join(', ') : (fm.tags || ''),
      date_opened: fm.date_opened || '',
      date_closed: fm.date_closed || '',
      closed_reason: fm.closed_reason || '',
      parent: fm.parent || '',
      });
    setEditBody(body);
    setEditing(true);
  };

  const handleSave = async () => {
    if (!ticketId || !ticket) return;
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      const fm = parseFrontmatter(ticket.rawContent);
      const newRaw = buildRawContent({ ...editFields, id: fm.id || ticket.id }, editBody);
      const res = await fetch(`/api/tickets/${encodeURIComponent(ticketId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawContent: newRaw }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setSaveError(data.error || 'Failed to save.');
        return;
      }
      await fetchTicket(ticketId);
      setEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Save error:', err);
      setSaveError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setSaveError(null);
  };

  const handleFieldChange = (field: keyof EditFields, value: string) => {
    setEditFields(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  const catColorClass = ticket
    ? (categoryColors[ticket.category] || 'bg-stone-800/50 text-stone-300 border-stone-600/40')
    : '';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      onClick={() => { if (!editing) onClose(); }}
    >
      <div
        className="bg-stone-950 border-2 border-stone-700/50 rounded-lg shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-stone-800/50 gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              {ticket && (
                <>
                  <span className="text-xs font-mono text-stone-500">{ticket.id}</span>
                  <span className={`text-xs px-2 py-0.5 rounded border font-medium ${catColorClass}`}>
                    {editing ? editFields.category : ticket.category}
                  </span>
                  {ticket.priority && (
                    <span className={`text-xs font-medium ${priorityColors[ticket.priority]}`}>
                      {priorityIcons[ticket.priority]} {ticket.priority}
                    </span>
                  )}
                  {ticket.status === 'closed' ? (
                    <span className="text-xs px-2 py-0.5 rounded bg-emerald-900/20 text-emerald-400 border border-emerald-800/30">✓ CLOSED</span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 rounded bg-yellow-900/30 text-yellow-400 border border-yellow-700/30">
                      {ticket.status === 'in-progress' ? 'IN PROGRESS' : 'OPEN'}
                    </span>
                  )}
                </>
              )}
            </div>
            <h2 className="font-shire text-xl font-bold text-amber-100 leading-snug">
              {editing ? editFields.title : (ticket?.title || ticketTitle || 'Loading…')}
            </h2>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {ticket && !editing && (
              <button
                onClick={handleEditStart}
                className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded text-sm font-medium transition-colors border border-stone-700/50"
              >
                ✏️ Edit
              </button>
            )}
            {editing && (
              <>
                <button onClick={handleCancel} disabled={saving} className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded text-sm font-medium transition-colors border border-stone-700/50 disabled:opacity-50">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving} className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-sm font-medium transition-colors disabled:opacity-50">
                  {saving ? 'Saving…' : '💾 Save'}
                </button>
              </>
            )}
            <button onClick={onClose} className="text-stone-500 hover:text-stone-200 transition-colors text-2xl leading-none p-1 ml-1" aria-label="Close modal">×</button>
          </div>
        </div>

        {/* Metadata bar */}
        {ticket && !loading && !editing && (
          <div className="px-5 py-3 border-b border-stone-800/40 flex flex-wrap gap-x-5 gap-y-1 text-xs text-stone-400">
            {ticket.date_opened && <span>📅 Opened: <span className="text-stone-300">{formatDate(ticket.date_opened)}</span></span>}
            {ticket.date_closed && <span>✅ Closed: <span className="text-stone-300">{formatDate(ticket.date_closed)}</span></span>}
            {ticket.last_updated && <span>🔄 Updated: <span className="text-stone-300">{formatDate(ticket.last_updated)}</span></span>}
            {ticket.tags && ticket.tags.length > 0 && (
              <span>🏷️ {ticket.tags.map(t => <span key={t} className="inline-block bg-stone-800/60 text-stone-400 rounded px-1 mr-1">{t}</span>)}</span>
            )}
          </div>
        )}

        {/* Save success/error banner */}
        {saveSuccess && (
          <div className="px-5 py-2 bg-emerald-900/30 border-b border-emerald-700/30 text-emerald-300 text-sm">✅ Ticket saved successfully.</div>
        )}
        {saveError && (
          <div className="px-5 py-2 bg-red-900/20 border-b border-red-700/30 text-red-300 text-sm">⚠️ {saveError}</div>
        )}

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading && (
            <div className="flex items-center justify-center py-16">
              <div className="text-stone-400 animate-pulse text-sm">Loading ticket…</div>
            </div>
          )}
          {error && (
            <div className="bg-red-900/20 border border-red-700/40 rounded-lg p-4 text-red-300">
              <p className="font-semibold mb-1">⚠️ Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {!loading && !error && ticket && (
            editing ? (
              /* Edit mode — structured form */
              <div className="flex flex-col gap-5">
                {/* Top row — status and priority */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-stone-400 mb-1.5 font-medium">Status</label>
                    <select
                      value={editFields.status}
                      onChange={e => handleFieldChange('status', e.target.value)}
                      className="w-full bg-stone-900 border border-stone-700/60 rounded px-3 py-2 text-sm text-stone-100 focus:outline-none focus:border-amber-600/60"
                    >
                      {STATUSES.map(s => <option key={s} value={s}>{s === 'in-progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-stone-400 mb-1.5 font-medium">Priority</label>
                    <select
                      value={editFields.priority}
                      onChange={e => handleFieldChange('priority', e.target.value)}
                      className="w-full bg-stone-900 border border-stone-700/60 rounded px-3 py-2 text-sm text-stone-100 focus:outline-none focus:border-amber-600/60"
                    >
                      <option value="">None</option>
                      {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                    </select>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs text-stone-400 mb-1.5 font-medium">Title</label>
                  <input
                    type="text"
                    value={editFields.title}
                    onChange={e => handleFieldChange('title', e.target.value)}
                    className="w-full bg-stone-900 border border-stone-700/60 rounded px-3 py-2 text-sm text-stone-100 focus:outline-none focus:border-amber-600/60"
                    placeholder="Ticket title"
                  />
                </div>

                {/* Category and Type row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-stone-400 mb-1.5 font-medium">Category</label>
                    <select
                      value={editFields.category}
                      onChange={e => handleFieldChange('category', e.target.value)}
                      className="w-full bg-stone-900 border border-stone-700/60 rounded px-3 py-2 text-sm text-stone-100 focus:outline-none focus:border-amber-600/60"
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-stone-400 mb-1.5 font-medium">Type</label>
                    <select
                      value={editFields.type}
                      onChange={e => handleFieldChange('type', e.target.value)}
                      className="w-full bg-stone-900 border border-stone-700/60 rounded px-3 py-2 text-sm text-stone-100 focus:outline-none focus:border-amber-600/60"
                    >
                      <option value="">None</option>
                      {TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                    </select>
                  </div>
                </div>

                {/* Tags row */}
                <div>
                  <label className="block text-xs text-stone-400 mb-1.5 font-medium">Tags <span className="text-stone-600">(comma-separated)</span></label>
                  <input
                    type="text"
                    value={editFields.tags}
                    onChange={e => handleFieldChange('tags', e.target.value)}
                    className="w-full bg-stone-900 border border-stone-700/60 rounded px-3 py-2 text-sm text-stone-100 focus:outline-none focus:border-amber-600/60"
                    placeholder="bug, networking, urgent"
                  />
                </div>

                {/* Parent ticket */}
                <div>
                  <label className="block text-xs text-stone-400 mb-1.5 font-medium">Parent Ticket ID <span className="text-stone-600">(auto-search)</span></label>
                  <ParentTicketInput
                    value={editFields.parent}
                    onChange={val => handleFieldChange('parent', val)}
                  />
                </div>

                {/* Closed date and reason — only show when closed */}
                {editFields.status === 'closed' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-stone-400 mb-1.5 font-medium">Closed Date</label>
                      <input
                        type="date"
                        value={editFields.date_closed}
                        onChange={e => handleFieldChange('date_closed', e.target.value)}
                        className="w-full bg-stone-900 border border-stone-700/60 rounded px-3 py-2 text-sm text-stone-100 focus:outline-none focus:border-amber-600/60"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-stone-400 mb-1.5 font-medium">Closed Reason</label>
                      <select
                        value={editFields.closed_reason}
                        onChange={e => handleFieldChange('closed_reason', e.target.value)}
                        className="w-full bg-stone-900 border border-stone-700/60 rounded px-3 py-2 text-sm text-stone-100 focus:outline-none focus:border-amber-600/60"
                      >
                        <option value="">Select reason</option>
                        <option value="resolved">Resolved</option>
                        <option value="wont-fix">Won't Fix</option>
                        <option value="duplicate">Duplicate</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Body */}
                <div>
                  <label className="block text-xs text-stone-400 mb-1.5 font-medium">Description</label>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="block text-xs text-stone-400 font-medium">Description <span className="text-stone-600">(Markdown supported)</span></label>
                    <a
                      href="https://www.markdownguide.org/basic-syntax/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-amber-600/70 hover:text-amber-500 underline"
                    >
                      Markdown guide ↗
                    </a>
                  </div>
                  <textarea
                    value={editBody}
                    onChange={e => setEditBody(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-700/60 rounded px-3 py-2 text-sm text-stone-100 font-mono leading-relaxed resize-none focus:outline-none focus:border-amber-600/60"
                    style={{ minHeight: '200px' }}
                    placeholder="Describe the issue in Markdown. You can use **bold**, *italic*, code blocks, lists, and more."
                  />
                </div>
              </div>
            ) : (
              /* View mode — rendered markdown */
              <div
                className="prose prose-invert max-w-none text-sm"
                dangerouslySetInnerHTML={{ __html: simpleMarkdownToHtml(ticket.body) }}
              />
            )
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-stone-800/40">
          <span className="text-xs text-stone-600 font-mono">{ticket?.filename || ''}</span>
          <button onClick={onClose} className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded text-sm transition-colors font-medium border border-stone-700/50">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}