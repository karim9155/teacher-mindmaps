# Vercel Deployment Troubleshooting Checklist

## 500 Error Fix - Things to Verify

### 1. Environment Variables in Vercel
Go to Vercel Dashboard → Your Project → Settings → Environment Variables

Ensure these are set:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon/public key

### 2. Supabase Database Setup

#### A. Run the RPC Function (v2)
In your Supabase SQL Editor, run this:

```sql
-- Function to decrement credits with a variable amount
create or replace function decrement_credits(user_id uuid, amount int default 1)
returns void as $$
begin
  update public.profiles
  set credits = credits - amount
  where id = user_id and credits >= amount;
end;
$$ language plpgsql security definer;
```

#### B. Verify profiles table exists
```sql
-- Check if profiles table exists
SELECT * FROM profiles LIMIT 1;
```

#### C. Verify generations table exists
```sql
-- Check if generations table exists
SELECT * FROM generations LIMIT 1;
```

### 3. Supabase Storage Setup

#### A. Create 'posters' bucket
1. Go to Supabase Dashboard → Storage
2. Create a new bucket named `posters`
3. Make it **public** (or set appropriate policies)

#### B. Set Storage Policies
```sql
-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload their own posters"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'posters' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow public read access
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'posters');

-- Allow users to delete their own files
CREATE POLICY "Users can delete their own posters"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'posters' AND (storage.foldername(name))[1] = auth.uid()::text);
```

### 4. N8N Webhook Configuration
- Verify the webhook URL is accessible: `https://karim.n8nkk.tech/webhook/c924151b-1474-4cf7-af1b-48d9cdb85aac`
- Ensure the n8n webhook is set to "Respond With" → **Binary**
- Test the webhook manually to ensure it returns an image

### 5. Check Vercel Logs
After making changes, test again and check logs:
1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on the latest deployment
3. Go to "Functions" tab
4. Find the `/api/upload` function
5. Click to see the logs

Look for:
- `[API] User authenticated: ...`
- `[API] User has X credits...`
- `[API] n8n response status: ...`
- Any error messages

### 6. Common Issues and Solutions

#### Issue: "Failed to fetch user profile"
- Solution: Make sure the `profiles` table exists and has a row for your user
- Run: `INSERT INTO profiles (id, credits) VALUES ('your-user-id', 10);`

#### Issue: "Failed to upload image"
- Solution: Create the 'posters' bucket in Supabase Storage (see step 3)

#### Issue: "Failed to deduct credits"
- Solution: Deploy the RPC function v2 (see step 2A)

#### Issue: "n8n Error: The webhook returned file metadata"
- Solution: In n8n, set the Respond node to return Binary data, not JSON

### 7. Test Locally First
Before deploying, test locally:
```bash
pnpm run dev
```

If it works locally but not in production:
- Check environment variables are set in Vercel
- Check Supabase is in production mode, not local
- Verify all database migrations are applied

### 8. Redeploy
After fixing issues:
```bash
git add .
git commit -m "Fix upload API error handling"
git push
```

Vercel will automatically redeploy.

## Quick Debug Commands

### Check if function exists in Supabase:
```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name = 'decrement_credits';
```

### Check user credits:
```sql
SELECT id, credits FROM profiles WHERE id = 'your-user-id';
```

### Check storage buckets:
```sql
SELECT * FROM storage.buckets;
```
