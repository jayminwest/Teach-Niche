## Summary

<!-- Briefly describe what this PR accomplishes (1-3 bullets) -->

-

## Changes

<!-- Detailed list of changes with teach-niche domain specifics -->

### Domain: [payment|auth|database|video|api|ui|deploy]

-
-

## Testing

<!-- teach-niche deployment checklist -->

### Deployment Checklist

- [ ] **Stripe webhooks tested** (if payment domain)
  - [ ] Tested with Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
  - [ ] Verified webhook signature validation
  - [ ] Tested relevant webhook events (payment_intent.succeeded, etc.)
- [ ] **Supabase RLS policies verified** (if auth/database domain)
  - [ ] Tested RLS policies in Supabase Studio
  - [ ] Verified row-level security enforced
  - [ ] Tested with different user roles
- [ ] **Video upload flow tested** (if video domain)
  - [ ] Tested video upload end-to-end
  - [ ] Verified signed URL generation
  - [ ] Tested video access control
- [ ] **API routes validated** (if api domain)
  - [ ] Tested with Postman/curl
  - [ ] Verified error handling
  - [ ] Checked request validation
- [ ] **Vercel preview deployment works**
  - [ ] Preview URL loads successfully
  - [ ] No build errors
  - [ ] Environment variables configured
- [ ] **TypeScript type checks pass**
  - [ ] `pnpm typecheck` succeeds
- [ ] **ESLint checks pass**
  - [ ] `pnpm lint` succeeds

### Manual Testing

<!-- Describe manual testing performed -->

-

## Related Issues

<!-- Link related issues -->

Closes #

## Breaking Changes

<!-- List any breaking changes or migration steps required -->

- [ ] No breaking changes
- [ ] Breaking changes (describe below):

## Screenshots / Videos

<!-- Add screenshots or videos if applicable -->

---

## Label Guidance

**Domain Labels** (select all that apply):
- `payment` - Stripe, checkout, webhooks, payouts
- `auth` - Authentication, RLS, session management
- `database` - Migrations, schema, data integrity
- `video` - Upload, transcoding, access control
- `api` - API routes, endpoints, validation
- `ui` - Components, pages, UI/UX
- `deploy` - Vercel, environment, infrastructure

**Type Label** (select one):
- `feature` - New feature or functionality
- `enhancement` - Improvement to existing functionality
- `bug` - Bug fix
- `documentation` - Documentation updates

**Priority Label** (select one if urgent):
- `priority:critical` - Urgent, blocking production
- `priority:high` - Important, should merge soon
- `priority:medium` - Normal priority
- `priority:low` - Nice to have

**Effort Label** (optional, for tracking):
- `effort:small` - < 4 hours
- `effort:medium` - 4-16 hours
- `effort:large` - > 16 hours

---

**Co-Authored-By:**

<!-- If applicable, add co-authors -->

Co-Authored-By: Claude <noreply@anthropic.com>
