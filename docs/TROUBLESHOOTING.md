# Troubleshooting Guide

Common issues and solutions for Green Claim Check.

## Build Errors

### TypeScript Errors

**Error**: `Property 'X' does not exist on type 'Y'`

**Solution**:
- Check TypeScript version compatibility
- Ensure all types are properly imported
- Use type assertions if necessary: `(value as any).property`

**Error**: `Cannot find module '@/...'`

**Solution**:
- Verify `tsconfig.json` paths are configured:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### Dependency Conflicts

**Error**: `ERESOLVE could not resolve`

**Solution**:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Or use legacy peer deps
npm install --legacy-peer-deps
```

**Error**: `eslint-config-next` version mismatch

**Solution**:
- Ensure `eslint-config-next` matches Next.js version
- For Next.js 14.2.35, use `eslint-config-next@^14.2.35`

### Webpack Errors

**Error**: `Serializing big strings impacts deserialization performance`

**Solution**:
- Extract large constants (like Base64 SVGs) to separate files
- Use `Buffer` instead of strings for large data

## Runtime Errors

### Authentication Issues

**Error**: `Failed to sign in` or `Session not found`

**Solutions**:
1. Check Supabase credentials in `.env.local`
2. Verify redirect URLs in Supabase Dashboard
3. Clear browser cookies and localStorage
4. Check browser console for CORS errors

**Error**: `useSearchParams() should be wrapped in a suspense boundary`

**Solution**:
Wrap component using `useSearchParams()` in Suspense:
```tsx
import { Suspense } from 'react';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ComponentWithSearchParams />
    </Suspense>
  );
}
```

### Database Errors

**Error**: `Could not find the 'X' column`

**Solution**:
- Run missing migrations
- Check Supabase Dashboard → Database → Tables
- Verify RLS policies are enabled

**Error**: `Row Level Security policy violation`

**Solution**:
1. Check RLS policies in Supabase Dashboard
2. Verify user is authenticated
3. Ensure policies allow user access:
```sql
-- Example policy
CREATE POLICY "Users can view own scans"
ON scans FOR SELECT
USING (auth.uid() = user_id);
```

### Stripe Errors

**Error**: `No such price: price_xxx`

**Solution**:
1. Verify Price IDs in Stripe Dashboard
2. Check environment variables are set correctly
3. Ensure using correct Stripe mode (test/live)

**Error**: `Webhook signature verification failed`

**Solution**:
1. Verify `STRIPE_WEBHOOK_SECRET` matches Stripe Dashboard
2. Check webhook endpoint URL is correct
3. Test with Stripe CLI:
```bash
stripe listen --forward-to localhost:3000/api/webhook/stripe
```

**Error**: `Type error: Property 'current_period_start' does not exist`

**Solution**:
- Use type assertion for Stripe subscription properties:
```typescript
const start = (subscription as any).current_period_start;
```

### PDF Export Errors

**Error**: `PDF export can only be called from the browser`

**Solution**:
- Ensure `exportToPDF` is only called client-side
- Check for `typeof window !== "undefined"` guard

**Error**: `jsPDF` font errors

**Solution**:
- Verify `jspdf` and `jspdf-autotable` versions are compatible
- Check font names are valid: `helvetica`, `times`, `courier`

## Deployment Issues

### Vercel Deployment

**Error**: `Build failed`

**Solutions**:
1. Check build logs in Vercel Dashboard
2. Verify all environment variables are set
3. Ensure Node.js version is 18+
4. Check for TypeScript errors locally first

**Error**: `Dynamic server usage: Route couldn't be rendered statically`

**Solution**:
Add to route file:
```typescript
export const dynamic = 'force-dynamic';
```

**Error**: `Module not found` in production

**Solution**:
- Check `package.json` dependencies
- Verify imports use correct paths
- Ensure all files are committed to Git

### Environment Variables

**Error**: `Environment variable not found`

**Solution**:
1. Verify variable name matches exactly (case-sensitive)
2. Check `.env.local` exists locally
3. Add variables in Vercel Dashboard → Settings → Environment Variables
4. Redeploy after adding variables

## Performance Issues

### Slow Page Loads

**Solutions**:
1. Enable Next.js Image Optimization
2. Use dynamic imports for heavy components:
```tsx
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  ssr: false
});
```
3. Check bundle size: `npm run build` shows sizes
4. Enable compression in Vercel

### Slow Database Queries

**Solutions**:
1. Add database indexes:
```sql
CREATE INDEX idx_scans_user_id ON scans(user_id);
CREATE INDEX idx_scans_created_at ON scans(created_at DESC);
```
2. Use pagination for large datasets
3. Monitor query performance in Supabase Dashboard

## Browser Issues

### Hydration Mismatch

**Error**: `Text content does not match server-rendered HTML`

**Solutions**:
1. Avoid using `localStorage`/`sessionStorage` during SSR
2. Use `useEffect` for client-only code:
```tsx
const [value, setValue] = useState(null);

useEffect(() => {
  setValue(localStorage.getItem('key'));
}, []);
```
3. Use `suppressHydrationWarning` on problematic elements

### CORS Errors

**Error**: `Access to fetch blocked by CORS policy`

**Solution**:
- Verify API routes include CORS headers
- Check middleware allows the origin
- For development, ensure `NEXT_PUBLIC_APP_URL` matches

## Common Fixes

### Clear All Caches

```bash
# Clear Next.js cache
rm -rf .next

# Clear node modules
rm -rf node_modules package-lock.json
npm install

# Clear browser cache
# Chrome: Cmd+Shift+Delete (Mac) or Ctrl+Shift+Delete (Windows)
```

### Reset Database

⚠️ **Warning**: This deletes all data!

```sql
-- In Supabase SQL Editor
TRUNCATE TABLE scans CASCADE;
TRUNCATE TABLE user_subscriptions CASCADE;
```

### Reset Authentication

1. Clear browser cookies
2. Clear localStorage:
```javascript
localStorage.clear();
sessionStorage.clear();
```
3. Sign out and sign in again

## Getting Help

### Debug Mode

Enable verbose logging:
```typescript
// Add to .env.local
NEXT_PUBLIC_DEBUG=true
```

### Check Logs

- **Vercel**: Dashboard → Deployments → View Function Logs
- **Supabase**: Dashboard → Logs
- **Stripe**: Dashboard → Developers → Logs
- **Browser**: Developer Tools → Console

### Common Commands

```bash
# Check TypeScript errors
npm run build

# Check linting
npm run lint

# Check environment variables
node -e "console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)"

# Test Stripe webhook locally
stripe listen --forward-to localhost:3000/api/webhook/stripe
```

## Still Having Issues?

1. Check [GitHub Issues](https://github.com/yourusername/green-claim-check/issues)
2. Review [API Documentation](./API.md)
3. Check [Deployment Guide](./DEPLOYMENT.md)
4. Contact support: support@greenclaimcheck.com

## Prevention

### Best Practices

1. **Always test locally** before deploying
2. **Use TypeScript strict mode** to catch errors early
3. **Write tests** for critical functionality
4. **Monitor error logs** regularly
5. **Keep dependencies updated** (but test first)
6. **Document environment variables** clearly
7. **Use version control** for all changes

### Regular Maintenance

- Update dependencies monthly
- Review error logs weekly
- Test deployment process quarterly
- Backup database regularly
- Monitor performance metrics
