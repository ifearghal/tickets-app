# tickets-ai-assist

A self-hosted ticketing system with AI integration. Describe a ticket in plain language — your AI assistant creates the epic, tickets, and child tickets with proper labels and structure.

Built with Next.js. Tickets are Markdown files with YAML frontmatter, stored on your local or network filesystem.

## Features

- **AI-powered ticket creation** — describe what you need in plain language, your assistant creates properly structured tickets
- **File-based storage** — tickets are `.md` files with YAML frontmatter, easy to edit and version control
- **Inline editing** — edit tickets directly from the dashboard
- **Category and priority filtering** — filter by category, status, tags, priority
- **Self-hosted** — runs on your own infrastructure, no external dependencies

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
| `TICKET_WRITE_PROXY_TOKEN` | — | Auth token for write operations |
| `PORT` | `3000` | Listen port |
| `HOSTNAME` | `0.0.0.0` | Listen address |

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

## Deploying

```bash
# Build the Docker image
npm run build

# Or with Podman
podman build -t tickets-app .

# Run the container
podman run -d \
  -p 3000:3000 \
  -v $(pwd)/data:/app/data/tickets \
  --name tickets-app \
  tickets-app
```

## Tech Stack

- Next.js 16 (App Router, standalone output)
- TypeScript
- Tailwind CSS v4
- gray-matter (frontmatter parsing)
- Podman (container runtime)

## License

MIT
