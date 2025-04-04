# Stripe Connect Multi-Currency Test Results

## Test Environment
- Test Date: 2025-04-04
- Stripe API Version: 2025-03-31.basil
- Application Version: v0.1.0

## Connect Account Creation Tests
- [ ] US (USD) Account Created Successfully
- [ ] EU (EUR) Account Created Successfully
- [ ] UK (GBP) Account Created Successfully
- [ ] AU (AUD) Account Created Successfully
- [ ] JP (JPY) Account Created Successfully

## Onboarding Process Tests
- [ ] US Account Onboarding Completed
- [ ] EU Account Onboarding Completed
- [ ] UK Account Onboarding Completed
- [ ] AU Account Onboarding Completed
- [ ] JP Account Onboarding Completed

## Payment Processing Tests

## Payout Tests
- [ ] US Account Payout Successful
- [ ] EU Account Payout Successful
- [ ] UK Account Payout Successful
- [ ] AU Account Payout Successful
- [ ] JP Account Payout Successful

## Issues and Observations

## Recommendations

Initialized test results file: stripe_multicurrency_test_results_2025-04-04.md
Creating test Connect account for US (usd)
ERROR: Failed to create account for US. Error: {
  "id": "acct_1RAF0mGda3Zwwyjw",
  "object": "account",
  "business_profile": {
    "annual_revenue": null,
    "estimated_worker_count": null,
    "mcc": null,
    "name": null,
    "product_description": null,
    "support_address": null,
    "support_email": null,
    "support_phone": null,
    "support_url": null,
    "url": null
  },
  "business_type": null,
  "capabilities": {
    "card_payments": "inactive",
    "transfers": "inactive"
  },
  "charges_enabled": false,
  "controller": {
    "fees": {
      "payer": "application_express"
    },
    "is_controller": true,
    "losses": {
      "payments": "application"
    },
    "requirement_collection": "stripe",
    "stripe_dashboard": {
      "type": "express"
    },
    "type": "application"
  },
  "country": "US",
  "created": 1743791441,
  "default_currency": "usd",
  "details_submitted": false,
  "email": "instructor-us@example.com",
  "external_accounts": {
    "object": "list",
    "data": [],
    "has_more": false,
    "total_count": 0,
    "url": "/v1/accounts/acct_1RAF0mGda3Zwwyjw/external_accounts"
  },
  "future_requirements": {
    "alternatives": [],
    "current_deadline": null,
    "currently_due": [],
    "disabled_reason": null,
    "errors": [],
    "eventually_due": [],
    "past_due": [],
    "pending_verification": []
  },
  "login_links": {
    "object": "list",
    "data": [],
    "has_more": false,
    "total_count": 0,
    "url": "/v1/accounts/acct_1RAF0mGda3Zwwyjw/login_links"
  },
  "metadata": {},
  "payouts_enabled": false,
  "requirements": {
    "alternatives": [
      {
        "alternative_fields_due": [
          "business_profile.product_description"
        ],
        "original_fields_due": [
          "business_profile.url"
        ]
      }
    ],
    "current_deadline": null,
    "currently_due": [
      "business_profile.mcc",
      "business_profile.url",
      "business_type",
      "external_account",
      "representative.dob.day",
      "representative.dob.month",
      "representative.dob.year",
      "representative.email",
      "representative.first_name",
      "representative.last_name",
      "settings.payments.statement_descriptor",
      "tos_acceptance.date",
      "tos_acceptance.ip"
    ],
    "disabled_reason": "requirements.past_due",
    "errors": [],
    "eventually_due": [
      "business_profile.mcc",
      "business_profile.url",
      "business_type",
      "external_account",
      "representative.dob.day",
      "representative.dob.month",
      "representative.dob.year",
      "representative.email",
      "representative.first_name",
      "representative.last_name",
      "settings.payments.statement_descriptor",
      "tos_acceptance.date",
      "tos_acceptance.ip"
    ],
    "past_due": [
      "business_profile.mcc",
      "business_profile.url",
      "business_type",
      "external_account",
      "representative.dob.day",
      "representative.dob.month",
      "representative.dob.year",
      "representative.email",
      "representative.first_name",
      "representative.last_name",
      "settings.payments.statement_descriptor",
      "tos_acceptance.date",
      "tos_acceptance.ip"
    ],
    "pending_verification": []
  },
  "settings": {
    "bacs_debit_payments": {
      "display_name": null,
      "service_user_number": null
    },
    "branding": {
      "icon": null,
      "logo": null,
      "primary_color": null,
      "secondary_color": null
    },
    "card_issuing": {
      "tos_acceptance": {
        "date": null,
        "ip": null
      }
    },
    "card_payments": {
      "decline_on": {
        "avs_failure": false,
        "cvc_failure": false
      },
      "statement_descriptor_prefix": null,
      "statement_descriptor_prefix_kana": null,
      "statement_descriptor_prefix_kanji": null
    },
    "dashboard": {
      "display_name": null,
      "timezone": "Etc/UTC"
    },
    "invoices": {
      "default_account_tax_ids": null,
      "hosted_payment_method_save": "always"
    },
    "payments": {
      "statement_descriptor": null,
      "statement_descriptor_kana": null,
      "statement_descriptor_kanji": null
    },
    "payouts": {
      "debit_negative_balances": true,
      "schedule": {
        "delay_days": 2,
        "interval": "daily"
      },
      "statement_descriptor": null
    },
    "sepa_debit_payments": {}
  },
  "tos_acceptance": {
    "date": null,
    "ip": null,
    "user_agent": null
  },
  "type": "express"
}
✅ Created US account: [0;32m[INFO][0m Creating test Connect account for US (usd)
[0;31m[ERROR][0m Failed to create account for US. Error: {
  "id": "acct_1RAF0mGda3Zwwyjw",
  "object": "account",
  "business_profile": {
    "annual_revenue": null,
    "estimated_worker_count": null,
    "mcc": null,
    "name": null,
    "product_description": null,
    "support_address": null,
    "support_email": null,
    "support_phone": null,
    "support_url": null,
    "url": null
  },
  "business_type": null,
  "capabilities": {
    "card_payments": "inactive",
    "transfers": "inactive"
  },
  "charges_enabled": false,
  "controller": {
    "fees": {
      "payer": "application_express"
    },
    "is_controller": true,
    "losses": {
      "payments": "application"
    },
    "requirement_collection": "stripe",
    "stripe_dashboard": {
      "type": "express"
    },
    "type": "application"
  },
  "country": "US",
  "created": 1743791441,
  "default_currency": "usd",
  "details_submitted": false,
  "email": "instructor-us@example.com",
  "external_accounts": {
    "object": "list",
    "data": [],
    "has_more": false,
    "total_count": 0,
    "url": "/v1/accounts/acct_1RAF0mGda3Zwwyjw/external_accounts"
  },
  "future_requirements": {
    "alternatives": [],
    "current_deadline": null,
    "currently_due": [],
    "disabled_reason": null,
    "errors": [],
    "eventually_due": [],
    "past_due": [],
    "pending_verification": []
  },
  "login_links": {
    "object": "list",
    "data": [],
    "has_more": false,
    "total_count": 0,
    "url": "/v1/accounts/acct_1RAF0mGda3Zwwyjw/login_links"
  },
  "metadata": {},
  "payouts_enabled": false,
  "requirements": {
    "alternatives": [
      {
        "alternative_fields_due": [
          "business_profile.product_description"
        ],
        "original_fields_due": [
          "business_profile.url"
        ]
      }
    ],
    "current_deadline": null,
    "currently_due": [
      "business_profile.mcc",
      "business_profile.url",
      "business_type",
      "external_account",
      "representative.dob.day",
      "representative.dob.month",
      "representative.dob.year",
      "representative.email",
      "representative.first_name",
      "representative.last_name",
      "settings.payments.statement_descriptor",
      "tos_acceptance.date",
      "tos_acceptance.ip"
    ],
    "disabled_reason": "requirements.past_due",
    "errors": [],
    "eventually_due": [
      "business_profile.mcc",
      "business_profile.url",
      "business_type",
      "external_account",
      "representative.dob.day",
      "representative.dob.month",
      "representative.dob.year",
      "representative.email",
      "representative.first_name",
      "representative.last_name",
      "settings.payments.statement_descriptor",
      "tos_acceptance.date",
      "tos_acceptance.ip"
    ],
    "past_due": [
      "business_profile.mcc",
      "business_profile.url",
      "business_type",
      "external_account",
      "representative.dob.day",
      "representative.dob.month",
      "representative.dob.year",
      "representative.email",
      "representative.first_name",
      "representative.last_name",
      "settings.payments.statement_descriptor",
      "tos_acceptance.date",
      "tos_acceptance.ip"
    ],
    "pending_verification": []
  },
  "settings": {
    "bacs_debit_payments": {
      "display_name": null,
      "service_user_number": null
    },
    "branding": {
      "icon": null,
      "logo": null,
      "primary_color": null,
      "secondary_color": null
    },
    "card_issuing": {
      "tos_acceptance": {
        "date": null,
        "ip": null
      }
    },
    "card_payments": {
      "decline_on": {
        "avs_failure": false,
        "cvc_failure": false
      },
      "statement_descriptor_prefix": null,
      "statement_descriptor_prefix_kana": null,
      "statement_descriptor_prefix_kanji": null
    },
    "dashboard": {
      "display_name": null,
      "timezone": "Etc/UTC"
    },
    "invoices": {
      "default_account_tax_ids": null,
      "hosted_payment_method_save": "always"
    },
    "payments": {
      "statement_descriptor": null,
      "statement_descriptor_kana": null,
      "statement_descriptor_kanji": null
    },
    "payouts": {
      "debit_negative_balances": true,
      "schedule": {
        "delay_days": 2,
        "interval": "daily"
      },
      "statement_descriptor": null
    },
    "sepa_debit_payments": {}
  },
  "tos_acceptance": {
    "date": null,
    "ip": null,
    "user_agent": null
  },
  "type": "express"
}
Updated test results: Connect Account Creation - US: Completed
Creating test Connect account for DE (eur)
ERROR: Failed to create account for DE. Error: {
  "id": "acct_1RAF0p2fLx3eEc9X",
  "object": "account",
  "business_profile": {
    "annual_revenue": null,
    "estimated_worker_count": null,
    "mcc": null,
    "name": null,
    "product_description": null,
    "support_address": null,
    "support_email": null,
    "support_phone": null,
    "support_url": null,
    "url": null
  },
  "business_type": null,
  "capabilities": {
    "card_payments": "inactive",
    "transfers": "inactive"
  },
  "charges_enabled": false,
  "controller": {
    "fees": {
      "payer": "application_express"
    },
    "is_controller": true,
    "losses": {
      "payments": "application"
    },
    "requirement_collection": "stripe",
    "stripe_dashboard": {
      "type": "express"
    },
    "type": "application"
  },
  "country": "DE",
  "created": 1743791444,
  "default_currency": "eur",
  "details_submitted": false,
  "email": "instructor-eu@example.com",
  "external_accounts": {
    "object": "list",
    "data": [],
    "has_more": false,
    "total_count": 0,
    "url": "/v1/accounts/acct_1RAF0p2fLx3eEc9X/external_accounts"
  },
  "future_requirements": {
    "alternatives": [],
    "current_deadline": null,
    "currently_due": [],
    "disabled_reason": null,
    "errors": [],
    "eventually_due": [],
    "past_due": [],
    "pending_verification": []
  },
  "login_links": {
    "object": "list",
    "data": [],
    "has_more": false,
    "total_count": 0,
    "url": "/v1/accounts/acct_1RAF0p2fLx3eEc9X/login_links"
  },
  "metadata": {},
  "payouts_enabled": false,
  "requirements": {
    "alternatives": [],
    "current_deadline": null,
    "currently_due": [
      "business_profile.mcc",
      "business_profile.url",
      "business_type",
      "external_account",
      "representative.address.city",
      "representative.address.line1",
      "representative.address.postal_code",
      "representative.dob.day",
      "representative.dob.month",
      "representative.dob.year",
      "representative.email",
      "representative.first_name",
      "representative.last_name",
      "representative.phone",
      "tos_acceptance.date",
      "tos_acceptance.ip"
    ],
    "disabled_reason": "requirements.past_due",
    "errors": [],
    "eventually_due": [
      "business_profile.mcc",
      "business_profile.url",
      "business_type",
      "external_account",
      "representative.address.city",
      "representative.address.line1",
      "representative.address.postal_code",
      "representative.dob.day",
      "representative.dob.month",
      "representative.dob.year",
      "representative.email",
      "representative.first_name",
      "representative.last_name",
      "representative.phone",
      "tos_acceptance.date",
      "tos_acceptance.ip"
    ],
    "past_due": [
      "business_profile.mcc",
      "business_profile.url",
      "business_type",
      "external_account",
      "representative.address.city",
      "representative.address.line1",
      "representative.address.postal_code",
      "representative.dob.day",
      "representative.dob.month",
      "representative.dob.year",
      "representative.email",
      "representative.first_name",
      "representative.last_name",
      "representative.phone",
      "tos_acceptance.date",
      "tos_acceptance.ip"
    ],
    "pending_verification": []
  },
  "settings": {
    "bacs_debit_payments": {
      "display_name": null,
      "service_user_number": null
    },
    "branding": {
      "icon": null,
      "logo": null,
      "primary_color": null,
      "secondary_color": null
    },
    "card_issuing": {
      "tos_acceptance": {
        "date": null,
        "ip": null
      }
    },
    "card_payments": {
      "decline_on": {
        "avs_failure": false,
        "cvc_failure": false
      },
      "statement_descriptor_prefix": null,
      "statement_descriptor_prefix_kana": null,
      "statement_descriptor_prefix_kanji": null
    },
    "dashboard": {
      "display_name": null,
      "timezone": "Etc/UTC"
    },
    "invoices": {
      "default_account_tax_ids": null,
      "hosted_payment_method_save": "always"
    },
    "payments": {
      "statement_descriptor": null,
      "statement_descriptor_kana": null,
      "statement_descriptor_kanji": null
    },
    "payouts": {
      "debit_negative_balances": true,
      "schedule": {
        "delay_days": 7,
        "interval": "daily"
      },
      "statement_descriptor": null
    },
    "sepa_debit_payments": {}
  },
  "tos_acceptance": {
    "date": null,
    "ip": null,
    "user_agent": null
  },
  "type": "express"
}
✅ Created EU account: [0;32m[INFO][0m Creating test Connect account for DE (eur)
[0;31m[ERROR][0m Failed to create account for DE. Error: {
  "id": "acct_1RAF0p2fLx3eEc9X",
  "object": "account",
  "business_profile": {
    "annual_revenue": null,
    "estimated_worker_count": null,
    "mcc": null,
    "name": null,
    "product_description": null,
    "support_address": null,
    "support_email": null,
    "support_phone": null,
    "support_url": null,
    "url": null
  },
  "business_type": null,
  "capabilities": {
    "card_payments": "inactive",
    "transfers": "inactive"
  },
  "charges_enabled": false,
  "controller": {
    "fees": {
      "payer": "application_express"
    },
    "is_controller": true,
    "losses": {
      "payments": "application"
    },
    "requirement_collection": "stripe",
    "stripe_dashboard": {
      "type": "express"
    },
    "type": "application"
  },
  "country": "DE",
  "created": 1743791444,
  "default_currency": "eur",
  "details_submitted": false,
  "email": "instructor-eu@example.com",
  "external_accounts": {
    "object": "list",
    "data": [],
    "has_more": false,
    "total_count": 0,
    "url": "/v1/accounts/acct_1RAF0p2fLx3eEc9X/external_accounts"
  },
  "future_requirements": {
    "alternatives": [],
    "current_deadline": null,
    "currently_due": [],
    "disabled_reason": null,
    "errors": [],
    "eventually_due": [],
    "past_due": [],
    "pending_verification": []
  },
  "login_links": {
    "object": "list",
    "data": [],
    "has_more": false,
    "total_count": 0,
    "url": "/v1/accounts/acct_1RAF0p2fLx3eEc9X/login_links"
  },
  "metadata": {},
  "payouts_enabled": false,
  "requirements": {
    "alternatives": [],
    "current_deadline": null,
    "currently_due": [
      "business_profile.mcc",
      "business_profile.url",
      "business_type",
      "external_account",
      "representative.address.city",
      "representative.address.line1",
      "representative.address.postal_code",
      "representative.dob.day",
      "representative.dob.month",
      "representative.dob.year",
      "representative.email",
      "representative.first_name",
      "representative.last_name",
      "representative.phone",
      "tos_acceptance.date",
      "tos_acceptance.ip"
    ],
    "disabled_reason": "requirements.past_due",
    "errors": [],
    "eventually_due": [
      "business_profile.mcc",
      "business_profile.url",
      "business_type",
      "external_account",
      "representative.address.city",
      "representative.address.line1",
      "representative.address.postal_code",
      "representative.dob.day",
      "representative.dob.month",
      "representative.dob.year",
      "representative.email",
      "representative.first_name",
      "representative.last_name",
      "representative.phone",
      "tos_acceptance.date",
      "tos_acceptance.ip"
    ],
    "past_due": [
      "business_profile.mcc",
      "business_profile.url",
      "business_type",
      "external_account",
      "representative.address.city",
      "representative.address.line1",
      "representative.address.postal_code",
      "representative.dob.day",
      "representative.dob.month",
      "representative.dob.year",
      "representative.email",
      "representative.first_name",
      "representative.last_name",
      "representative.phone",
      "tos_acceptance.date",
      "tos_acceptance.ip"
    ],
    "pending_verification": []
  },
  "settings": {
    "bacs_debit_payments": {
      "display_name": null,
      "service_user_number": null
    },
    "branding": {
      "icon": null,
      "logo": null,
      "primary_color": null,
      "secondary_color": null
    },
    "card_issuing": {
      "tos_acceptance": {
        "date": null,
        "ip": null
      }
    },
    "card_payments": {
      "decline_on": {
        "avs_failure": false,
        "cvc_failure": false
      },
      "statement_descriptor_prefix": null,
      "statement_descriptor_prefix_kana": null,
      "statement_descriptor_prefix_kanji": null
    },
    "dashboard": {
      "display_name": null,
      "timezone": "Etc/UTC"
    },
    "invoices": {
      "default_account_tax_ids": null,
      "hosted_payment_method_save": "always"
    },
    "payments": {
      "statement_descriptor": null,
      "statement_descriptor_kana": null,
      "statement_descriptor_kanji": null
    },
    "payouts": {
      "debit_negative_balances": true,
      "schedule": {
        "delay_days": 7,
        "interval": "daily"
      },
      "statement_descriptor": null
    },
    "sepa_debit_payments": {}
  },
  "tos_acceptance": {
    "date": null,
    "ip": null,
    "user_agent": null
  },
  "type": "express"
}
Updated test results: Connect Account Creation - EU: Completed
Creating test Connect account for GB (gbp)
ERROR: Failed to create account for GB. Error: {
  "id": "acct_1RAF0sGfxvWHuIpz",
  "object": "account",
  "business_profile": {
    "annual_revenue": null,
    "estimated_worker_count": null,
    "mcc": null,
    "name": null,
    "product_description": null,
    "support_address": null,
    "support_email": null,
    "support_phone": null,
    "support_url": null,
    "url": null
  },
  "business_type": null,
  "capabilities": {
    "card_payments": "inactive",
    "transfers": "inactive"
  },
  "charges_enabled": false,
  "controller": {
    "fees": {
      "payer": "application_express"
    },
    "is_controller": true,
    "losses": {
      "payments": "application"
    },
    "requirement_collection": "stripe",
    "stripe_dashboard": {
      "type": "express"
    },
    "type": "application"
  },
  "country": "GB",
  "created": 1743791447,
  "default_currency": "gbp",
  "details_submitted": false,
  "email": "instructor-uk@example.com",
  "external_accounts": {
    "object": "list",
    "data": [],
    "has_more": false,
    "total_count": 0,
    "url": "/v1/accounts/acct_1RAF0sGfxvWHuIpz/external_accounts"
  },
  "future_requirements": {
    "alternatives": [],
    "current_deadline": null,
    "currently_due": [],
    "disabled_reason": null,
    "errors": [],
    "eventually_due": [],
    "past_due": [],
    "pending_verification": []
  },
  "login_links": {
    "object": "list",
    "data": [],
    "has_more": false,
    "total_count": 0,
    "url": "/v1/accounts/acct_1RAF0sGfxvWHuIpz/login_links"
  },
  "metadata": {},
  "payouts_enabled": false,
  "requirements": {
    "alternatives": [],
    "current_deadline": null,
    "currently_due": [
      "business_profile.mcc",
      "business_profile.url",
      "business_type",
      "external_account",
      "representative.address.city",
      "representative.address.line1",
      "representative.address.postal_code",
      "representative.dob.day",
      "representative.dob.month",
      "representative.dob.year",
      "representative.email",
      "representative.first_name",
      "representative.last_name",
      "representative.phone",
      "tos_acceptance.date",
      "tos_acceptance.ip"
    ],
    "disabled_reason": "requirements.past_due",
    "errors": [],
    "eventually_due": [
      "business_profile.mcc",
      "business_profile.url",
      "business_type",
      "external_account",
      "representative.address.city",
      "representative.address.line1",
      "representative.address.postal_code",
      "representative.dob.day",
      "representative.dob.month",
      "representative.dob.year",
      "representative.email",
      "representative.first_name",
      "representative.last_name",
      "representative.phone",
      "tos_acceptance.date",
      "tos_acceptance.ip"
    ],
    "past_due": [
      "business_profile.mcc",
      "business_profile.url",
      "business_type",
      "external_account",
      "representative.address.city",
      "representative.address.line1",
      "representative.address.postal_code",
      "representative.dob.day",
      "representative.dob.month",
      "representative.dob.year",
      "representative.email",
      "representative.first_name",
      "representative.last_name",
      "representative.phone",
      "tos_acceptance.date",
      "tos_acceptance.ip"
    ],
    "pending_verification": []
  },
  "settings": {
    "bacs_debit_payments": {
      "display_name": null,
      "service_user_number": null
    },
    "branding": {
      "icon": null,
      "logo": null,
      "primary_color": null,
      "secondary_color": null
    },
    "card_issuing": {
      "tos_acceptance": {
        "date": null,
        "ip": null
      }
    },
    "card_payments": {
      "decline_on": {
        "avs_failure": false,
        "cvc_failure": false
      },
      "statement_descriptor_prefix": null,
      "statement_descriptor_prefix_kana": null,
      "statement_descriptor_prefix_kanji": null
    },
    "dashboard": {
      "display_name": null,
      "timezone": "Etc/UTC"
    },
    "invoices": {
      "default_account_tax_ids": null,
      "hosted_payment_method_save": "always"
    },
    "payments": {
      "statement_descriptor": null,
      "statement_descriptor_kana": null,
      "statement_descriptor_kanji": null
    },
    "payouts": {
      "debit_negative_balances": true,
      "schedule": {
        "delay_days": 7,
        "interval": "daily"
      },
      "statement_descriptor": null
    },
    "sepa_debit_payments": {}
  },
  "tos_acceptance": {
    "date": null,
    "ip": null,
    "user_agent": null
  },
  "type": "express"
}
✅ Created UK account: [0;32m[INFO][0m Creating test Connect account for GB (gbp)
[0;31m[ERROR][0m Failed to create account for GB. Error: {
  "id": "acct_1RAF0sGfxvWHuIpz",
  "object": "account",
  "business_profile": {
    "annual_revenue": null,
    "estimated_worker_count": null,
    "mcc": null,
    "name": null,
    "product_description": null,
    "support_address": null,
    "support_email": null,
    "support_phone": null,
    "support_url": null,
    "url": null
  },
  "business_type": null,
  "capabilities": {
    "card_payments": "inactive",
    "transfers": "inactive"
  },
  "charges_enabled": false,
  "controller": {
    "fees": {
      "payer": "application_express"
    },
    "is_controller": true,
    "losses": {
      "payments": "application"
    },
    "requirement_collection": "stripe",
    "stripe_dashboard": {
      "type": "express"
    },
    "type": "application"
  },
  "country": "GB",
  "created": 1743791447,
  "default_currency": "gbp",
  "details_submitted": false,
  "email": "instructor-uk@example.com",
  "external_accounts": {
    "object": "list",
    "data": [],
    "has_more": false,
    "total_count": 0,
    "url": "/v1/accounts/acct_1RAF0sGfxvWHuIpz/external_accounts"
  },
  "future_requirements": {
    "alternatives": [],
    "current_deadline": null,
    "currently_due": [],
    "disabled_reason": null,
    "errors": [],
    "eventually_due": [],
    "past_due": [],
    "pending_verification": []
  },
  "login_links": {
    "object": "list",
    "data": [],
    "has_more": false,
    "total_count": 0,
    "url": "/v1/accounts/acct_1RAF0sGfxvWHuIpz/login_links"
  },
  "metadata": {},
  "payouts_enabled": false,
  "requirements": {
    "alternatives": [],
    "current_deadline": null,
    "currently_due": [
      "business_profile.mcc",
      "business_profile.url",
      "business_type",
      "external_account",
      "representative.address.city",
      "representative.address.line1",
      "representative.address.postal_code",
      "representative.dob.day",
      "representative.dob.month",
      "representative.dob.year",
      "representative.email",
      "representative.first_name",
      "representative.last_name",
      "representative.phone",
      "tos_acceptance.date",
      "tos_acceptance.ip"
    ],
    "disabled_reason": "requirements.past_due",
    "errors": [],
    "eventually_due": [
      "business_profile.mcc",
      "business_profile.url",
      "business_type",
      "external_account",
      "representative.address.city",
      "representative.address.line1",
      "representative.address.postal_code",
      "representative.dob.day",
      "representative.dob.month",
      "representative.dob.year",
      "representative.email",
      "representative.first_name",
      "representative.last_name",
      "representative.phone",
      "tos_acceptance.date",
      "tos_acceptance.ip"
    ],
    "past_due": [
      "business_profile.mcc",
      "business_profile.url",
      "business_type",
      "external_account",
      "representative.address.city",
      "representative.address.line1",
      "representative.address.postal_code",
      "representative.dob.day",
      "representative.dob.month",
      "representative.dob.year",
      "representative.email",
      "representative.first_name",
      "representative.last_name",
      "representative.phone",
      "tos_acceptance.date",
      "tos_acceptance.ip"
    ],
    "pending_verification": []
  },
  "settings": {
    "bacs_debit_payments": {
      "display_name": null,
      "service_user_number": null
    },
    "branding": {
      "icon": null,
      "logo": null,
      "primary_color": null,
      "secondary_color": null
    },
    "card_issuing": {
      "tos_acceptance": {
        "date": null,
        "ip": null
      }
    },
    "card_payments": {
      "decline_on": {
        "avs_failure": false,
        "cvc_failure": false
      },
      "statement_descriptor_prefix": null,
      "statement_descriptor_prefix_kana": null,
      "statement_descriptor_prefix_kanji": null
    },
    "dashboard": {
      "display_name": null,
      "timezone": "Etc/UTC"
    },
    "invoices": {
      "default_account_tax_ids": null,
      "hosted_payment_method_save": "always"
    },
    "payments": {
      "statement_descriptor": null,
      "statement_descriptor_kana": null,
      "statement_descriptor_kanji": null
    },
    "payouts": {
      "debit_negative_balances": true,
      "schedule": {
        "delay_days": 7,
        "interval": "daily"
      },
      "statement_descriptor": null
    },
    "sepa_debit_payments": {}
  },
  "tos_acceptance": {
    "date": null,
    "ip": null,
    "user_agent": null
  },
  "type": "express"
}
Updated test results: Connect Account Creation - UK: Completed
Creating test Connect account for AU (aud)
ERROR: Failed to create account for AU. Error: {
  "id": "acct_1RAF0vGd7YIaHW4I",
  "object": "account",
  "business_profile": {
    "annual_revenue": null,
    "estimated_worker_count": null,
    "mcc": null,
    "name": null,
    "product_description": null,
    "support_address": null,
    "support_email": null,
    "support_phone": null,
    "support_url": null,
    "url": null
  },
  "business_type": null,
  "capabilities": {
    "card_payments": "inactive",
    "transfers": "inactive"
  },
  "charges_enabled": false,
  "controller": {
    "fees": {
      "payer": "application_express"
    },
    "is_controller": true,
    "losses": {
      "payments": "application"
    },
    "requirement_collection": "stripe",
    "stripe_dashboard": {
      "type": "express"
    },
    "type": "application"
  },
  "country": "AU",
  "created": 1743791450,
  "default_currency": "aud",
  "details_submitted": false,
  "email": "instructor-au@example.com",
  "external_accounts": {
    "object": "list",
    "data": [],
    "has_more": false,
    "total_count": 0,
    "url": "/v1/accounts/acct_1RAF0vGd7YIaHW4I/external_accounts"
  },
  "future_requirements": {
    "alternatives": [],
    "current_deadline": null,
    "currently_due": [],
    "disabled_reason": null,
    "errors": [],
    "eventually_due": [],
    "past_due": [],
    "pending_verification": []
  },
  "login_links": {
    "object": "list",
    "data": [],
    "has_more": false,
    "total_count": 0,
    "url": "/v1/accounts/acct_1RAF0vGd7YIaHW4I/login_links"
  },
  "metadata": {},
  "payouts_enabled": false,
  "requirements": {
    "alternatives": [],
    "current_deadline": null,
    "currently_due": [
      "business_profile.mcc",
      "business_profile.url",
      "business_type",
      "external_account",
      "representative.address.city",
      "representative.address.line1",
      "representative.address.postal_code",
      "representative.address.state",
      "representative.dob.day",
      "representative.dob.month",
      "representative.dob.year",
      "representative.email",
      "representative.first_name",
      "representative.last_name",
      "representative.phone",
      "tos_acceptance.date",
      "tos_acceptance.ip"
    ],
    "disabled_reason": "requirements.past_due",
    "errors": [],
    "eventually_due": [
      "business_profile.mcc",
      "business_profile.url",
      "business_type",
      "external_account",
      "representative.address.city",
      "representative.address.line1",
      "representative.address.postal_code",
      "representative.address.state",
      "representative.dob.day",
      "representative.dob.month",
      "representative.dob.year",
      "representative.email",
      "representative.first_name",
      "representative.last_name",
      "representative.phone",
      "tos_acceptance.date",
      "tos_acceptance.ip"
    ],
    "past_due": [
      "business_profile.mcc",
      "business_profile.url",
      "business_type",
      "external_account",
      "representative.address.city",
      "representative.address.line1",
      "representative.address.postal_code",
      "representative.address.state",
      "representative.dob.day",
      "representative.dob.month",
      "representative.dob.year",
      "representative.email",
      "representative.first_name",
      "representative.last_name",
      "representative.phone",
      "tos_acceptance.date",
      "tos_acceptance.ip"
    ],
    "pending_verification": []
  },
  "settings": {
    "bacs_debit_payments": {
      "display_name": null,
      "service_user_number": null
    },
    "branding": {
      "icon": null,
      "logo": null,
      "primary_color": null,
      "secondary_color": null
    },
    "card_issuing": {
      "tos_acceptance": {
        "date": null,
        "ip": null
      }
    },
    "card_payments": {
      "decline_on": {
        "avs_failure": false,
        "cvc_failure": false
      },
      "statement_descriptor_prefix": null,
      "statement_descriptor_prefix_kana": null,
      "statement_descriptor_prefix_kanji": null
    },
    "dashboard": {
      "display_name": null,
      "timezone": "Etc/UTC"
    },
    "invoices": {
      "default_account_tax_ids": null,
      "hosted_payment_method_save": "always"
    },
    "payments": {
      "statement_descriptor": null,
      "statement_descriptor_kana": null,
      "statement_descriptor_kanji": null
    },
    "payouts": {
      "debit_negative_balances": true,
      "schedule": {
        "delay_days": 2,
        "interval": "daily"
      },
      "statement_descriptor": null
    },
    "sepa_debit_payments": {}
  },
  "tos_acceptance": {
    "date": null,
    "ip": null,
    "user_agent": null
  },
  "type": "express"
}
✅ Created AU account: [0;32m[INFO][0m Creating test Connect account for AU (aud)
[0;31m[ERROR][0m Failed to create account for AU. Error: {
  "id": "acct_1RAF0vGd7YIaHW4I",
  "object": "account",
  "business_profile": {
    "annual_revenue": null,
    "estimated_worker_count": null,
    "mcc": null,
    "name": null,
    "product_description": null,
    "support_address": null,
    "support_email": null,
    "support_phone": null,
    "support_url": null,
    "url": null
  },
  "business_type": null,
  "capabilities": {
    "card_payments": "inactive",
    "transfers": "inactive"
  },
  "charges_enabled": false,
  "controller": {
    "fees": {
      "payer": "application_express"
    },
    "is_controller": true,
    "losses": {
      "payments": "application"
    },
    "requirement_collection": "stripe",
    "stripe_dashboard": {
      "type": "express"
    },
    "type": "application"
  },
  "country": "AU",
  "created": 1743791450,
  "default_currency": "aud",
  "details_submitted": false,
  "email": "instructor-au@example.com",
  "external_accounts": {
    "object": "list",
    "data": [],
    "has_more": false,
    "total_count": 0,
    "url": "/v1/accounts/acct_1RAF0vGd7YIaHW4I/external_accounts"
  },
  "future_requirements": {
    "alternatives": [],
    "current_deadline": null,
    "currently_due": [],
    "disabled_reason": null,
    "errors": [],
    "eventually_due": [],
    "past_due": [],
    "pending_verification": []
  },
  "login_links": {
    "object": "list",
    "data": [],
    "has_more": false,
    "total_count": 0,
    "url": "/v1/accounts/acct_1RAF0vGd7YIaHW4I/login_links"
  },
  "metadata": {},
  "payouts_enabled": false,
  "requirements": {
    "alternatives": [],
    "current_deadline": null,
    "currently_due": [
      "business_profile.mcc",
      "business_profile.url",
      "business_type",
      "external_account",
      "representative.address.city",
      "representative.address.line1",
      "representative.address.postal_code",
      "representative.address.state",
      "representative.dob.day",
      "representative.dob.month",
      "representative.dob.year",
      "representative.email",
      "representative.first_name",
      "representative.last_name",
      "representative.phone",
      "tos_acceptance.date",
      "tos_acceptance.ip"
    ],
    "disabled_reason": "requirements.past_due",
    "errors": [],
    "eventually_due": [
      "business_profile.mcc",
      "business_profile.url",
      "business_type",
      "external_account",
      "representative.address.city",
      "representative.address.line1",
      "representative.address.postal_code",
      "representative.address.state",
      "representative.dob.day",
      "representative.dob.month",
      "representative.dob.year",
      "representative.email",
      "representative.first_name",
      "representative.last_name",
      "representative.phone",
      "tos_acceptance.date",
      "tos_acceptance.ip"
    ],
    "past_due": [
      "business_profile.mcc",
      "business_profile.url",
      "business_type",
      "external_account",
      "representative.address.city",
      "representative.address.line1",
      "representative.address.postal_code",
      "representative.address.state",
      "representative.dob.day",
      "representative.dob.month",
      "representative.dob.year",
      "representative.email",
      "representative.first_name",
      "representative.last_name",
      "representative.phone",
      "tos_acceptance.date",
      "tos_acceptance.ip"
    ],
    "pending_verification": []
  },
  "settings": {
    "bacs_debit_payments": {
      "display_name": null,
      "service_user_number": null
    },
    "branding": {
      "icon": null,
      "logo": null,
      "primary_color": null,
      "secondary_color": null
    },
    "card_issuing": {
      "tos_acceptance": {
        "date": null,
        "ip": null
      }
    },
    "card_payments": {
      "decline_on": {
        "avs_failure": false,
        "cvc_failure": false
      },
      "statement_descriptor_prefix": null,
      "statement_descriptor_prefix_kana": null,
      "statement_descriptor_prefix_kanji": null
    },
    "dashboard": {
      "display_name": null,
      "timezone": "Etc/UTC"
    },
    "invoices": {
      "default_account_tax_ids": null,
      "hosted_payment_method_save": "always"
    },
    "payments": {
      "statement_descriptor": null,
      "statement_descriptor_kana": null,
      "statement_descriptor_kanji": null
    },
    "payouts": {
      "debit_negative_balances": true,
      "schedule": {
        "delay_days": 2,
        "interval": "daily"
      },
      "statement_descriptor": null
    },
    "sepa_debit_payments": {}
  },
  "tos_acceptance": {
    "date": null,
    "ip": null,
    "user_agent": null
  },
  "type": "express"
}
Updated test results: Connect Account Creation - AU: Completed
Creating test Connect account for JP (jpy)
ERROR: Failed to create account for JP. Error: {
  "id": "acct_1RAF0yGaaAwfGhzA",
  "object": "account",
  "business_profile": {
    "annual_revenue": null,
    "estimated_worker_count": null,
    "mcc": null,
    "name": null,
    "product_description": null,
    "support_address": null,
    "support_email": null,
    "support_phone": null,
    "support_url": null,
    "url": null
  },
  "business_type": null,
  "capabilities": {
    "card_payments": "inactive",
    "transfers": "inactive"
  },
  "charges_enabled": false,
  "controller": {
    "fees": {
      "payer": "application_express"
    },
    "is_controller": true,
    "losses": {
      "payments": "application"
    },
    "requirement_collection": "stripe",
    "stripe_dashboard": {
      "type": "express"
    },
    "type": "application"
  },
  "country": "JP",
  "created": 1743791453,
  "default_currency": "jpy",
  "details_submitted": false,
  "email": "instructor-jp@example.com",
  "external_accounts": {
    "object": "list",
    "data": [],
    "has_more": false,
    "total_count": 0,
    "url": "/v1/accounts/acct_1RAF0yGaaAwfGhzA/external_accounts"
  },
  "future_requirements": {
    "alternatives": [],
    "current_deadline": null,
    "currently_due": [],
    "disabled_reason": null,
    "errors": [],
    "eventually_due": [],
    "past_due": [],
    "pending_verification": []
  },
  "login_links": {
    "object": "list",
    "data": [],
    "has_more": false,
    "total_count": 0,
    "url": "/v1/accounts/acct_1RAF0yGaaAwfGhzA/login_links"
  },
  "metadata": {},
  "payouts_enabled": false,
  "requirements": {
    "alternatives": [],
    "current_deadline": null,
    "currently_due": [
      "business_profile.mcc",
      "business_profile.product_description",
      "business_profile.url",
      "business_type",
      "external_account",
      "representative.address_kana.city",
      "representative.address_kana.line1",
      "representative.address_kana.postal_code",
      "representative.address_kana.state",
      "representative.address_kana.town",
      "representative.address_kanji.city",
      "representative.address_kanji.line1",
      "representative.address_kanji.postal_code",
      "representative.address_kanji.state",
      "representative.address_kanji.town",
      "representative.dob.day",
      "representative.dob.month",
      "representative.dob.year",
      "representative.email",
      "representative.first_name_kana",
      "representative.first_name_kanji",
      "representative.last_name_kana",
      "representative.last_name_kanji",
      "representative.phone",
      "tos_acceptance.date",
      "tos_acceptance.ip"
    ],
    "disabled_reason": "requirements.past_due",
    "errors": [],
    "eventually_due": [
      "business_profile.mcc",
      "business_profile.product_description",
      "business_profile.url",
      "business_type",
      "external_account",
      "representative.address_kana.city",
      "representative.address_kana.line1",
      "representative.address_kana.postal_code",
      "representative.address_kana.state",
      "representative.address_kana.town",
      "representative.address_kanji.city",
      "representative.address_kanji.line1",
      "representative.address_kanji.postal_code",
      "representative.address_kanji.state",
      "representative.address_kanji.town",
      "representative.dob.day",
      "representative.dob.month",
      "representative.dob.year",
      "representative.email",
      "representative.first_name_kana",
      "representative.first_name_kanji",
      "representative.last_name_kana",
      "representative.last_name_kanji",
      "representative.phone",
      "tos_acceptance.date",
      "tos_acceptance.ip"
    ],
    "past_due": [
      "business_profile.mcc",
      "business_profile.product_description",
      "business_profile.url",
      "business_type",
      "external_account",
      "representative.address_kana.city",
      "representative.address_kana.line1",
      "representative.address_kana.postal_code",
      "representative.address_kana.state",
      "representative.address_kana.town",
      "representative.address_kanji.city",
      "representative.address_kanji.line1",
      "representative.address_kanji.postal_code",
      "representative.address_kanji.state",
      "representative.address_kanji.town",
      "representative.dob.day",
      "representative.dob.month",
      "representative.dob.year",
      "representative.email",
      "representative.first_name_kana",
      "representative.first_name_kanji",
      "representative.last_name_kana",
      "representative.last_name_kanji",
      "representative.phone",
      "tos_acceptance.date",
      "tos_acceptance.ip"
    ],
    "pending_verification": []
  },
  "settings": {
    "bacs_debit_payments": {
      "display_name": null,
      "service_user_number": null
    },
    "branding": {
      "icon": null,
      "logo": null,
      "primary_color": null,
      "secondary_color": null
    },
    "card_issuing": {
      "tos_acceptance": {
        "date": null,
        "ip": null
      }
    },
    "card_payments": {
      "decline_on": {
        "avs_failure": false,
        "cvc_failure": false
      },
      "statement_descriptor_prefix": null,
      "statement_descriptor_prefix_kana": null,
      "statement_descriptor_prefix_kanji": null
    },
    "dashboard": {
      "display_name": null,
      "timezone": "Etc/UTC"
    },
    "invoices": {
      "default_account_tax_ids": null,
      "hosted_payment_method_save": "always"
    },
    "payments": {
      "statement_descriptor": "",
      "statement_descriptor_kana": null,
      "statement_descriptor_kanji": null
    },
    "payouts": {
      "debit_negative_balances": true,
      "schedule": {
        "delay_days": 4,
        "interval": "weekly",
        "weekly_anchor": "friday"
      },
      "statement_descriptor": null
    },
    "sepa_debit_payments": {}
  },
  "tos_acceptance": {
    "date": null,
    "ip": null,
    "user_agent": null
  },
  "type": "express"
}
✅ Created JP account: [0;32m[INFO][0m Creating test Connect account for JP (jpy)
[0;31m[ERROR][0m Failed to create account for JP. Error: {
  "id": "acct_1RAF0yGaaAwfGhzA",
  "object": "account",
  "business_profile": {
    "annual_revenue": null,
    "estimated_worker_count": null,
    "mcc": null,
    "name": null,
    "product_description": null,
    "support_address": null,
    "support_email": null,
    "support_phone": null,
    "support_url": null,
    "url": null
  },
  "business_type": null,
  "capabilities": {
    "card_payments": "inactive",
    "transfers": "inactive"
  },
  "charges_enabled": false,
  "controller": {
    "fees": {
      "payer": "application_express"
    },
    "is_controller": true,
    "losses": {
      "payments": "application"
    },
    "requirement_collection": "stripe",
    "stripe_dashboard": {
      "type": "express"
    },
    "type": "application"
  },
  "country": "JP",
  "created": 1743791453,
  "default_currency": "jpy",
  "details_submitted": false,
  "email": "instructor-jp@example.com",
  "external_accounts": {
    "object": "list",
    "data": [],
    "has_more": false,
    "total_count": 0,
    "url": "/v1/accounts/acct_1RAF0yGaaAwfGhzA/external_accounts"
  },
  "future_requirements": {
    "alternatives": [],
    "current_deadline": null,
    "currently_due": [],
    "disabled_reason": null,
    "errors": [],
    "eventually_due": [],
    "past_due": [],
    "pending_verification": []
  },
  "login_links": {
    "object": "list",
    "data": [],
    "has_more": false,
    "total_count": 0,
    "url": "/v1/accounts/acct_1RAF0yGaaAwfGhzA/login_links"
  },
  "metadata": {},
  "payouts_enabled": false,
  "requirements": {
    "alternatives": [],
    "current_deadline": null,
    "currently_due": [
      "business_profile.mcc",
      "business_profile.product_description",
      "business_profile.url",
      "business_type",
      "external_account",
      "representative.address_kana.city",
      "representative.address_kana.line1",
      "representative.address_kana.postal_code",
      "representative.address_kana.state",
      "representative.address_kana.town",
      "representative.address_kanji.city",
      "representative.address_kanji.line1",
      "representative.address_kanji.postal_code",
      "representative.address_kanji.state",
      "representative.address_kanji.town",
      "representative.dob.day",
      "representative.dob.month",
      "representative.dob.year",
      "representative.email",
      "representative.first_name_kana",
      "representative.first_name_kanji",
      "representative.last_name_kana",
      "representative.last_name_kanji",
      "representative.phone",
      "tos_acceptance.date",
      "tos_acceptance.ip"
    ],
    "disabled_reason": "requirements.past_due",
    "errors": [],
    "eventually_due": [
      "business_profile.mcc",
      "business_profile.product_description",
      "business_profile.url",
      "business_type",
      "external_account",
      "representative.address_kana.city",
      "representative.address_kana.line1",
      "representative.address_kana.postal_code",
      "representative.address_kana.state",
      "representative.address_kana.town",
      "representative.address_kanji.city",
      "representative.address_kanji.line1",
      "representative.address_kanji.postal_code",
      "representative.address_kanji.state",
      "representative.address_kanji.town",
      "representative.dob.day",
      "representative.dob.month",
      "representative.dob.year",
      "representative.email",
      "representative.first_name_kana",
      "representative.first_name_kanji",
      "representative.last_name_kana",
      "representative.last_name_kanji",
      "representative.phone",
      "tos_acceptance.date",
      "tos_acceptance.ip"
    ],
    "past_due": [
      "business_profile.mcc",
      "business_profile.product_description",
      "business_profile.url",
      "business_type",
      "external_account",
      "representative.address_kana.city",
      "representative.address_kana.line1",
      "representative.address_kana.postal_code",
      "representative.address_kana.state",
      "representative.address_kana.town",
      "representative.address_kanji.city",
      "representative.address_kanji.line1",
      "representative.address_kanji.postal_code",
      "representative.address_kanji.state",
      "representative.address_kanji.town",
      "representative.dob.day",
      "representative.dob.month",
      "representative.dob.year",
      "representative.email",
      "representative.first_name_kana",
      "representative.first_name_kanji",
      "representative.last_name_kana",
      "representative.last_name_kanji",
      "representative.phone",
      "tos_acceptance.date",
      "tos_acceptance.ip"
    ],
    "pending_verification": []
  },
  "settings": {
    "bacs_debit_payments": {
      "display_name": null,
      "service_user_number": null
    },
    "branding": {
      "icon": null,
      "logo": null,
      "primary_color": null,
      "secondary_color": null
    },
    "card_issuing": {
      "tos_acceptance": {
        "date": null,
        "ip": null
      }
    },
    "card_payments": {
      "decline_on": {
        "avs_failure": false,
        "cvc_failure": false
      },
      "statement_descriptor_prefix": null,
      "statement_descriptor_prefix_kana": null,
      "statement_descriptor_prefix_kanji": null
    },
    "dashboard": {
      "display_name": null,
      "timezone": "Etc/UTC"
    },
    "invoices": {
      "default_account_tax_ids": null,
      "hosted_payment_method_save": "always"
    },
    "payments": {
      "statement_descriptor": "",
      "statement_descriptor_kana": null,
      "statement_descriptor_kanji": null
    },
    "payouts": {
      "debit_negative_balances": true,
      "schedule": {
        "delay_days": 4,
        "interval": "weekly",
        "weekly_anchor": "friday"
      },
      "statement_descriptor": null
    },
    "sepa_debit_payments": {}
  },
  "tos_acceptance": {
    "date": null,
    "ip": null,
    "user_agent": null
  },
  "type": "express"
}
Updated test results: Connect Account Creation - JP: Completed
Creating onboarding link for [0;32m[INFO][0m Creating test Connect account for US (usd)
[0;31m[ERROR][0m Failed to create account for US. Error: {
  "id": "acct_1RAF0mGda3Zwwyjw",
  "object": "account",
  "business_profile": {
    "annual_revenue": null,
    "estimated_worker_count": null,
    "mcc": null,
    "name": null,
    "product_description": null,
    "support_address": null,
    "support_email": null,
    "support_phone": null,
    "support_url": null,
    "url": null
  },
  "business_type": null,
  "capabilities": {
    "card_payments": "inactive",
    "transfers": "inactive"
  },
  "charges_enabled": false,
  "controller": {
    "fees": {
      "payer": "application_express"
    },
    "is_controller": true,
    "losses": {
      "payments": "application"
    },
    "requirement_collection": "stripe",
    "stripe_dashboard": {
      "type": "express"
    },
    "type": "application"
  },
  "country": "US",
  "created": 1743791441,
  "default_currency": "usd",
  "details_submitted": false,
  "email": "instructor-us@example.com",
  "external_accounts": {
    "object": "list",
    "data": [],
    "has_more": false,
    "total_count": 0,
    "url": "/v1/accounts/acct_1RAF0mGda3Zwwyjw/external_accounts"
  },
  "future_requirements": {
    "alternatives": [],
    "current_deadline": null,
    "currently_due": [],
    "disabled_reason": null,
    "errors": [],
    "eventually_due": [],
    "past_due": [],
    "pending_verification": []
  },
  "login_links": {
    "object": "list",
    "data": [],
    "has_more": false,
    "total_count": 0,
    "url": "/v1/accounts/acct_1RAF0mGda3Zwwyjw/login_links"
  },
  "metadata": {},
  "payouts_enabled": false,
  "requirements": {
    "alternatives": [
      {
        "alternative_fields_due": [
          "business_profile.product_description"
        ],
        "original_fields_due": [
          "business_profile.url"
        ]
      }
    ],
    "current_deadline": null,
    "currently_due": [
      "business_profile.mcc",
      "business_profile.url",
      "business_type",
      "external_account",
      "representative.dob.day",
      "representative.dob.month",
      "representative.dob.year",
      "representative.email",
      "representative.first_name",
      "representative.last_name",
      "settings.payments.statement_descriptor",
      "tos_acceptance.date",
      "tos_acceptance.ip"
    ],
    "disabled_reason": "requirements.past_due",
    "errors": [],
    "eventually_due": [
      "business_profile.mcc",
      "business_profile.url",
      "business_type",
      "external_account",
      "representative.dob.day",
      "representative.dob.month",
      "representative.dob.year",
      "representative.email",
      "representative.first_name",
      "representative.last_name",
      "settings.payments.statement_descriptor",
      "tos_acceptance.date",
      "tos_acceptance.ip"
    ],
    "past_due": [
      "business_profile.mcc",
      "business_profile.url",
      "business_type",
      "external_account",
      "representative.dob.day",
      "representative.dob.month",
      "representative.dob.year",
      "representative.email",
      "representative.first_name",
      "representative.last_name",
      "settings.payments.statement_descriptor",
      "tos_acceptance.date",
      "tos_acceptance.ip"
    ],
    "pending_verification": []
  },
  "settings": {
    "bacs_debit_payments": {
      "display_name": null,
      "service_user_number": null
    },
    "branding": {
      "icon": null,
      "logo": null,
      "primary_color": null,
      "secondary_color": null
    },
    "card_issuing": {
      "tos_acceptance": {
        "date": null,
        "ip": null
      }
    },
    "card_payments": {
      "decline_on": {
        "avs_failure": false,
        "cvc_failure": false
      },
      "statement_descriptor_prefix": null,
      "statement_descriptor_prefix_kana": null,
      "statement_descriptor_prefix_kanji": null
    },
    "dashboard": {
      "display_name": null,
      "timezone": "Etc/UTC"
    },
    "invoices": {
      "default_account_tax_ids": null,
      "hosted_payment_method_save": "always"
    },
    "payments": {
      "statement_descriptor": null,
      "statement_descriptor_kana": null,
      "statement_descriptor_kanji": null
    },
    "payouts": {
      "debit_negative_balances": true,
      "schedule": {
        "delay_days": 2,
        "interval": "daily"
      },
      "statement_descriptor": null
    },
    "sepa_debit_payments": {}
  },
  "tos_acceptance": {
    "date": null,
    "ip": null,
    "user_agent": null
  },
  "type": "express"
} (US)
ERROR: Failed to create onboarding link for [0;32m[INFO][0m Creating test Connect account for US (usd)
[0;31m[ERROR][0m Failed to create account for US. Error: {
  "id": "acct_1RAF0mGda3Zwwyjw",
  "object": "account",
  "business_profile": {
    "annual_revenue": null,
    "estimated_worker_count": null,
    "mcc": null,
    "name": null,
    "product_description": null,
    "support_address": null,
    "support_email": null,
    "support_phone": null,
    "support_url": null,
    "url": null
  },
  "business_type": null,
  "capabilities": {
    "card_payments": "inactive",
    "transfers": "inactive"
  },
  "charges_enabled": false,
  "controller": {
    "fees": {
      "payer": "application_express"
    },
    "is_controller": true,
    "losses": {
      "payments": "application"
    },
    "requirement_collection": "stripe",
    "stripe_dashboard": {
      "type": "express"
    },
    "type": "application"
  },
  "country": "US",
  "created": 1743791441,
  "default_currency": "usd",
  "details_submitted": false,
  "email": "instructor-us@example.com",
  "external_accounts": {
    "object": "list",
    "data": [],
    "has_more": false,
    "total_count": 0,
    "url": "/v1/accounts/acct_1RAF0mGda3Zwwyjw/external_accounts"
  },
  "future_requirements": {
    "alternatives": [],
    "current_deadline": null,
    "currently_due": [],
    "disabled_reason": null,
    "errors": [],
    "eventually_due": [],
    "past_due": [],
    "pending_verification": []
  },
  "login_links": {
    "object": "list",
    "data": [],
    "has_more": false,
    "total_count": 0,
    "url": "/v1/accounts/acct_1RAF0mGda3Zwwyjw/login_links"
  },
  "metadata": {},
  "payouts_enabled": false,
  "requirements": {
    "alternatives": [
      {
        "alternative_fields_due": [
          "business_profile.product_description"
        ],
        "original_fields_due": [
          "business_profile.url"
        ]
      }
    ],
    "current_deadline": null,
    "currently_due": [
      "business_profile.mcc",
      "business_profile.url",
      "business_type",
      "external_account",
      "representative.dob.day",
      "representative.dob.month",
      "representative.dob.year",
      "representative.email",
      "representative.first_name",
      "representative.last_name",
      "settings.payments.statement_descriptor",
      "tos_acceptance.date",
      "tos_acceptance.ip"
    ],
    "disabled_reason": "requirements.past_due",
    "errors": [],
    "eventually_due": [
      "business_profile.mcc",
      "business_profile.url",
      "business_type",
      "external_account",
      "representative.dob.day",
      "representative.dob.month",
      "representative.dob.year",
      "representative.email",
      "representative.first_name",
      "representative.last_name",
      "settings.payments.statement_descriptor",
      "tos_acceptance.date",
      "tos_acceptance.ip"
    ],
    "past_due": [
      "business_profile.mcc",
      "business_profile.url",
      "business_type",
      "external_account",
      "representative.dob.day",
      "representative.dob.month",
      "representative.dob.year",
      "representative.email",
      "representative.first_name",
      "representative.last_name",
      "settings.payments.statement_descriptor",
      "tos_acceptance.date",
      "tos_acceptance.ip"
    ],
    "pending_verification": []
  },
  "settings": {
    "bacs_debit_payments": {
      "display_name": null,
      "service_user_number": null
    },
    "branding": {
      "icon": null,
      "logo": null,
      "primary_color": null,
      "secondary_color": null
    },
    "card_issuing": {
      "tos_acceptance": {
        "date": null,
        "ip": null
      }
    },
    "card_payments": {
      "decline_on": {
        "avs_failure": false,
        "cvc_failure": false
      },
      "statement_descriptor_prefix": null,
      "statement_descriptor_prefix_kana": null,
      "statement_descriptor_prefix_kanji": null
    },
    "dashboard": {
      "display_name": null,
      "timezone": "Etc/UTC"
    },
    "invoices": {
      "default_account_tax_ids": null,
      "hosted_payment_method_save": "always"
    },
    "payments": {
      "statement_descriptor": null,
      "statement_descriptor_kana": null,
      "statement_descriptor_kanji": null
    },
    "payouts": {
      "debit_negative_balances": true,
      "schedule": {
        "delay_days": 2,
        "interval": "daily"
      },
      "statement_descriptor": null
    },
    "sepa_debit_payments": {}
  },
  "tos_acceptance": {
    "date": null,
    "ip": null,
    "user_agent": null
  },
  "type": "express"
}. Error: {
  "error": {
    "code": "resource_missing",
    "doc_url": "https://stripe.com/docs/error-codes/resource-missing",
    "message": "No such account: '\\u001b[0;32m[INFO]\\u001b[0m Creating test Connect account for US (usd)\\n\\u001b[0;31m[ERROR]\\u001b[0m Failed to create account for US. Error: {\\n  \\\"id\\\": \\\"acct_1RAF0mGda3Zwwyjw\\\",\\n  \\\"object\\\": \\\"account\\\",\\n  \\\"business_profile\\\": {\\n    \\\"annual_revenue\\\": null,\\n    \\\"estimated_worker_count\\\": null,\\n    \\\"mcc\\\": null,\\n    \\\"name\\\": null,\\n    \\\"product_description\\\": null,\\n    \\\"support_address\\\": null,\\n    \\\"support_email\\\": null,\\n    \\\"support_phone\\\": null,\\n    \\\"support_...(truncated)...tatement_descriptor\\\": null,\\n      \\\"statement_descriptor_kana\\\": null,\\n      \\\"statement_descriptor_kanji\\\": null\\n    },\\n    \\\"payouts\\\": {\\n      \\\"debit_negative_balances\\\": true,\\n      \\\"schedule\\\": {\\n        \\\"delay_days\\\": 2,\\n        \\\"interval\\\": \\\"daily\\\"\\n      },\\n      \\\"statement_descriptor\\\": null\\n    },\\n    \\\"sepa_debit_payments\\\": {}\\n  },\\n  \\\"tos_acceptance\\\": {\\n    \\\"date\\\": null,\\n    \\\"ip\\\": null,\\n    \\\"user_agent\\\": null\\n  },\\n  \\\"type\\\": \\\"express\\\"\\n}'",
    "param": "account",
    "request_log_url": "https://dashboard.stripe.com/test/logs/req_lY0XkO3sQsaEIN?t=1743791455",
    "type": "invalid_request_error"
  }
}
Creating onboarding link for [0;32m[INFO][0m Creating test Connect account for DE (eur)
[0;31m[ERROR][0m Failed to create account for DE. Error: {
  "id": "acct_1RAF0p2fLx3eEc9X",
  "object": "account",
  "business_profile": {
    "annual_revenue": null,
    "estimated_worker_count": null,
    "mcc": null,
    "name": null,
    "product_description": null,
    "support_address": null,
    "support_email": null,
    "support_phone": null,
    "support_url": null,
    "url": null
  },
  "business_type": null,
  "capabilities": {
    "card_payments": "inactive",
    "transfers": "inactive"
  },
  "charges_enabled": false,
  "controller": {
    "fees": {
      "payer": "application_express"
    },
    "is_controller": true,
    "losses": {
      "payments": "application"
    },
    "requirement_collection": "stripe",
    "stripe_dashboard": {
      "type": "express"
    },
    "type": "application"
  },
  "country": "DE",
  "created": 1743791444,
  "default_currency": "eur",
  "details_submitted": false,
  "email": "instructor-eu@example.com",
  "external_accounts": {
    "object": "list",
    "data": [],
    "has_more": false,
    "total_count": 0,
    "url": "/v1/accounts/acct_1RAF0p2fLx3eEc9X/external_accounts"
  },
  "future_requirements": {
    "alternatives": [],
    "current_deadline": null,
    "currently_due": [],
    "disabled_reason": null,
    "errors": [],
    "eventually_due": [],
    "past_due": [],
    "pending_verification": []
  },
  "login_links": {
    "object": "list",
    "data": [],
    "has_more": false,
    "total_count": 0,
    "url": "/v1/accounts/acct_1RAF0p2fLx3eEc9X/login_links"
  },
  "metadata": {},
  "payouts_enabled": false,
  "requirements": {
    "alternatives": [],
    "current_deadline": null,
    "currently_due": [
      "business_profile.mcc",
      "business_profile.url",
      "business_type",
      "external_account",
      "representative.address.city",
      "representative.address.line1",
      "representative.address.postal_code",
      "representative.dob.day",
      "representative.dob.month",
      "representative.dob.year",
      "representative.email",
      "representative.first_name",
      "representative.last_name",
      "representative.phone",
      "tos_acceptance.date",
      "tos_acceptance.ip"
    ],
    "disabled_reason": "requirements.past_due",
    "errors": [],
    "eventually_due": [
      "business_profile.mcc",
      "business_profile.url",
      "business_type",
      "external_account",
      "representative.address.city",
      "representative.address.line1",
      "representative.address.postal_code",
      "representative.dob.day",
      "representative.dob.month",
      "representative.dob.year",
      "representative.email",
      "representative.first_name",
      "representative.last_name",
      "representative.phone",
      "tos_acceptance.date",
      "tos_acceptance.ip"
    ],
    "past_due": [
      "business_profile.mcc",
      "business_profile.url",
      "business_type",
      "external_account",
      "representative.address.city",
      "representative.address.line1",
      "representative.address.postal_code",
      "representative.dob.day",
      "representative.dob.month",
      "representative.dob.year",
      "representative.email",
      "representative.first_name",
      "representative.last_name",
      "representative.phone",
      "tos_acceptance.date",
      "tos_acceptance.ip"
    ],
    "pending_verification": []
  },
  "settings": {
    "bacs_debit_payments": {
      "display_name": null,
      "service_user_number": null
    },
    "branding": {
      "icon": null,
      "logo": null,
      "primary_color": null,
      "secondary_color": null
    },
    "card_issuing": {
      "tos_acceptance": {
        "date": null,
        "ip": null
      }
    },
    "card_payments": {
      "decline_on": {
        "avs_failure": false,
        "cvc_failure": false
      },
      "statement_descriptor_prefix": null,
      "statement_descriptor_prefix_kana": null,
      "statement_descriptor_prefix_kanji": null
    },
    "dashboard": {
      "display_name": null,
      "timezone": "Etc/UTC"
    },
    "invoices": {
      "default_account_tax_ids": null,
      "hosted_payment_method_save": "always"
    },
    "payments": {
      "statement_descriptor": null,
      "statement_descriptor_kana": null,
      "statement_descriptor_kanji": null
    },
    "payouts": {
      "debit_negative_balances": true,
      "schedule": {
        "delay_days": 7,
        "interval": "daily"
      },
      "statement_descriptor": null
    },
    "sepa_debit_payments": {}
  },
  "tos_acceptance": {
    "date": null,
    "ip": null,
    "user_agent": null
  },
  "type": "express"
} (EU)
ERROR: Failed to create onboarding link for [0;32m[INFO][0m Creating test Connect account for DE (eur)
[0;31m[ERROR][0m Failed to create account for DE. Error: {
  "id": "acct_1RAF0p2fLx3eEc9X",
  "object": "account",
  "business_profile": {
    "annual_revenue": null,
    "estimated_worker_count": null,
    "mcc": null,
    "name": null,
    "product_description": null,
    "support_address": null,
    "support_email": null,
    "support_phone": null,
    "support_url": null,
    "url": null
  },
  "business_type": null,
  "capabilities": {
    "card_payments": "inactive",
    "transfers": "inactive"
  },
  "charges_enabled": false,
  "controller": {
    "fees": {
      "payer": "application_express"
    },
    "is_controller": true,
    "losses": {
      "payments": "application"
    },
    "requirement_collection": "stripe",
    "stripe_dashboard": {
      "type": "express"
    },
    "type": "application"
  },
  "country": "DE",
  "created": 1743791444,
  "default_currency": "eur",
  "details_submitted": false,
  "email": "instructor-eu@example.com",
  "external_accounts": {
    "object": "list",
    "data": [],
    "has_more": false,
    "total_count": 0,
    "url": "/v1/accounts/acct_1RAF0p2fLx3eEc9X/external_accounts"
  },
  "future_requirements": {
    "alternatives": [],
    "current_deadline": null,
    "currently_due": [],
    "disabled_reason": null,
    "errors": [],
    "eventually_due": [],
    "past_due": [],
    "pending_verification": []
  },
  "login_links": {
    "object": "list",
    "data": [],
    "has_more": false,
    "total_count": 0,
    "url": "/v1/accounts/acct_1RAF0p2fLx3eEc9X/login_links"
  },
  "metadata": {},
  "payouts_enabled": false,
  "requirements": {
    "alternatives": [],
    "current_deadline": null,
    "currently_due": [
      "business_profile.mcc",
      "business_profile.url",
      "business_type",
      "external_account",
      "representative.address.city",
      "representative.address.line1",
      "representative.address.postal_code",
      "representative.dob.day",
      "representative.dob.month",
      "representative.dob.year",
      "representative.email",
      "representative.first_name",
      "representative.last_name",
      "representative.phone",
      "tos_acceptance.date",
      "tos_acceptance.ip"
    ],
    "disabled_reason": "requirements.past_due",
    "errors": [],
    "eventually_due": [
      "business_profile.mcc",
      "business_profile.url",
      "business_type",
      "external_account",
      "representative.address.city",
      "representative.address.line1",
      "representative.address.postal_code",
      "representative.dob.day",
      "representative.dob.month",
      "representative.dob.year",
      "representative.email",
      "representative.first_name",
      "representative.last_name",
      "representative.phone",
      "tos_acceptance.date",
      "tos_acceptance.ip"
    ],
    "past_due": [
      "business_profile.mcc",
      "business_profile.url",
      "business_type",
      "external_account",
      "representative.address.city",
      "representative.address.line1",
      "representative.address.postal_code",
      "representative.dob.day",
      "representative.dob.month",
      "representative.dob.year",
      "representative.email",
      "representative.first_name",
      "representative.last_name",
      "representative.phone",
      "tos_acceptance.date",
      "tos_acceptance.ip"
    ],
    "pending_verification": []
  },
  "settings": {
    "bacs_debit_payments": {
      "display_name": null,
      "service_user_number": null
    },
    "branding": {
      "icon": null,
      "logo": null,
      "primary_color": null,
      "secondary_color": null
    },
    "card_issuing": {
      "tos_acceptance": {
        "date": null,
        "ip": null
      }
    },
    "card_payments": {
      "decline_on": {
        "avs_failure": false,
        "cvc_failure": false
      },
      "statement_descriptor_prefix": null,
      "statement_descriptor_prefix_kana": null,
      "statement_descriptor_prefix_kanji": null
    },
    "dashboard": {
      "display_name": null,
      "timezone": "Etc/UTC"
    },
    "invoices": {
      "default_account_tax_ids": null,
      "hosted_payment_method_save": "always"
    },
    "payments": {
      "statement_descriptor": null,
      "statement_descriptor_kana": null,
      "statement_descriptor_kanji": null
    },
    "payouts": {
      "debit_negative_balances": true,
      "schedule": {
        "delay_days": 7,
        "interval": "daily"
      },
      "statement_descriptor": null
    },
    "sepa_debit_payments": {}
  },
  "tos_acceptance": {
    "date": null,
    "ip": null,
    "user_agent": null
  },
  "type": "express"
}. Error: {
  "error": {
    "code": "resource_missing",
    "doc_url": "https://stripe.com/docs/error-codes/resource-missing",
    "message": "No such account: '\\u001b[0;32m[INFO]\\u001b[0m Creating test Connect account for DE (eur)\\n\\u001b[0;31m[ERROR]\\u001b[0m Failed to create account for DE. Error: {\\n  \\\"id\\\": \\\"acct_1RAF0p2fLx3eEc9X\\\",\\n  \\\"object\\\": \\\"account\\\",\\n  \\\"business_profile\\\": {\\n    \\\"annual_revenue\\\": null,\\n    \\\"estimated_worker_count\\\": null,\\n    \\\"mcc\\\": null,\\n    \\\"name\\\": null,\\n    \\\"product_description\\\": null,\\n    \\\"support_address\\\": null,\\n    \\\"support_email\\\": null,\\n    \\\"support_phone\\\": null,\\n    \\\"support_...(truncated)...tatement_descriptor\\\": null,\\n      \\\"statement_descriptor_kana\\\": null,\\n      \\\"statement_descriptor_kanji\\\": null\\n    },\\n    \\\"payouts\\\": {\\n      \\\"debit_negative_balances\\\": true,\\n      \\\"schedule\\\": {\\n        \\\"delay_days\\\": 7,\\n        \\\"interval\\\": \\\"daily\\\"\\n      },\\n      \\\"statement_descriptor\\\": null\\n    },\\n    \\\"sepa_debit_payments\\\": {}\\n  },\\n  \\\"tos_acceptance\\\": {\\n    \\\"date\\\": null,\\n    \\\"ip\\\": null,\\n    \\\"user_agent\\\": null\\n  },\\n  \\\"type\\\": \\\"express\\\"\\n}'",
    "param": "account",
    "request_log_url": "https://dashboard.stripe.com/test/logs/req_AZIq4kyGf4tode?t=1743791455",
    "type": "invalid_request_error"
  }
}
Creating onboarding link for [0;32m[INFO][0m Creating test Connect account for GB (gbp)
[0;31m[ERROR][0m Failed to create account for GB. Error: {
  "id": "acct_1RAF0sGfxvWHuIpz",
  "object": "account",
  "business_profile": {
    "annual_revenue": null,
    "estimated_worker_count": null,
    "mcc": null,
    "name": null,
    "product_description": null,
    "support_address": null,
    "support_email": null,
    "support_phone": null,
    "support_url": null,
    "url": null
  },
  "business_type": null,
  "capabilities": {
    "card_payments": "inactive",
    "transfers": "inactive"
  },
  "charges_enabled": false,
  "controller": {
    "fees": {
      "payer": "application_express"
    },
    "is_controller": true,
    "losses": {
      "payments": "application"
    },
    "requirement_collection": "stripe",
    "stripe_dashboard": {
      "type": "express"
    },
    "type": "application"
  },
  "country": "GB",
  "created": 1743791447,
  "default_currency": "gbp",
  "details_submitted": false,
  "email": "instructor-uk@example.com",
  "external_accounts": {
    "object": "list",
    "data": [],
    "has_more": false,
    "total_count": 0,
    "url": "/v1/accounts/acct_1RAF0sGfxvWHuIpz/external_accounts"
  },
  "future_requirements": {
    "alternatives": [],
    "current_deadline": null,
    "currently_due": [],
    "disabled_reason": null,
    "errors": [],
    "eventually_due": [],
    "past_due": [],
    "pending_verification": []
  },
  "login_links": {
    "object": "list",
    "data": [],
    "has_more": false,
    "total_count": 0,
    "url": "/v1/accounts/acct_1RAF0sGfxvWHuIpz/login_links"
  },
  "metadata": {},
  "payouts_enabled": false,
  "requirements": {
    "alternatives": [],
    "current_deadline": null,
    "currently_due": [
      "business_profile.mcc",
      "business_profile.url",
      "business_type",
      "external_account",
      "representative.address.city",
      "representative.address.line1",
      "representative.address.postal_code",
      "representative.dob.day",
      "representative.dob.month",
      "representative.dob.year",
      "representative.email",
      "representative.first_name",
      "representative.last_name",
      "representative.phone",
      "tos_acceptance.date",
      "tos_acceptance.ip"
    ],
    "disabled_reason": "requirements.past_due",
    "errors": [],
    "eventually_due": [
      "business_profile.mcc",
      "business_profile.url",
      "business_type",
      "external_account",
      "representative.address.city",
      "representative.address.line1",
      "representative.address.postal_code",
      "representative.dob.day",
      "representative.dob.month",
      "representative.dob.year",
      "representative.email",
      "representative.first_name",
      "representative.last_name",
      "representative.phone",
      "tos_acceptance.date",
      "tos_acceptance.ip"
    ],
    "past_due": [
      "business_profile.mcc",
      "business_profile.url",
      "business_type",
      "external_account",
      "representative.address.city",
      "representative.address.line1",
      "representative.address.postal_code",
      "representative.dob.day",
      "representative.dob.month",
      "representative.dob.year",
      "representative.email",
      "representative.first_name",
      "representative.last_name",
      "representative.phone",
      "tos_acceptance.date",
      "tos_acceptance.ip"
    ],
    "pending_verification": []
  },
  "settings": {
    "bacs_debit_payments": {
      "display_name": null,
      "service_user_number": null
    },
    "branding": {
      "icon": null,
      "logo": null,
      "primary_color": null,
      "secondary_color": null
    },
    "card_issuing": {
      "tos_acceptance": {
        "date": null,
        "ip": null
      }
    },
    "card_payments": {
      "decline_on": {
        "avs_failure": false,
        "cvc_failure": false
      },
      "statement_descriptor_prefix": null,
      "statement_descriptor_prefix_kana": null,
      "statement_descriptor_prefix_kanji": null
    },
    "dashboard": {
      "display_name": null,
      "timezone": "Etc/UTC"
    },
    "invoices": {
      "default_account_tax_ids": null,
      "hosted_payment_method_save": "always"
    },
    "payments": {
      "statement_descriptor": null,
      "statement_descriptor_kana": null,
      "statement_descriptor_kanji": null
    },
    "payouts": {
      "debit_negative_balances": true,
      "schedule": {
        "delay_days": 7,
        "interval": "daily"
      },
      "statement_descriptor": null
    },
    "sepa_debit_payments": {}
  },
  "tos_acceptance": {
    "date": null,
    "ip": null,
    "user_agent": null
  },
  "type": "express"
} (UK)
ERROR: Failed to create onboarding link for [0;32m[INFO][0m Creating test Connect account for GB (gbp)
[0;31m[ERROR][0m Failed to create account for GB. Error: {
  "id": "acct_1RAF0sGfxvWHuIpz",
  "object": "account",
  "business_profile": {
    "annual_revenue": null,
    "estimated_worker_count": null,
    "mcc": null,
    "name": null,
    "product_description": null,
    "support_address": null,
    "support_email": null,
    "support_phone": null,
    "support_url": null,
    "url": null
  },
  "business_type": null,
  "capabilities": {
    "card_payments": "inactive",
    "transfers": "inactive"
  },
  "charges_enabled": false,
  "controller": {
    "fees": {
      "payer": "application_express"
    },
    "is_controller": true,
    "losses": {
      "payments": "application"
    },
    "requirement_collection": "stripe",
    "stripe_dashboard": {
      "type": "express"
    },
    "type": "application"
  },
  "country": "GB",
  "created": 1743791447,
  "default_currency": "gbp",
  "details_submitted": false,
  "email": "instructor-uk@example.com",
  "external_accounts": {
    "object": "list",
    "data": [],
    "has_more": false,
    "total_count": 0,
    "url": "/v1/accounts/acct_1RAF0sGfxvWHuIpz/external_accounts"
  },
  "future_requirements": {
    "alternatives": [],
    "current_deadline": null,
    "currently_due": [],
    "disabled_reason": null,
    "errors": [],
    "eventually_due": [],
    "past_due": [],
    "pending_verification": []
  },
  "login_links": {
    "object": "list",
    "data": [],
    "has_more": false,
    "total_count": 0,
    "url": "/v1/accounts/acct_1RAF0sGfxvWHuIpz/login_links"
  },
  "metadata": {},
  "payouts_enabled": false,
  "requirements": {
    "alternatives": [],
    "current_deadline": null,
    "currently_due": [
      "business_profile.mcc",
      "business_profile.url",
      "business_type",
      "external_account",
      "representative.address.city",
      "representative.address.line1",
      "representative.address.postal_code",
      "representative.dob.day",
      "representative.dob.month",
      "representative.dob.year",
      "representative.email",
      "representative.first_name",
      "representative.last_name",
      "representative.phone",
      "tos_acceptance.date",
      "tos_acceptance.ip"
    ],
    "disabled_reason": "requirements.past_due",
    "errors": [],
    "eventually_due": [
      "business_profile.mcc",
      "business_profile.url",
      "business_type",
      "external_account",
      "representative.address.city",
      "representative.address.line1",
      "representative.address.postal_code",
      "representative.dob.day",
      "representative.dob.month",
      "representative.dob.year",
      "representative.email",
      "representative.first_name",
      "representative.last_name",
      "representative.phone",
      "tos_acceptance.date",
      "tos_acceptance.ip"
    ],
    "past_due": [
      "business_profile.mcc",
      "business_profile.url",
      "business_type",
      "external_account",
      "representative.address.city",
      "representative.address.line1",
      "representative.address.postal_code",
      "representative.dob.day",
      "representative.dob.month",
      "representative.dob.year",
      "representative.email",
      "representative.first_name",
      "representative.last_name",
      "representative.phone",
      "tos_acceptance.date",
      "tos_acceptance.ip"
    ],
    "pending_verification": []
  },
  "settings": {
    "bacs_debit_payments": {
      "display_name": null,
      "service_user_number": null
    },
    "branding": {
      "icon": null,
      "logo": null,
      "primary_color": null,
      "secondary_color": null
    },
    "card_issuing": {
      "tos_acceptance": {
        "date": null,
        "ip": null
      }
    },
    "card_payments": {
      "decline_on": {
        "avs_failure": false,
        "cvc_failure": false
      },
      "statement_descriptor_prefix": null,
      "statement_descriptor_prefix_kana": null,
      "statement_descriptor_prefix_kanji": null
    },
    "dashboard": {
      "display_name": null,
      "timezone": "Etc/UTC"
    },
    "invoices": {
      "default_account_tax_ids": null,
      "hosted_payment_method_save": "always"
    },
    "payments": {
      "statement_descriptor": null,
      "statement_descriptor_kana": null,
      "statement_descriptor_kanji": null
    },
    "payouts": {
      "debit_negative_balances": true,
      "schedule": {
        "delay_days": 7,
        "interval": "daily"
      },
      "statement_descriptor": null
    },
    "sepa_debit_payments": {}
  },
  "tos_acceptance": {
    "date": null,
    "ip": null,
    "user_agent": null
  },
  "type": "express"
}. Error: {
  "error": {
    "code": "resource_missing",
    "doc_url": "https://stripe.com/docs/error-codes/resource-missing",
    "message": "No such account: '\\u001b[0;32m[INFO]\\u001b[0m Creating test Connect account for GB (gbp)\\n\\u001b[0;31m[ERROR]\\u001b[0m Failed to create account for GB. Error: {\\n  \\\"id\\\": \\\"acct_1RAF0sGfxvWHuIpz\\\",\\n  \\\"object\\\": \\\"account\\\",\\n  \\\"business_profile\\\": {\\n    \\\"annual_revenue\\\": null,\\n    \\\"estimated_worker_count\\\": null,\\n    \\\"mcc\\\": null,\\n    \\\"name\\\": null,\\n    \\\"product_description\\\": null,\\n    \\\"support_address\\\": null,\\n    \\\"support_email\\\": null,\\n    \\\"support_phone\\\": null,\\n    \\\"support_...(truncated)...tatement_descriptor\\\": null,\\n      \\\"statement_descriptor_kana\\\": null,\\n      \\\"statement_descriptor_kanji\\\": null\\n    },\\n    \\\"payouts\\\": {\\n      \\\"debit_negative_balances\\\": true,\\n      \\\"schedule\\\": {\\n        \\\"delay_days\\\": 7,\\n        \\\"interval\\\": \\\"daily\\\"\\n      },\\n      \\\"statement_descriptor\\\": null\\n    },\\n    \\\"sepa_debit_payments\\\": {}\\n  },\\n  \\\"tos_acceptance\\\": {\\n    \\\"date\\\": null,\\n    \\\"ip\\\": null,\\n    \\\"user_agent\\\": null\\n  },\\n  \\\"type\\\": \\\"express\\\"\\n}'",
    "param": "account",
    "request_log_url": "https://dashboard.stripe.com/test/logs/req_iSIK6PlqCU71Cp?t=1743791455",
    "type": "invalid_request_error"
  }
}
Creating onboarding link for [0;32m[INFO][0m Creating test Connect account for AU (aud)
[0;31m[ERROR][0m Failed to create account for AU. Error: {
  "id": "acct_1RAF0vGd7YIaHW4I",
  "object": "account",
  "business_profile": {
    "annual_revenue": null,
    "estimated_worker_count": null,
    "mcc": null,
    "name": null,
    "product_description": null,
    "support_address": null,
    "support_email": null,
    "support_phone": null,
    "support_url": null,
    "url": null
  },
  "business_type": null,
  "capabilities": {
    "card_payments": "inactive",
    "transfers": "inactive"
  },
  "charges_enabled": false,
  "controller": {
    "fees": {
      "payer": "application_express"
    },
    "is_controller": true,
    "losses": {
      "payments": "application"
    },
    "requirement_collection": "stripe",
    "stripe_dashboard": {
      "type": "express"
    },
    "type": "application"
  },
  "country": "AU",
  "created": 1743791450,
  "default_currency": "aud",
  "details_submitted": false,
  "email": "instructor-au@example.com",
  "external_accounts": {
    "object": "list",
    "data": [],
    "has_more": false,
    "total_count": 0,
    "url": "/v1/accounts/acct_1RAF0vGd7YIaHW4I/external_accounts"
  },
  "future_requirements": {
    "alternatives": [],
    "current_deadline": null,
    "currently_due": [],
    "disabled_reason": null,
    "errors": [],
    "eventually_due": [],
    "past_due": [],
    "pending_verification": []
  },
  "login_links": {
    "object": "list",
    "data": [],
    "has_more": false,
    "total_count": 0,
    "url": "/v1/accounts/acct_1RAF0vGd7YIaHW4I/login_links"
  },
  "metadata": {},
  "payouts_enabled": false,
  "requirements": {
    "alternatives": [],
    "current_deadline": null,
    "currently_due": [
      "business_profile.mcc",
      "business_profile.url",
      "business_type",
      "external_account",
      "representative.address.city",
      "representative.address.line1",
      "representative.address.postal_code",
      "representative.address.state",
      "representative.dob.day",
      "representative.dob.month",
      "representative.dob.year",
      "representative.email",
      "representative.first_name",
      "representative.last_name",
      "representative.phone",
      "tos_acceptance.date",
      "tos_acceptance.ip"
    ],
    "disabled_reason": "requirements.past_due",
    "errors": [],
    "eventually_due": [
      "business_profile.mcc",
      "business_profile.url",
      "business_type",
      "external_account",
      "representative.address.city",
      "representative.address.line1",
      "representative.address.postal_code",
      "representative.address.state",
      "representative.dob.day",
      "representative.dob.month",
      "representative.dob.year",
      "representative.email",
      "representative.first_name",
      "representative.last_name",
      "representative.phone",
      "tos_acceptance.date",
      "tos_acceptance.ip"
    ],
    "past_due": [
      "business_profile.mcc",
      "business_profile.url",
      "business_type",
      "external_account",
      "representative.address.city",
      "representative.address.line1",
      "representative.address.postal_code",
      "representative.address.state",
      "representative.dob.day",
      "representative.dob.month",
      "representative.dob.year",
      "representative.email",
      "representative.first_name",
      "representative.last_name",
      "representative.phone",
      "tos_acceptance.date",
      "tos_acceptance.ip"
    ],
    "pending_verification": []
  },
  "settings": {
    "bacs_debit_payments": {
      "display_name": null,
      "service_user_number": null
    },
    "branding": {
      "icon": null,
      "logo": null,
      "primary_color": null,
      "secondary_color": null
    },
    "card_issuing": {
      "tos_acceptance": {
        "date": null,
        "ip": null
      }
    },
    "card_payments": {
      "decline_on": {
        "avs_failure": false,
        "cvc_failure": false
      },
      "statement_descriptor_prefix": null,
      "statement_descriptor_prefix_kana": null,
      "statement_descriptor_prefix_kanji": null
    },
    "dashboard": {
      "display_name": null,
      "timezone": "Etc/UTC"
    },
    "invoices": {
      "default_account_tax_ids": null,
      "hosted_payment_method_save": "always"
    },
    "payments": {
      "statement_descriptor": null,
      "statement_descriptor_kana": null,
      "statement_descriptor_kanji": null
    },
    "payouts": {
      "debit_negative_balances": true,
      "schedule": {
        "delay_days": 2,
        "interval": "daily"
      },
      "statement_descriptor": null
    },
    "sepa_debit_payments": {}
  },
  "tos_acceptance": {
    "date": null,
    "ip": null,
    "user_agent": null
  },
  "type": "express"
} (AU)
ERROR: Failed to create onboarding link for [0;32m[INFO][0m Creating test Connect account for AU (aud)
[0;31m[ERROR][0m Failed to create account for AU. Error: {
  "id": "acct_1RAF0vGd7YIaHW4I",
  "object": "account",
  "business_profile": {
    "annual_revenue": null,
    "estimated_worker_count": null,
    "mcc": null,
    "name": null,
    "product_description": null,
    "support_address": null,
    "support_email": null,
    "support_phone": null,
    "support_url": null,
    "url": null
  },
  "business_type": null,
  "capabilities": {
    "card_payments": "inactive",
    "transfers": "inactive"
  },
  "charges_enabled": false,
  "controller": {
    "fees": {
      "payer": "application_express"
    },
    "is_controller": true,
    "losses": {
      "payments": "application"
    },
    "requirement_collection": "stripe",
    "stripe_dashboard": {
      "type": "express"
    },
    "type": "application"
  },
  "country": "AU",
  "created": 1743791450,
  "default_currency": "aud",
  "details_submitted": false,
  "email": "instructor-au@example.com",
  "external_accounts": {
    "object": "list",
    "data": [],
    "has_more": false,
    "total_count": 0,
    "url": "/v1/accounts/acct_1RAF0vGd7YIaHW4I/external_accounts"
  },
  "future_requirements": {
    "alternatives": [],
    "current_deadline": null,
    "currently_due": [],
    "disabled_reason": null,
    "errors": [],
    "eventually_due": [],
    "past_due": [],
    "pending_verification": []
  },
  "login_links": {
    "object": "list",
    "data": [],
    "has_more": false,
    "total_count": 0,
    "url": "/v1/accounts/acct_1RAF0vGd7YIaHW4I/login_links"
  },
  "metadata": {},
  "payouts_enabled": false,
  "requirements": {
    "alternatives": [],
    "current_deadline": null,
    "currently_due": [
      "business_profile.mcc",
      "business_profile.url",
      "business_type",
      "external_account",
      "representative.address.city",
      "representative.address.line1",
      "representative.address.postal_code",
      "representative.address.state",
      "representative.dob.day",
      "representative.dob.month",
      "representative.dob.year",
      "representative.email",
      "representative.first_name",
      "representative.last_name",
      "representative.phone",
      "tos_acceptance.date",
      "tos_acceptance.ip"
    ],
    "disabled_reason": "requirements.past_due",
    "errors": [],
    "eventually_due": [
      "business_profile.mcc",
      "business_profile.url",
      "business_type",
      "external_account",
      "representative.address.city",
      "representative.address.line1",
      "representative.address.postal_code",
      "representative.address.state",
      "representative.dob.day",
      "representative.dob.month",
      "representative.dob.year",
      "representative.email",
      "representative.first_name",
      "representative.last_name",
      "representative.phone",
      "tos_acceptance.date",
      "tos_acceptance.ip"
    ],
    "past_due": [
      "business_profile.mcc",
      "business_profile.url",
      "business_type",
      "external_account",
      "representative.address.city",
      "representative.address.line1",
      "representative.address.postal_code",
      "representative.address.state",
      "representative.dob.day",
      "representative.dob.month",
      "representative.dob.year",
      "representative.email",
      "representative.first_name",
      "representative.last_name",
      "representative.phone",
      "tos_acceptance.date",
      "tos_acceptance.ip"
    ],
    "pending_verification": []
  },
  "settings": {
    "bacs_debit_payments": {
      "display_name": null,
      "service_user_number": null
    },
    "branding": {
      "icon": null,
      "logo": null,
      "primary_color": null,
      "secondary_color": null
    },
    "card_issuing": {
      "tos_acceptance": {
        "date": null,
        "ip": null
      }
    },
    "card_payments": {
      "decline_on": {
        "avs_failure": false,
        "cvc_failure": false
      },
      "statement_descriptor_prefix": null,
      "statement_descriptor_prefix_kana": null,
      "statement_descriptor_prefix_kanji": null
    },
    "dashboard": {
      "display_name": null,
      "timezone": "Etc/UTC"
    },
    "invoices": {
      "default_account_tax_ids": null,
      "hosted_payment_method_save": "always"
    },
    "payments": {
      "statement_descriptor": null,
      "statement_descriptor_kana": null,
      "statement_descriptor_kanji": null
    },
    "payouts": {
      "debit_negative_balances": true,
      "schedule": {
        "delay_days": 2,
        "interval": "daily"
      },
      "statement_descriptor": null
    },
    "sepa_debit_payments": {}
  },
  "tos_acceptance": {
    "date": null,
    "ip": null,
    "user_agent": null
  },
  "type": "express"
}. Error: {
  "error": {
    "code": "resource_missing",
    "doc_url": "https://stripe.com/docs/error-codes/resource-missing",
    "message": "No such account: '\\u001b[0;32m[INFO]\\u001b[0m Creating test Connect account for AU (aud)\\n\\u001b[0;31m[ERROR]\\u001b[0m Failed to create account for AU. Error: {\\n  \\\"id\\\": \\\"acct_1RAF0vGd7YIaHW4I\\\",\\n  \\\"object\\\": \\\"account\\\",\\n  \\\"business_profile\\\": {\\n    \\\"annual_revenue\\\": null,\\n    \\\"estimated_worker_count\\\": null,\\n    \\\"mcc\\\": null,\\n    \\\"name\\\": null,\\n    \\\"product_description\\\": null,\\n    \\\"support_address\\\": null,\\n    \\\"support_email\\\": null,\\n    \\\"support_phone\\\": null,\\n    \\\"support_...(truncated)...tatement_descriptor\\\": null,\\n      \\\"statement_descriptor_kana\\\": null,\\n      \\\"statement_descriptor_kanji\\\": null\\n    },\\n    \\\"payouts\\\": {\\n      \\\"debit_negative_balances\\\": true,\\n      \\\"schedule\\\": {\\n        \\\"delay_days\\\": 2,\\n        \\\"interval\\\": \\\"daily\\\"\\n      },\\n      \\\"statement_descriptor\\\": null\\n    },\\n    \\\"sepa_debit_payments\\\": {}\\n  },\\n  \\\"tos_acceptance\\\": {\\n    \\\"date\\\": null,\\n    \\\"ip\\\": null,\\n    \\\"user_agent\\\": null\\n  },\\n  \\\"type\\\": \\\"express\\\"\\n}'",
    "param": "account",
    "request_log_url": "https://dashboard.stripe.com/test/logs/req_vaF9NvyzHClcuO?t=1743791456",
    "type": "invalid_request_error"
  }
}
Creating onboarding link for [0;32m[INFO][0m Creating test Connect account for JP (jpy)
[0;31m[ERROR][0m Failed to create account for JP. Error: {
  "id": "acct_1RAF0yGaaAwfGhzA",
  "object": "account",
  "business_profile": {
    "annual_revenue": null,
    "estimated_worker_count": null,
    "mcc": null,
    "name": null,
    "product_description": null,
    "support_address": null,
    "support_email": null,
    "support_phone": null,
    "support_url": null,
    "url": null
  },
  "business_type": null,
  "capabilities": {
    "card_payments": "inactive",
    "transfers": "inactive"
  },
  "charges_enabled": false,
  "controller": {
    "fees": {
      "payer": "application_express"
    },
    "is_controller": true,
    "losses": {
      "payments": "application"
    },
    "requirement_collection": "stripe",
    "stripe_dashboard": {
      "type": "express"
    },
    "type": "application"
  },
  "country": "JP",
  "created": 1743791453,
  "default_currency": "jpy",
  "details_submitted": false,
  "email": "instructor-jp@example.com",
  "external_accounts": {
    "object": "list",
    "data": [],
    "has_more": false,
    "total_count": 0,
    "url": "/v1/accounts/acct_1RAF0yGaaAwfGhzA/external_accounts"
  },
  "future_requirements": {
    "alternatives": [],
    "current_deadline": null,
    "currently_due": [],
    "disabled_reason": null,
    "errors": [],
    "eventually_due": [],
    "past_due": [],
    "pending_verification": []
  },
  "login_links": {
    "object": "list",
    "data": [],
    "has_more": false,
    "total_count": 0,
    "url": "/v1/accounts/acct_1RAF0yGaaAwfGhzA/login_links"
  },
  "metadata": {},
  "payouts_enabled": false,
  "requirements": {
    "alternatives": [],
    "current_deadline": null,
    "currently_due": [
      "business_profile.mcc",
      "business_profile.product_description",
      "business_profile.url",
      "business_type",
      "external_account",
      "representative.address_kana.city",
      "representative.address_kana.line1",
      "representative.address_kana.postal_code",
      "representative.address_kana.state",
      "representative.address_kana.town",
      "representative.address_kanji.city",
      "representative.address_kanji.line1",
      "representative.address_kanji.postal_code",
      "representative.address_kanji.state",
      "representative.address_kanji.town",
      "representative.dob.day",
      "representative.dob.month",
      "representative.dob.year",
      "representative.email",
      "representative.first_name_kana",
      "representative.first_name_kanji",
      "representative.last_name_kana",
      "representative.last_name_kanji",
      "representative.phone",
      "tos_acceptance.date",
      "tos_acceptance.ip"
    ],
    "disabled_reason": "requirements.past_due",
    "errors": [],
    "eventually_due": [
      "business_profile.mcc",
      "business_profile.product_description",
      "business_profile.url",
      "business_type",
      "external_account",
      "representative.address_kana.city",
      "representative.address_kana.line1",
      "representative.address_kana.postal_code",
      "representative.address_kana.state",
      "representative.address_kana.town",
      "representative.address_kanji.city",
      "representative.address_kanji.line1",
      "representative.address_kanji.postal_code",
      "representative.address_kanji.state",
      "representative.address_kanji.town",
      "representative.dob.day",
      "representative.dob.month",
      "representative.dob.year",
      "representative.email",
      "representative.first_name_kana",
      "representative.first_name_kanji",
      "representative.last_name_kana",
      "representative.last_name_kanji",
      "representative.phone",
      "tos_acceptance.date",
      "tos_acceptance.ip"
    ],
    "past_due": [
      "business_profile.mcc",
      "business_profile.product_description",
      "business_profile.url",
      "business_type",
      "external_account",
      "representative.address_kana.city",
      "representative.address_kana.line1",
      "representative.address_kana.postal_code",
      "representative.address_kana.state",
      "representative.address_kana.town",
      "representative.address_kanji.city",
      "representative.address_kanji.line1",
      "representative.address_kanji.postal_code",
      "representative.address_kanji.state",
      "representative.address_kanji.town",
      "representative.dob.day",
      "representative.dob.month",
      "representative.dob.year",
      "representative.email",
      "representative.first_name_kana",
      "representative.first_name_kanji",
      "representative.last_name_kana",
      "representative.last_name_kanji",
      "representative.phone",
      "tos_acceptance.date",
      "tos_acceptance.ip"
    ],
    "pending_verification": []
  },
  "settings": {
    "bacs_debit_payments": {
      "display_name": null,
      "service_user_number": null
    },
    "branding": {
      "icon": null,
      "logo": null,
      "primary_color": null,
      "secondary_color": null
    },
    "card_issuing": {
      "tos_acceptance": {
        "date": null,
        "ip": null
      }
    },
    "card_payments": {
      "decline_on": {
        "avs_failure": false,
        "cvc_failure": false
      },
      "statement_descriptor_prefix": null,
      "statement_descriptor_prefix_kana": null,
      "statement_descriptor_prefix_kanji": null
    },
    "dashboard": {
      "display_name": null,
      "timezone": "Etc/UTC"
    },
    "invoices": {
      "default_account_tax_ids": null,
      "hosted_payment_method_save": "always"
    },
    "payments": {
      "statement_descriptor": "",
      "statement_descriptor_kana": null,
      "statement_descriptor_kanji": null
    },
    "payouts": {
      "debit_negative_balances": true,
      "schedule": {
        "delay_days": 4,
        "interval": "weekly",
        "weekly_anchor": "friday"
      },
      "statement_descriptor": null
    },
    "sepa_debit_payments": {}
  },
  "tos_acceptance": {
    "date": null,
    "ip": null,
    "user_agent": null
  },
  "type": "express"
} (JP)
ERROR: Failed to create onboarding link for [0;32m[INFO][0m Creating test Connect account for JP (jpy)
[0;31m[ERROR][0m Failed to create account for JP. Error: {
  "id": "acct_1RAF0yGaaAwfGhzA",
  "object": "account",
  "business_profile": {
    "annual_revenue": null,
    "estimated_worker_count": null,
    "mcc": null,
    "name": null,
    "product_description": null,
    "support_address": null,
    "support_email": null,
    "support_phone": null,
    "support_url": null,
    "url": null
  },
  "business_type": null,
  "capabilities": {
    "card_payments": "inactive",
    "transfers": "inactive"
  },
  "charges_enabled": false,
  "controller": {
    "fees": {
      "payer": "application_express"
    },
    "is_controller": true,
    "losses": {
      "payments": "application"
    },
    "requirement_collection": "stripe",
    "stripe_dashboard": {
      "type": "express"
    },
    "type": "application"
  },
  "country": "JP",
  "created": 1743791453,
  "default_currency": "jpy",
  "details_submitted": false,
  "email": "instructor-jp@example.com",
  "external_accounts": {
    "object": "list",
    "data": [],
    "has_more": false,
    "total_count": 0,
    "url": "/v1/accounts/acct_1RAF0yGaaAwfGhzA/external_accounts"
  },
  "future_requirements": {
    "alternatives": [],
    "current_deadline": null,
    "currently_due": [],
    "disabled_reason": null,
    "errors": [],
    "eventually_due": [],
    "past_due": [],
    "pending_verification": []
  },
  "login_links": {
    "object": "list",
    "data": [],
    "has_more": false,
    "total_count": 0,
    "url": "/v1/accounts/acct_1RAF0yGaaAwfGhzA/login_links"
  },
  "metadata": {},
  "payouts_enabled": false,
  "requirements": {
    "alternatives": [],
    "current_deadline": null,
    "currently_due": [
      "business_profile.mcc",
      "business_profile.product_description",
      "business_profile.url",
      "business_type",
      "external_account",
      "representative.address_kana.city",
      "representative.address_kana.line1",
      "representative.address_kana.postal_code",
      "representative.address_kana.state",
      "representative.address_kana.town",
      "representative.address_kanji.city",
      "representative.address_kanji.line1",
      "representative.address_kanji.postal_code",
      "representative.address_kanji.state",
      "representative.address_kanji.town",
      "representative.dob.day",
      "representative.dob.month",
      "representative.dob.year",
      "representative.email",
      "representative.first_name_kana",
      "representative.first_name_kanji",
      "representative.last_name_kana",
      "representative.last_name_kanji",
      "representative.phone",
      "tos_acceptance.date",
      "tos_acceptance.ip"
    ],
    "disabled_reason": "requirements.past_due",
    "errors": [],
    "eventually_due": [
      "business_profile.mcc",
      "business_profile.product_description",
      "business_profile.url",
      "business_type",
      "external_account",
      "representative.address_kana.city",
      "representative.address_kana.line1",
      "representative.address_kana.postal_code",
      "representative.address_kana.state",
      "representative.address_kana.town",
      "representative.address_kanji.city",
      "representative.address_kanji.line1",
      "representative.address_kanji.postal_code",
      "representative.address_kanji.state",
      "representative.address_kanji.town",
      "representative.dob.day",
      "representative.dob.month",
      "representative.dob.year",
      "representative.email",
      "representative.first_name_kana",
      "representative.first_name_kanji",
      "representative.last_name_kana",
      "representative.last_name_kanji",
      "representative.phone",
      "tos_acceptance.date",
      "tos_acceptance.ip"
    ],
    "past_due": [
      "business_profile.mcc",
      "business_profile.product_description",
      "business_profile.url",
      "business_type",
      "external_account",
      "representative.address_kana.city",
      "representative.address_kana.line1",
      "representative.address_kana.postal_code",
      "representative.address_kana.state",
      "representative.address_kana.town",
      "representative.address_kanji.city",
      "representative.address_kanji.line1",
      "representative.address_kanji.postal_code",
      "representative.address_kanji.state",
      "representative.address_kanji.town",
      "representative.dob.day",
      "representative.dob.month",
      "representative.dob.year",
      "representative.email",
      "representative.first_name_kana",
      "representative.first_name_kanji",
      "representative.last_name_kana",
      "representative.last_name_kanji",
      "representative.phone",
      "tos_acceptance.date",
      "tos_acceptance.ip"
    ],
    "pending_verification": []
  },
  "settings": {
    "bacs_debit_payments": {
      "display_name": null,
      "service_user_number": null
    },
    "branding": {
      "icon": null,
      "logo": null,
      "primary_color": null,
      "secondary_color": null
    },
    "card_issuing": {
      "tos_acceptance": {
        "date": null,
        "ip": null
      }
    },
    "card_payments": {
      "decline_on": {
        "avs_failure": false,
        "cvc_failure": false
      },
      "statement_descriptor_prefix": null,
      "statement_descriptor_prefix_kana": null,
      "statement_descriptor_prefix_kanji": null
    },
    "dashboard": {
      "display_name": null,
      "timezone": "Etc/UTC"
    },
    "invoices": {
      "default_account_tax_ids": null,
      "hosted_payment_method_save": "always"
    },
    "payments": {
      "statement_descriptor": "",
      "statement_descriptor_kana": null,
      "statement_descriptor_kanji": null
    },
    "payouts": {
      "debit_negative_balances": true,
      "schedule": {
        "delay_days": 4,
        "interval": "weekly",
        "weekly_anchor": "friday"
      },
      "statement_descriptor": null
    },
    "sepa_debit_payments": {}
  },
  "tos_acceptance": {
    "date": null,
    "ip": null,
    "user_agent": null
  },
  "type": "express"
}. Error: {
  "error": {
    "message": "Invalid string: \u001b[0;32m[IN...express\"\n}; must be at most 5000 characters",
    "param": "account",
    "request_log_url": "https://dashboard.stripe.com/test/logs/req_HdfbQaSnqS1lEY?t=1743791456",
    "type": "invalid_request_error"
  }
}
