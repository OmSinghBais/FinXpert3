# Supabase Auth Setup Guide

Step-by-step instructions to set up authentication in Supabase.

---

## Step 1: Execute schema_auth.sql

### 1.1 Open Supabase Dashboard
1. Go to https://supabase.com/
2. Sign in to your account
3. Select your FinXpert project (or create a new one if you haven't)

### 1.2 Navigate to SQL Editor
1. In the left sidebar, click **"SQL Editor"**
2. You'll see a blank SQL editor with a query box

### 1.3 Copy the SQL Script
1. Open the file `FinXpert/supabase/schema_auth.sql` in your code editor
2. Copy the entire contents (Ctrl+C / Cmd+C)

The script should look like this:
```sql
-- Enable Supabase Auth (usually enabled by default)
-- This script sets up user metadata to store advisor_id and tenant_id

-- Create a function to automatically set advisor_id on user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- Set default advisor_id from user ID if not provided
  update auth.users
  set raw_user_meta_data = coalesce(
    raw_user_meta_data,
    '{}'::jsonb
  ) || jsonb_build_object(
    'advisor_id', new.id,
    'tenant_id', 'TENANT-001'
  )
  where id = new.id;
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger to run on new user signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Grant necessary permissions
grant usage on schema public to anon, authenticated;
grant all on public.advisors to authenticated;
```

### 1.4 Paste and Run
1. Paste the SQL script into the SQL Editor
2. Click the **"Run"** button (or press Ctrl+Enter / Cmd+Enter)
3. Wait for the query to complete

### 1.5 Verify Success
You should see:
- ✅ **Success** message at the bottom
- No error messages
- The query executed successfully

**If you see an error:**
- Check that you're in the correct project
- Make sure you have admin/owner permissions
- Some functions might already exist (that's okay, the script handles it)

---

## Step 2: Enable Email Authentication

### 2.1 Navigate to Authentication Settings
1. In the left sidebar, click **"Authentication"**
2. Click on **"Providers"** (or "Settings" → "Auth")

### 2.2 Enable Email Provider
1. Find **"Email"** in the list of providers
2. Toggle the switch to **ON** (it should turn green/blue)
3. The Email provider is now enabled

### 2.3 Configure Email Settings (Optional but Recommended)

**Email Templates:**
1. Click on **"Email Templates"** in the left sidebar (under Authentication)
2. You'll see templates for:
   - Confirm signup
   - Magic Link
   - Change Email Address
   - Reset Password
   - Invite user

3. **For now, you can use the default templates** - they work fine
4. Later, you can customize them with your branding

**Email Settings:**
1. Go to **"Settings"** → **"Auth"**
2. Configure these options:

   **Enable Email Confirmations:**
   - Toggle **"Enable email confirmations"** ON if you want users to verify their email
   - Toggle OFF if you want instant signup (good for testing)

   **Site URL:**
   - Set to `http://localhost:3000` for local development
   - Set to your production URL when deploying (e.g., `https://finxpert.vercel.app`)

   **Redirect URLs:**
   - Add `http://localhost:3000/**` for local development
   - Add your production URL when deploying

### 2.4 Save Settings
1. Click **"Save"** at the bottom of the settings page
2. Changes are applied immediately

---

## Step 3: Test Authentication

### 3.1 Test Signup
1. Go to your app: `http://localhost:3000/signup`
2. Fill in the form:
   - Name: Your name
   - Email: Your email address
   - Password: At least 6 characters
3. Click **"Sign Up"**
4. You should see a success message

**If email confirmations are enabled:**
- Check your email inbox
- Click the confirmation link
- Then try logging in

**If email confirmations are disabled:**
- You can log in immediately

### 3.2 Test Login
1. Go to `http://localhost:3000/login`
2. Enter your email and password
3. Click **"Sign In"**
4. You should be redirected to the homepage
5. You should see your email in the header and a logout button

### 3.3 Verify Advisor ID Assignment
1. After signing up, go to Supabase Dashboard
2. Navigate to **"Authentication"** → **"Users"**
3. Find your user in the list
4. Click on your user to view details
5. Check the **"User Metadata"** section
6. You should see:
   ```json
   {
     "advisor_id": "your-user-id",
     "tenant_id": "TENANT-001"
   }
   ```

If you see this, the trigger is working correctly! ✅

---

## Step 4: Configure Email (Optional - For Production)

### 4.1 Set Up Custom SMTP (Recommended for Production)
1. Go to **"Settings"** → **"Auth"** → **"SMTP Settings"**
2. Configure your email provider:
   - **SendGrid** (recommended - free tier available)
   - **AWS SES**
   - **Mailgun**
   - **Custom SMTP**

3. Enter your SMTP credentials:
   - Host
   - Port
   - Username
   - Password
   - From email address

4. Test the connection
5. Save settings

**Why?** Supabase's default email service has rate limits. Custom SMTP gives you more control and better deliverability.

---

## Troubleshooting

### Error: "function already exists"
- This is okay! The script uses `CREATE OR REPLACE`, so it's safe to run multiple times
- Just continue - it will update the existing function

### Error: "permission denied"
- Make sure you're logged in as the project owner/admin
- Check that you have the correct project selected

### Users can't sign up
- Check that Email provider is enabled
- Verify Site URL is set correctly
- Check browser console for errors
- Make sure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are in `.env.local`

### Email confirmations not working
- Check spam folder
- Verify Site URL in Supabase settings matches your app URL
- Check email templates are configured
- For local testing, consider disabling email confirmations temporarily

### Advisor ID not being set
- Check that the trigger was created successfully
- Verify in SQL Editor: `SELECT * FROM auth.users WHERE id = 'your-user-id';`
- Check user metadata in Authentication → Users

---

## Quick Checklist

- [ ] SQL script executed successfully
- [ ] Email provider enabled
- [ ] Site URL configured (localhost:3000 for dev)
- [ ] Test signup works
- [ ] Test login works
- [ ] Advisor ID appears in user metadata
- [ ] Logout button appears when logged in
- [ ] Protected routes redirect to login when not authenticated

---

## Next Steps

Once auth is working:

1. **Test all features:**
   - Create transactions
   - View client workspaces
   - Check that data is isolated per advisor

2. **Customize email templates:**
   - Add your branding
   - Customize welcome messages

3. **Add password reset:**
   - Already works if email is configured
   - Add "Forgot Password" link to login page (optional)

4. **Deploy to production:**
   - Update Site URL to production domain
   - Configure production redirect URLs
   - Set up custom SMTP for better email delivery

---

## Support

If you encounter issues:
1. Check Supabase logs: Dashboard → Logs → Postgres Logs
2. Check browser console for client-side errors
3. Verify all environment variables are set correctly
4. Review the `IMPLEMENTATION_SUMMARY.md` for feature details

