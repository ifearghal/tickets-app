# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [0.2.1] — 2026-04-16

### Fixed

- **Status-move bug**: Ticket editor now auto-moves files between open/ and closed/ directories when status changes (fixes T-0176)
- **TICKET_WRITE_PROXY_URL**: Fixed misconfigured proxy URL in PM2 config

### Changed

- **Storage**: Now uses local filesystem directly (no proxy required)
- **TICKETS_BASE**: Configurable via environment variable (default: ./data/tickets)
- **GitHub sync**: Full feature branch merged — category/priority filters, parent ticket linking, structured edit modal

## [0.2.0] — 2026-04-11

### Added

- **Dashboard filter controls** — clickable category labels at the top of the ticket list for one-click filtering
- **Priority filter** — clickable priority badges (high/medium/low) filter the ticket list in real time
- **Multi-filter stacking** — category and priority filters work together (AND logic)
- **Clear filters button** — reset all active filters with a single click
- **Structured edit modal** — replaced raw markdown editing with clean form fields for title, status, category, priority, type, tags, and description
- **Parent ticket autocomplete** — when linking a child ticket, the parent ID field auto-searches existing tickets as you type and shows matching results with titles
- **Markdown formatting guide** — description field includes a link to markdownguide.org for reference
- **System field removed from edit form** — the system identifier is now computed, not user-editable, preventing accidental data corruption
- **Atomic T-number assignment via POST /api/tickets** — new ticket IDs are now server-assigned; POST /api/tickets scans open/ and closed/ directories, finds the highest T-number in use, and returns the next available ID. Eliminates duplicate ticket numbers and prevents overwriting existing tickets.

### Changed

- **Edit form UX overhaul** — no more editing raw frontmatter; all fields are structured inputs with sensible defaults
- **Status field** — now includes an "in-progress" option alongside open/closed

## [0.1.0] — 2026-04-10

### Added

- Initial release
- Ticket dashboard with category grouping and counts
- Ticket detail modal with rendered markdown
- Create, edit, and close tickets from the UI
- API-driven ticket management (`/api/tickets`, `/api/tickets/[id]`)
- Self-hosted deployment support (standalone Next.js output)
- File-based storage — tickets are Markdown files with YAML frontmatter
