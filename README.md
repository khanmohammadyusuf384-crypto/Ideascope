# IdeaScope

A local-first app that reviews business or product ideas and scores them across originality, feasibility, market value, and implementation complexity.

## Stack

- Frontend: React 19 + Parcel + plain CSS
- Backend: Node.js + Express
- AI: Optional local Ollama integration

## Features

- Submit an idea with goals, constraints, and target audience
- Get category scores and a weighted overall score
- See strengths, risks, MVP scope, stretch goals, and positioning guidance
- Use Ollama when available, or a local heuristic fallback when it is not

## Project Structure

```text
ideascope/
  backend/
  frontend/
```

## Backend Setup

```bash
cd backend
npm install
npm run dev
```

Optional `.env` values:

```text
PORT=4000
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:3b
```

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Parcel serves the app at:

```text
http://localhost:1234
```

The frontend talks to the backend at:

```text
http://localhost:4000
```

## Suggested Ollama Model

```bash
ollama pull llama3.2:3b
```

## Future Improvements

- User authentication for saved personal workspaces
- Database-backed evaluation history and comparison tracking
- Automated tests for frontend interactions and backend API behavior
- Deployment for a live demo version
- Smarter scoring and richer AI-assisted evaluation flows
- Support for more idea domains, deeper market analysis, and export options

## Product Positioning

Built a local-first idea evaluation assistant with React and Express that analyzes product concepts for originality, feasibility, MVP scope, and market value, with optional Ollama-based reasoning and a structured scoring workflow.
This project is actively maintained.
