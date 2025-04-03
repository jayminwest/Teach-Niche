# Teach Niche - Kendama Tutorial Platform

A platform for kendama instructors to share tutorial videos and for students to learn. Teach Niche enables instructors to monetize their expertise by selling individual videos or bundled lesson packages.

![Teach Niche Platform](https://placeholder.com/your-screenshot-here)

## Features

### For Instructors
- **Content Management**: Upload and manage tutorial videos and lesson packages
- **Monetization**: Set prices for individual videos and lesson packages
- **Stripe Integration**: Receive payments directly to your Stripe account
- **Dashboard**: Track earnings, video views, and student engagement
- **Analytics**: Monitor which content performs best

### For Students
- **Discover Content**: Browse videos and lessons from expert kendama instructors
- **Purchase Content**: Buy individual videos or complete lesson packages
- **Personal Library**: Access purchased content anytime
- **Secure Payments**: Pay securely through Stripe

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **Storage**: Supabase Storage
- **Payments**: Stripe Connect
- **Styling**: shadcn/ui components

## Prerequisites

- Node.js 18+ and npm/pnpm
- Supabase account
- Stripe account (with Connect capability)

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/teach-niche.git
cd teach-niche
```

2. Install dependencies:
```bash
pnpm install
```

3. Run the development server:
```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Supabase Setup

1. Create a new Supabase project
2. Run the migrations in the `supabase/migrations` directory
3. Set up storage buckets for videos and thumbnails
4. Configure RLS policies (see `app/admin/setup/rls-policies.tsx`)

## Stripe Setup

1. Create a Stripe account and enable Connect
2. Set up webhook endpoints for:
   - Payment success
   - Account updates
3. Configure payout settings

## Project Structure

```
teach-niche/
├── app/                  # Next.js app directory
│   ├── api/              # API routes
│   ├── auth/             # Authentication pages
│   ├── checkout/         # Checkout flow
│   ├── dashboard/        # Instructor dashboard
│   ├── lessons/          # Lesson browsing and viewing
│   └── videos/           # Video browsing and viewing
├── components/           # Reusable React components
├── lib/                  # Utility functions and services
│   ├── stripe.ts         # Stripe integration
│   └── supabase/         # Supabase clients
├── public/               # Static assets
├── styles/               # Global styles
├── types/                # TypeScript type definitions
└── middleware.ts         # Next.js middleware for auth
```

## Usage

### For Instructors

1. Sign up for an account
2. Set up your Stripe Connect account
3. Upload videos or create lesson packages
4. Set prices and publish content
5. Monitor sales through the dashboard

### For Students

1. Browse available videos and lessons
2. Purchase content with a credit card
3. Access purchased content in your library

## API Endpoints

- `/api/checkout` - Process video purchases
- `/api/checkout-lesson` - Process lesson package purchases
- `/api/stripe/create-connect-account` - Set up Stripe Connect for instructors
- `/api/verify-purchase` - Verify user access to content
- `/api/webhooks/stripe` - Handle Stripe webhook events

## Deployment

This project can be deployed on Vercel:

```bash
vercel
```

Or any other platform that supports Next.js applications.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a pull request

## License

[MIT](LICENSE)

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.io/)
- [Stripe](https://stripe.com/)
- [shadcn/ui](https://ui.shadcn.com/)
