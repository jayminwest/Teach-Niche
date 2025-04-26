"use client";

import { calculatePriceWithStripeFees, STRIPE_PERCENTAGE_FEE, STRIPE_FIXED_FEE_CENTS } from "@/lib/stripe";
import { formatPrice } from "@/lib/utils";

interface PriceBreakdownProps {
  basePrice: number; // Price in dollars (e.g., 19.99)
  showDetails?: boolean; // Whether to show the detailed breakdown
}

export function PriceBreakdown({ basePrice, showDetails = true }: PriceBreakdownProps) {
  // Convert to cents for calculation
  const basePriceInCents = Math.round(basePrice * 100);
  const stripeFeePercentage = STRIPE_PERCENTAGE_FEE;
  const stripeFixedFeeCents = STRIPE_FIXED_FEE_CENTS;
  
  // Calculate fees
  const stripePercentageFeeAmount = Math.round((basePriceInCents * stripeFeePercentage) / 100);
  const totalProcessingFee = stripePercentageFeeAmount + stripeFixedFeeCents;
  const totalPrice = calculatePriceWithStripeFees(basePriceInCents);
  
  // Convert back to dollars for display
  const processingFee = totalProcessingFee / 100;
  const total = totalPrice / 100;

  if (!showDetails) {
    return (
      <div className="flex justify-between items-center py-2">
        <span>Total</span>
        <span className="font-medium">{formatPrice(total)}</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span>Base price</span>
        <span>{formatPrice(basePrice)}</span>
      </div>
      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <span>Processing fee</span>
        <span>{formatPrice(processingFee)}</span>
      </div>
      <div className="flex justify-between items-center pt-2 border-t font-medium">
        <span>Total</span>
        <span>{formatPrice(total)}</span>
      </div>
    </div>
  );
}