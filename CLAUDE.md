# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands
- `pnpm dev`: Run development server
- `pnpm build`: Build production version
- `pnpm start`: Start production server
- `pnpm lint`: Run ESLint
- `pnpm typecheck`: Run TypeScript type checker

## Code Style Guidelines
- **Imports**: Order as: Next.js imports → External libraries → UI components → Utilities
- **Components**: Use PascalCase for components, kebab-case for filenames
- **Naming**: Next.js App Router conventions (page.tsx, loading.tsx, route.ts)
- **Types**: Explicit typing for props, functions, and variables; central types in /types
- **Error Handling**: Use try/catch with typed errors and appropriate HTTP status codes
- **Organization**: Follow App Router structure; components in /components, utilities in /lib
- **Formatting**: Use TypeScript strict mode; follow ESLint rules (next/core-web-vitals, next/typescript)

## Next.js 15 Specific Guidelines
- **Route Handler Parameters**: In Next.js 15, `params` and `searchParams` in page components are Promises that must be awaited before use.
- **Page Component Props**: Use the following pattern for page components with dynamic routes:
  ```typescript
  interface PageProps {
    params: Promise<{ [key: string]: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  }
  
  export default async function Page(props: PageProps) {
    // Await the params to get their values
    const resolvedParams = await props.params;
    const id = resolvedParams.id;
    
    // Now use the resolved values
    // ...
  }
  ```
- **Metadata Generation**: When using `generateMetadata`, also await the params:
  ```typescript
  export async function generateMetadata({ params }: PageProps) {
    const resolvedParams = await params;
    // Use resolvedParams.id or other properties
  }
  ```

## Best Practices
- Use path aliases (@/components, @/lib) for imports
- Follow React Server Components patterns where appropriate
- Handle loading and error states consistently
- Use Tailwind for styling with utility classes
- Use Supabase client libraries for database and auth operations
- Use zod for form validation and type safety

## Agentic Engineering Infrastructure

This project uses Claude Code's expert agent system for workflow automation.

### Primary Interface

- `/do <requirement>` - Universal entry point (orchestrates expert agents directly)

### Expert Domains

Located in `.claude/agents/experts/<domain>/`. Each has `expertise.yaml` + 4 agents (plan, build, improve, question).

**Phase 1 - Foundation (Active):**

| Domain | Agents | Purpose |
|--------|--------|---------|
| `do-management` | plan, build, improve, question | /do routing and classification for teach-niche |
| `agent-authoring` | plan, build, improve, question | Create new expert domains adapted to Next.js + Supabase |

**Phase 2 - Specialists (Active):**

| Domain | Agents | Purpose |
|--------|--------|---------|
| `payment` | plan, build, improve, question | Stripe Connect payment flows, webhooks, fees |
| `video-security` | plan, build, improve, question | Video access control, signed URLs, RLS |
| `auth` | plan, build, improve, question | Role guards, middleware, session sync, RLS |
| `database` | plan, build, improve, question | Migrations, type generation, schema versioning |

### Expert Access (via /do)

`/do` directly orchestrates expert agents (no coordinator layer):
- Questions: `/do "How do I...?"` → spawns `<domain>-question-agent`
- Implementation: `/do "Add new domain"` → spawns plan→[approval]→build→improve

**Available domains:** do-management, agent-authoring, payment, video-security, auth, database

### Using Phase 2 Specialists

Phase 2 specialist domains are now active. Examples:

```bash
# Payment flows
/do "Fix fee calculation duplication across routes"
/do "Add charge.refunded webhook handler"

# Video security
/do "Reduce signed URL expiry to prevent sharing"
/do "How do I detect video access abuse?"

# Auth patterns
/do "Create middleware guards for /admin routes"
/do "How do I protect instructor-only endpoints?"

# Database schema
/do "Automate TypeScript type generation from schema"
/do "Consolidate migrations into baseline schema"
```

See `.claude/commands/do.md` for routing indicators and full examples.