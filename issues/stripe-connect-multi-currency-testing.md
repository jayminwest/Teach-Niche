# Test Stripe Connect Functionality for Multiple Currencies and Countries

## Description
We need to thoroughly test our Stripe Connect implementation to ensure it works correctly with various currencies and countries. This will help identify any potential issues with international payments, currency conversions, and compliance requirements.

## Tasks
- [ ] Test Stripe Connect onboarding for instructors from at least 5 different countries:
  - [ ] United States (USD)
  - [ ] United Kingdom (GBP)
  - [ ] European Union country (EUR)
  - [ ] Japan (JPY)
  - [ ] Australia (AUD)
- [ ] Verify payment processing works for each currency
- [ ] Test cross-currency transactions (e.g., USD customer paying EUR instructor)
- [ ] Verify correct fee calculations for different currencies
- [ ] Check that payouts work correctly to bank accounts in different countries
- [ ] Ensure tax and compliance documentation is correct for each region
- [ ] Document any region-specific issues or limitations

## References
- Refer to the AI documentation in ai_docs/ for implementation details
- [Stripe Connect Country Specifications](https://stripe.com/docs/connect/country-information)
- [Stripe Connect Currency Support](https://stripe.com/docs/currencies)

## Expected Outcome
A comprehensive report documenting the testing process, any issues encountered, and recommendations for improvements to our international payment handling.

## Assignee
@CharlieHelps
