# Step-by-Step Guide: Getting API Keys

This guide walks you through obtaining all API credentials needed for FinXpert integrations.

---

## 1. Setu API (Insurance Data)

**What it's for:** Fetching insurance policy data

**Steps:**
1. Visit https://sandbox.api-setu.in/ (or production portal)
2. Sign up for an account or log in
3. Navigate to **API Keys** or **Credentials** section
4. Create a new API key pair:
   - **API Key** → Copy this to `SETU_API_KEY`
   - **API Secret** → Copy this to `SETU_API_SECRET`
5. Note the base URL (usually `https://api-setu.in` or `https://sandbox.api-setu.in`)

**Add to `.env.local`:**
```
SETU_API_KEY="your-setu-api-key-here"
SETU_API_SECRET="your-setu-api-secret-here"
```

---

## 2. ICICI Prudential API (Insurance)

**What it's for:** Fetching ICICI Prudential insurance policies

**Steps:**
1. Visit ICICI Prudential's developer/partner portal
   - Contact their business development team for API access
   - Or visit: https://www.iciciprulife.com/ (look for "Partner" or "API" section)
2. Complete partner onboarding:
   - Sign partnership agreement
   - Submit business documents
   - Get approved for API access
3. Once approved, you'll receive:
   - **Client ID** → `ICICI_PRU_API_KEY`
   - **Client Secret** → `ICICI_PRU_API_SECRET`
   - OAuth endpoint URL
   - API documentation

**Add to `.env.local`:**
```
ICICI_PRU_API_KEY="your-icici-client-id"
ICICI_PRU_API_SECRET="your-icici-client-secret"
```

**Note:** This requires business partnership - may take 2-4 weeks for approval.

---

## 3. Twilio (SMS)

**What it's for:** Sending SMS messages

**Steps:**
1. Go to https://www.twilio.com/
2. Click **Sign Up** (free trial available)
3. Verify your phone number
4. After login, go to **Console Dashboard**
5. Find your **Account SID** (starts with `AC...`)
6. Find your **Auth Token** (click "show" to reveal)
7. Get a phone number:
   - Go to **Phone Numbers** → **Buy a Number**
   - Choose country (India: +91)
   - Purchase a number (free trial includes credits)

**Add to `.env.local`:**
```
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN="your-auth-token-here"
TWILIO_PHONE_NUMBER="+1234567890"  # Your purchased Twilio number
```

**Cost:** ~$0.0075 per SMS in India (pay-as-you-go)

---

## 4. SendGrid (Email)

**What it's for:** Sending transactional emails

**Steps:**
1. Go to https://sendgrid.com/
2. Click **Start for Free** (free tier: 100 emails/day)
3. Sign up and verify your email
4. After login, go to **Settings** → **API Keys**
5. Click **Create API Key**
6. Name it (e.g., "FinXpert Production")
7. Choose **Full Access** or **Restricted Access** (with Mail Send permission)
8. Copy the API key (shown only once - save it!)

**Add to `.env.local`:**
```
SENDGRID_API_KEY="SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
SENDGRID_FROM_EMAIL="noreply@yourdomain.com"  # Optional: your verified sender email
```

**Note:** Verify your sender email/domain in SendGrid dashboard for better deliverability.

---

## 5. WhatsApp Business API

**What it's for:** Sending WhatsApp messages

**Steps:**
1. Go to https://business.facebook.com/
2. Create a Meta Business account (if you don't have one)
3. Go to **WhatsApp** → **API Setup**
4. Choose **Cloud API** (recommended) or **On-Premises API**
5. Create a Meta App:
   - Go to https://developers.facebook.com/
   - Click **My Apps** → **Create App**
   - Choose **Business** type
   - Add **WhatsApp** product
6. Get credentials:
   - **Access Token** → `WHATSAPP_BUSINESS_API_KEY`
   - **Phone Number ID** → `WHATSAPP_BUSINESS_PHONE_ID`
   - Found in **WhatsApp** → **API Setup** → **Getting Started**

**Add to `.env.local`:**
```
WHATSAPP_BUSINESS_API_KEY="your-meta-access-token"
WHATSAPP_BUSINESS_PHONE_ID="your-phone-number-id"
```

**Important:** 
- You need a verified business account
- WhatsApp templates must be approved by Meta before sending
- Free tier: 1,000 conversations/month

---

## 6. BSE Star API (Mutual Fund Transactions)

**What it's for:** Executing mutual fund transactions

**Steps:**
1. Visit https://www.bseindia.com/
2. Look for **BSE Star MF** section or contact BSE directly
3. Register as a distributor/advisor:
   - Submit ARN (AMFI Registration Number)
   - Complete KYC and compliance requirements
   - Sign distributor agreement
4. After approval, you'll receive:
   - **API Key** → `BSE_STAR_API_KEY`
   - API documentation
   - Test/sandbox credentials

**Add to `.env.local`:**
```
BSE_STAR_API_KEY="your-bse-star-api-key"
```

**Note:** Requires valid ARN and distributor registration. Contact BSE at: bseindia.com/contact

---

## 7. NSE NMFII API (Alternative MF Platform)

**What it's for:** Alternative mutual fund transaction platform

**Steps:**
1. Visit https://www.nseindia.com/
2. Navigate to **NMFII** (NSE Mutual Fund Investment Interface)
3. Register as distributor:
   - Submit ARN and compliance documents
   - Complete onboarding process
4. Get API credentials after approval

**Add to `.env.local`:**
```
NSE_NMFII_API_KEY="your-nse-nmfii-api-key"
```

**Note:** Similar to BSE Star - requires distributor registration.

---

## 8. Loan Partner API

**What it's for:** Processing loan transactions (disbursement, repayment)

**Steps:**
1. Identify your loan partner (e.g., banks, NBFCs, loan aggregators)
2. Contact their business development team:
   - Examples: HDFC, ICICI Bank, Bajaj Finserv, Paisabazaar
   - Request API access for loan processing
3. Complete partnership agreement:
   - Submit business license
   - Complete KYC
   - Sign API access agreement
4. Receive API credentials after approval

**Add to `.env.local`:**
```
LOAN_PARTNER_API_KEY="your-loan-partner-api-key"
```

**Note:** Each partner has different requirements. Start with one major partner.

---

## Quick Setup Checklist

- [ ] Setu API: Sign up at sandbox.api-setu.in
- [ ] ICICI Prudential: Contact partner team (takes time)
- [ ] Twilio: Sign up at twilio.com (5 minutes)
- [ ] SendGrid: Sign up at sendgrid.com (5 minutes)
- [ ] WhatsApp: Create Meta Business account (30 minutes)
- [ ] BSE Star: Register as distributor (2-4 weeks)
- [ ] NSE NMFII: Register as distributor (2-4 weeks)
- [ ] Loan Partner: Contact partner (varies)

---

## Priority Order (Start Here)

**For immediate testing:**
1. **Twilio** (SMS) - Easiest, 5 minutes
2. **SendGrid** (Email) - Easy, 5 minutes
3. **Setu** (Insurance) - Medium, 1-2 days

**For production (plan ahead):**
4. **WhatsApp** - Medium, 1-2 weeks (template approval)
5. **BSE Star / NSE NMFII** - Long, 2-4 weeks (distributor registration)
6. **ICICI Prudential** - Long, 2-4 weeks (partnership)
7. **Loan Partner** - Varies by partner

---

## Testing Without APIs

All adapters work with **mock data** if API keys are missing:
- App continues to function
- Shows warnings in console
- Uses Supabase data or fallback mocks

You can develop and test the UI without any API keys!

---

## Security Best Practices

1. **Never commit `.env.local`** to git (already in `.gitignore`)
2. **Use different keys** for dev/staging/production
3. **Rotate keys** every 90 days
4. **Monitor usage** in each provider's dashboard
5. **Set up alerts** for unusual activity

---

## Need Help?

- Check `API_INTEGRATION.md` for usage examples
- Each provider has documentation in their developer portal
- Contact provider support for partnership questions

