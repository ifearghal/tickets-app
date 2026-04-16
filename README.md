# tickets-ai-assist

A self-hosted ticketing system with AI integration. Describe a ticket in plain language — your AI assistant creates the epic, tickets, and child tickets with proper labels and structure.

## Features

- **File-based storage** — tickets are Markdown files with YAML frontmatter, no database required
- **AI-first workflow** — describe a ticket in plain language and the AI handles structure
- **Real-time dashboard** — filter by category, priority, and status
- **REST API** — full CRUD operations at `/api/tickets`
- **Self-hosted** — runs anywhere, no external dependencies

## Quick Start

### Prerequisites

- Node.js 18+
- npm or pnpm
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/ifeArggal/tickets-app.git
cd tickets-app

# Install dependencies
npm install

# Configure environment (optional)
cp .env.example .env.local
# Edit .env.local with your settings

# Start the development server
npm run dev
```

The app will be available at `http://localhost:3000`.

### Production Build

```bash
npm run build
npm start
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `TICKETS_BASE` | `./data/tickets` | Base directory for ticket files |
| `TICKET_WRITE_PROXY_URL` | `http://localhost:3000` | Proxy URL for ticket writes |
| `PORT` | `3000` | Server port |

### Data Directory Structure

```
data/
└── tickets/
    ├── open/          # Open tickets
    │   └── T-0001-my-ticket.md
    └── closed/         # Closed tickets
        └── T-0002-closed-ticket.md
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/tickets` | List all tickets |
| `GET` | `/api/tickets/[id]` | Get single ticket |
| `POST` | `/api/tickets` | Create new ticket |
| `PUT` | `/api/tickets/[id]` | Update ticket |
| `DELETE` | `/api/tickets/[id]` | Delete ticket |

## Development

```bash
# Run linter
npm run lint

# Type check
npm run typecheck
```

## Tech Stack

- **Next.js 16** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **File-based storage** via filesystem

## License

MIT
