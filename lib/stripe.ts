import Stripe from "stripe"

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is missing. Please set it in your environment variables.")
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16", // Use the latest API version
  appInfo: {
    name: "Teach Niche",
    version: "0.1.0",
  },
})

// Constants for the platform fee percentage
export const PLATFORM_FEE_PERCENTAGE = 15
export const INSTRUCTOR_PERCENTAGE = 100 - PLATFORM_FEE_PERCENTAGE

// Helper function to calculate fee amounts
export function calculateFees(amount: number) {
  const platformFee = Math.round((amount * PLATFORM_FEE_PERCENTAGE) / 100)
  const instructorAmount = amount - platformFee

  return {
    platformFee,
    instructorAmount,
  }
}

