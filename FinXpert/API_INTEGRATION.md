# API Integration Guide

This document explains how to configure and use all external API integrations in FinXpert.

## Table of Contents

1. [Insurance & AIF Adapters](#insurance--aif-adapters)
2. [Messaging Workflows](#messaging-workflows)
3. [Transaction APIs](#transaction-apis)

---

## Insurance & AIF Adapters

### Setu API Integration

**Setup:**
1. Get API credentials from https://sandbox.api-setu.in/
2. Add to `.env.local`:
   ```
   SETU_API_KEY="your-setu-api-key"
   SETU_API_SECRET="your-setu-api-secret"
   ```

**How it works:**
- Adapter automatically fetches OAuth token
- Calls Setu insurance policies endpoint
- Normalizes data to `ProductSnapshot` format
- Falls back to Supabase or mock data if API unavailable

**Endpoints used:**
- OAuth: `https://api-setu.in/oauth/token`
- Policies: `https://api-setu.in/v1/insurance/policies` (replace with actual endpoint)

### ICICI Prudential API Integration

**Setup:**
1. Get API credentials from ICICI Prudential developer portal
2. Add to `.env.local`:
   ```
   ICICI_PRU_API_KEY="your-icici-api-key"
   ICICI_PRU_API_SECRET="your-icici-api-secret"
   ```

**How it works:**
- Uses OAuth Proxy v1 for authentication
- Fetches policy details from ICICI Pru API
- Normalizes to standard format

**Endpoints used:**
- OAuth: `https://api.iciciprudential.com/oauth/token`
- Policies: `https://api.iciciprudential.com/v1/policies` (replace with actual endpoint)

### AIF Adapter

**Setup:**
- No external API required initially
- Reads from Supabase `product_positions` table
- Filters by product codes containing "AIF" or metadata with category="AIF"

---

## Messaging Workflows

### WhatsApp Business API

**Setup:**
1. Create WhatsApp Business account
2. Get API credentials from Meta Business Suite
3. Add to `.env.local`:
   ```
   WHATSAPP_BUSINESS_API_KEY="your-whatsapp-api-key"
   WHATSAPP_BUSINESS_PHONE_ID="your-phone-id"
   ```

**Usage:**
```typescript
import { sendWhatsAppMessage } from "@/lib/messaging/whatsapp";

const result = await sendWhatsAppMessage({
  to: "+919876543210",
  message: "Hello from FinXpert!",
  templateId: "approved_template_id" // Optional
});
```

**API Endpoint:**
- `POST /api/campaigns/send` - Send campaign to multiple clients

### SMS via Twilio

**Setup:**
1. Create Twilio account at https://www.twilio.com/
2. Get Account SID, Auth Token, and Phone Number
3. Add to `.env.local`:
   ```
   TWILIO_ACCOUNT_SID="your-account-sid"
   TWILIO_AUTH_TOKEN="your-auth-token"
   TWILIO_PHONE_NUMBER="+1234567890"
   ```

**Usage:**
```typescript
import { sendSMS } from "@/lib/messaging/sms";

const result = await sendSMS({
  to: "+919876543210",
  message: "Your SIP payment is due."
});
```

### Email via SendGrid

**Setup:**
1. Create SendGrid account at https://sendgrid.com/
2. Generate API key
3. Add to `.env.local`:
   ```
   SENDGRID_API_KEY="your-sendgrid-api-key"
   SENDGRID_FROM_EMAIL="noreply@finxpert.com" # Optional
   ```

**Usage:**
```typescript
import { sendEmail } from "@/lib/messaging/email";

const result = await sendEmail({
  to: "client@example.com",
  toName: "Client Name",
  subject: "Portfolio Update",
  html: "<p>Your portfolio has been updated.</p>",
  text: "Your portfolio has been updated."
});
```

### Campaign API

**Endpoint:** `POST /api/campaigns/send`

**Request:**
```json
{
  "templateId": "uuid-of-campaign-template",
  "clientIds": ["CLT-001", "CLT-002"],
  "channel": "WhatsApp" // or "SMS" or "Email"
}
```

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "clientId": "CLT-001",
      "success": true,
      "messageId": "msg_123"
    }
  ],
  "sent": 2,
  "failed": 0
}
```

---

## Transaction APIs

### Mutual Fund Transactions

**Endpoint:** `POST /api/transactions/mutual-fund`

**Setup:**
1. Get BSE Star API credentials
2. Add to `.env.local`:
   ```
   BSE_STAR_API_KEY="your-bse-star-api-key"
   ```

**Request:**
```json
{
  "clientId": "CLT-001",
  "productCode": "MF-BAL-01",
  "transactionType": "PURCHASE", // or "REDEMPTION" or "SWITCH"
  "amount": 10000,
  "folioNumber": "FOLIO123" // Optional
}
```

**Response:**
```json
{
  "success": true,
  "transactionId": "TXN_123456",
  "status": "COMPLETED"
}
```

### Loan Transactions

**Endpoint:** `POST /api/transactions/loan`

**Setup:**
1. Get loan partner API credentials
2. Add to `.env.local`:
   ```
   LOAN_PARTNER_API_KEY="your-loan-partner-api-key"
   ```

**Request:**
```json
{
  "clientId": "CLT-001",
  "loanProductCode": "LOAN-HL-01",
  "transactionType": "DISBURSEMENT", // or "REPAYMENT" or "PREPAYMENT"
  "amount": 500000
}
```

**Response:**
```json
{
  "success": true,
  "transactionId": "LOAN_TXN_123",
  "status": "COMPLETED"
}
```

---

## Database Setup

Run these SQL scripts in Supabase:

1. `supabase/schema_transactions.sql` - Creates `transactions` and `campaign_sends` tables

---

## Testing

All adapters and APIs have fallback mechanisms:
- If API credentials are missing, they log warnings and use mock/Supabase data
- Transactions are logged in Supabase for audit trail
- Campaign sends are tracked in `campaign_sends` table

---

## Security Notes

- Never commit `.env.local` to git
- Rotate API keys regularly
- Use environment-specific keys (dev/staging/prod)
- Monitor API usage and set up alerts for failures
- Implement rate limiting for production use

