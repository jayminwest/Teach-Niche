-- Add columns to track payment processing and transfers
ALTER TABLE public.purchases 
ADD COLUMN IF NOT EXISTS platform_fee_amount numeric,
ADD COLUMN IF NOT EXISTS payout_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS stripe_transfer_id text;

-- Add total_earnings to instructor_profiles to track earnings
ALTER TABLE public.instructor_profiles
ADD COLUMN IF NOT EXISTS total_earnings numeric DEFAULT 0;

-- Add comment to explain the payout_status values
COMMENT ON COLUMN public.purchases.payout_status IS 'Status of instructor payout: pending, pending_transfer, transferred, failed';
