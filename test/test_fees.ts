import { 
  calculateFees, 
  PLATFORM_FEE_PERCENTAGE, 
  INSTRUCTOR_PERCENTAGE,
  STRIPE_PERCENTAGE_FEE,
  STRIPE_FIXED_FEE_CENTS,
  calculatePriceWithStripeFees
} from "../lib/stripe";

// Test with common price points
const testPrices = [
  500, // $5
  1000, // $10
  1500, // $15
  2000, // $20
  2500, // $25
  5000, // $50
  10000, // $100
];

console.log("===== FEE CALCULATION TEST =====");
console.log(`Platform Fee: ${PLATFORM_FEE_PERCENTAGE}%`);
console.log(`Instructor Percentage: ${INSTRUCTOR_PERCENTAGE}%`);
console.log(`Stripe Percentage Fee: ${STRIPE_PERCENTAGE_FEE}%`);
console.log(`Stripe Fixed Fee: ${STRIPE_FIXED_FEE_CENTS} cents`);
console.log("================================");

for (const basePrice of testPrices) {
  // Calculate the price with Stripe fees included
  const priceWithFees = calculatePriceWithStripeFees(basePrice);
  
  // Calculate the fee split
  const { platformFee, instructorAmount } = calculateFees(priceWithFees);
  
  // Calculate different parts for verification
  const stripeFee = Math.round(priceWithFees * STRIPE_PERCENTAGE_FEE / 100) + STRIPE_FIXED_FEE_CENTS;
  const remaining = priceWithFees - stripeFee;
  const expectedPlatformFeeBeforeStripeFees = Math.round(basePrice * PLATFORM_FEE_PERCENTAGE / 100);
  
  console.log(`\nBase Price: $${(basePrice / 100).toFixed(2)}`);
  console.log(`Price with Fees: $${(priceWithFees / 100).toFixed(2)}`);
  console.log(`Total Stripe Fee: $${(stripeFee / 100).toFixed(2)}`);
  console.log(`Platform Fee (including Stripe cost): $${(platformFee / 100).toFixed(2)}`);
  console.log(`Instructor Amount: $${(instructorAmount / 100).toFixed(2)}`);
  
  // Verify the total adds up
  console.log(`Total Distribution: $${((platformFee + instructorAmount) / 100).toFixed(2)}`);
  
  // Verify platform is only paying for its share of Stripe fees
  const platformFeeBeforeStripeCosts = expectedPlatformFeeBeforeStripeFees;
  const platformProportion = platformFeeBeforeStripeCosts / priceWithFees;
  const platformShareOfStripeFee = Math.round(stripeFee * platformProportion);
  const platformFeeWithStripeCosts = platformFeeBeforeStripeCosts + platformShareOfStripeFee;
  
  console.log(`\nVerification:`);
  console.log(`Platform Base Fee (15%): $${(platformFeeBeforeStripeCosts / 100).toFixed(2)}`);
  console.log(`Platform's Proportion of Revenue: ${(platformProportion * 100).toFixed(2)}%`);
  console.log(`Platform's Share of Stripe Fee: $${(platformShareOfStripeFee / 100).toFixed(2)}`);
  console.log(`Expected Platform Fee With Stripe Costs: $${(platformFeeWithStripeCosts / 100).toFixed(2)}`);
  console.log(`Actual Platform Fee Calculated: $${(platformFee / 100).toFixed(2)}`);
  
  // Check that the platform is paying precisely its proportional share of Stripe fees
  const difference = Math.abs(platformFeeWithStripeCosts - platformFee);
  console.log(difference <= 1 ? `✓ Platform fee calculation is correct (±1¢ rounding error)` : 
                               `❌ Platform fee calculation is off by ${(difference/100).toFixed(2)}`);
  
  // Check instructor's amount
  const expectedInstructorAmount = priceWithFees - platformFee;
  console.log(`Expected Instructor Amount: $${(expectedInstructorAmount / 100).toFixed(2)}`);
  console.log(`Actual Instructor Amount: $${(instructorAmount / 100).toFixed(2)}`);
  console.log(`Instructor's Effective Percentage: ${(instructorAmount / priceWithFees * 100).toFixed(2)}%`);
  console.log(`Platform's Effective Percentage: ${(platformFee / priceWithFees * 100).toFixed(2)}%`);
}
