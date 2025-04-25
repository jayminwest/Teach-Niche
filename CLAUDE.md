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

## Best Practices
- Use path aliases (@/components, @/lib) for imports
- Follow React Server Components patterns where appropriate
- Handle loading and error states consistently
- Use Tailwind for styling with utility classes
- Use Supabase client libraries for database and auth operations
- Use zod for form validation and type safety