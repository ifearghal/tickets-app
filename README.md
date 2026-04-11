# tickets-ai-assist

A self-hosted ticketing system with AI integration. Describe a ticket in plain language — your AI assistant creates the epic, tickets, and child tickets with proper labels and structure.

Built with Next.js. Tickets are Markdown files with YAML frontmatter, stored on your local or network filesystem.

## Features

- **AI-powered ticket creation** — describe what you need in plain language, your assistant creates properly structured tickets
- **File-based storage** — tickets are `.md` files with YAML frontmatter, easy to edit and version control
- **Inline editing** — edit tickets directly from the dashboard
- **Category and priority filtering** — filter by category, status, tags, priority
- **Self-hosted** — runs on your own infrastructure, no external dependencies

## Prerequisites

You'll need:

- **Node.js 18+** (for running the dev server directly) or **Docker/Podman** (for containerized deployment)
- **npm** (comes with Node.js)
- **A filesystem** with read/write access to a ticket data directory

No database, no Redis, no external services required.

## Quick Start

```bash
# Clone the repo
git clone https://github.com/ifearghal/tickets-ai-assist
cd tickets-ai-assist

# Install dependencies
npm install

# Create ticket data directories
mkdir -p data/tickets/open data/tickets/closed

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Configuration

| Variable | Default | Description |
|---|---|---|
| `TICKETS_BASE` | `./data/tickets` | Path to ticket data directory |
| `TICKET_WRITE_PROXY_URL` | `http://localhost:9187` | Write proxy endpoint |
| `TICKET_WRITE_PROXY_TOKEN` | `change-me-in-production` | Auth token for write operations |
| `PORT` | `3000` | Listen port |
| `HOSTNAME` | `0.0.0.0` | Listen address |

Copy `.env.example` to `.env` and adjust values as needed.

## File Permissions

The app and proxy write to the filesystem. Make sure the user running them has **read and write access** to `TICKETS_BASE` (and its `open/` and `closed/` subdirectories).

```bash
# Example: create directories and set ownership
mkdir -p data/tickets/open data/tickets/closed
chown -R $(id -u):$(id -g) data/
```

The Dockerfile runs as UID 1001. If your data directory is owned by a different UID, either:
- `chown -R 1001:1001 /path/to/data` (adjust the container UID)
- Or run the container with `--user $(id -u):$(id -g)` and remove the `USER nextjs` directive from the Dockerfile

## Write Proxy (Optional)

The inline editor in the web UI uses a write proxy (`proxy.js`) to handle filesystem writes — this avoids permission issues when the Next.js server runs as a different user than the data directory owner.

**To enable inline editing:**

1. Start the proxy: `node proxy.js`
2. Set the same `TOKEN` value in both `proxy.js` and your app's environment
3. The app's `TICKET_WRITE_PROXY_URL` must point to the proxy (e.g. `http://localhost:9187`)

For read-only use (no inline editing from the web UI), you don't need the proxy — the AI agent writes tickets directly to the filesystem.

## Ticket Format

Each ticket is a Markdown file with YAML frontmatter:

```yaml
---
id: T-0001
status: open
category: Infrastructure
title: Something broke
tags: [networking, urgent]
date_opened: 2026-04-10
priority: high
type: bug
---

Describe the issue here...
```

See `AGENTS.md` for the full field reference and AI agent instructions.

## Deploying with Docker

```bash
# Build the image
docker build -t tickets-app .

# Run with your data directory mounted
docker run -d \
  -p 3000:3000 \
  -v /path/to/your/data:/app/data/tickets \
  --name tickets-app \
  tickets-app
```

For inline editing, also mount your `.env` or set the environment variables:

```bash
docker run -d \
  -p 3000:3000 \
  -p 9187:9187 \
  -v /path/to/your/data:/app/data/tickets \
  --env-file .env \
  --name tickets-app \
  tickets-app
```

## Tech Stack

- Next.js 16 (App Router, standalone output)
- TypeScript
- Tailwind CSS v4
- gray-matter (frontmatter parsing)
- Node.js native HTTP write proxy (optional)

## License

MIT
