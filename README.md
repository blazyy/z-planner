# z-planner

A hand-built Kanban planner. Boards contain columns, columns contain drag-and-drop cards, and cards support subtasks, categories, and archiving.

Built with Next.js 14 (App Router), TypeScript, Clerk for authentication, MongoDB with Mongoose, shadcn/ui components, and @hello-pangea/dnd for drag-and-drop.

## Prerequisites

- Node.js 18.17 or later
- npm
- A MongoDB instance (local or hosted, e.g. MongoDB Atlas)
- A Clerk application (for the publishable and secret keys)

## Setup

Install dependencies:

```bash
npm ci
```

Create a `.env.local` file in the project root (see `.env.example`) with the following variables:

| Variable | Description |
| --- | --- |
| `MONGO_URI` | MongoDB connection string |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |

## Commands

```bash
npm run dev    # start the development server
npm run build  # create a production build
npm run start  # serve the production build
```

The dev server runs at http://localhost:3000 by default.
