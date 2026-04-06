# StudyAI — Project Specifications

## Project Description
An AI-powered academic productivity platform that helps college students 
understand assignments and manage study schedules using Claude AI.

## Functional Requirements
1. Users can paste assignment text and receive an AI-generated breakdown
2. AI generates summary, task list, time estimate, and deadline detection
3. Users can drag tasks onto a study calendar
4. AI chat assistant answers academic questions in real time
5. Dashboard shows assignments, stats, and progress

## Technical Stack
- Frontend: Next.js 14, React, TypeScript, Tailwind CSS
- Animations: Framer Motion
- Drag & Drop: dnd-kit
- AI: Anthropic Claude (claude-sonnet-4-20250514) via REST API
- Deployment: Vercel

## AI Integration Points
1. /api/analyze — Assignment interpretation (structured JSON output)
2. /api/chat — Conversational AI assistant (streaming)

## Sprint Plan
- Sprint 0: Project setup, specs, file structure
- Sprint 1: Landing page
- Sprint 2: Dashboard shell & navigation  
- Sprint 3: AI assignment interpreter
- Sprint 4: Task planner & calendar
- Sprint 5: AI chat assistant
- Sprint 6: Progress tracking & polish