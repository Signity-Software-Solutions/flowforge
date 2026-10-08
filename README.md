# FlowForge Live

**The AI automation platform that builds itself.**

FlowForge Live is a production workflow automation platform with n8n as the embedded execution engine and a custom Next.js frontend with AI capabilities.

## Tech Stack

- **Frontend:** Next.js 14 + React Flow + Tailwind CSS + shadcn/ui
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL (via Prisma)
- **Queue:** Redis + BullMQ (async execution)
- **AI:** Claude API (Anthropic) for workflow generation
- **Auth:** NextAuth.js (credentials provider)
- **Execution Engine:** n8n (self-hosted Docker, API-only mode)

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database
- Redis (optional, for queue)
- n8n instance (optional, mock mode available)

### Installation

```bash
# Clone the repository
git clone https://github.com/risingstar24/flowforge-live.git
cd flowforge-live/app

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL, secrets, and API keys

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# Seed the database
curl http://localhost:3000/api/seed

# Start the development server
npm run dev
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NEXTAUTH_SECRET` | NextAuth encryption secret | Yes |
| `NEXTAUTH_URL` | App URL (http://localhost:3000) | Yes |
| `N8N_BASE_URL` | n8n instance URL | No (mock mode) |
| `N8N_API_KEY` | n8n REST API key | No (mock mode) |
| `N8N_MOCK` | Enable mock mode ("true"/"false") | No (default: true) |
| `ANTHROPIC_API_KEY` | Claude API key for AI features | No (mock fallback) |
| `REDIS_URL` | Redis connection string | No |

### Default Login

- **Email:** admin@flowforge.io
- **Password:** LetsBuildGreatThings@123

## Features

### Visual Workflow Builder
Drag-and-drop canvas built with React Flow. Create workflows by connecting triggers, actions, conditions, and utilities.

### AI Workflow Generation
Describe your workflow in plain English and Claude AI generates it. Preview on the canvas, edit, and activate.

### Dashboard
Real-time stats: active workflows, execution counts, success rates, and time saved. Charts showing execution trends.

### Execution Monitor
Real-time execution logs with per-node status tracking. Error details, retry capabilities, and execution history.

### Integration Hub
30+ integrations across 8 categories (CRM, Email, Communication, E-commerce, Payment, AI/ML, Database, Storage).

### Settings
Workspace configuration, team management, API keys, n8n connection settings, and AI model selection.

## Deployment (Railway)

```bash
# The app includes a Dockerfile and railway.json for Railway deployment
# Set environment variables in Railway dashboard
# Connect a PostgreSQL database
# Deploy via GitHub integration or Railway CLI
```

## Project Structure

```
app/
├── prisma/              # Database schema
├── src/
│   ├── app/
│   │   ├── (auth)/      # Login page
│   │   ├── (dashboard)/ # Main app pages
│   │   └── api/         # API routes
│   ├── components/
│   │   ├── ui/          # Reusable UI components
│   │   ├── builder/     # Workflow builder components
│   │   ├── shared/      # Shared layout components
│   │   └── ai/          # AI chat components
│   ├── lib/             # Utilities, API clients
│   └── stores/          # Zustand state management
├── Dockerfile
├── railway.json
└── README.md
```

## License

Proprietary - Signity Solutions
