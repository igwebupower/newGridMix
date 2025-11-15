# Security Policy

## Security Status

GridMix takes security seriously. This document outlines our security measures and how to report vulnerabilities.

## Security Measures Implemented

### 1. Secrets Management
- ✅ No API keys or secrets committed to repository
- ✅ All sensitive credentials in environment variables only
- ✅ `.env.local` properly excluded via `.gitignore`
- ✅ Template `.env.local` contains only placeholders

### 2. API Security
- ✅ Input validation on all API endpoints
- ✅ Amount validation with min/max limits (£1-£10,000 one-time, £1-£1,000/month recurring)
- ✅ Integer validation to prevent decimal manipulation
- ✅ Error messages don't expose internal details
- ✅ Stripe SDK handles payment security
- ✅ HTTPS enforced in production

### 3. Dependencies
- ✅ Zero known vulnerabilities in production dependencies
- ✅ Regular dependency updates via npm
- ✅ Using latest stable versions of Next.js, React, and Stripe

### 4. Client-Side Security
- ✅ No sensitive data stored in browser localStorage
- ✅ Stripe Checkout handles PCI compliance
- ✅ All payment processing server-side only
- ✅ No client-side API key exposure

### 5. Data Privacy
- ✅ No user data collected beyond Stripe checkout flow
- ✅ No tracking cookies without consent
- ✅ No personal information stored in application
- ✅ Stripe handles all payment data securely

## Environment Variables Required

### Production
```
STRIPE_SECRET_KEY=sk_live_...        # Your Stripe live secret key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...  # Your Stripe live publishable key
NEXT_PUBLIC_SITE_URL=https://gridmix.co.uk
```

### Development
```
STRIPE_SECRET_KEY=sk_test_...        # Your Stripe test secret key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...  # Your Stripe test publishable key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Security Best Practices for Contributors

### 1. Never Commit Secrets
- Never commit API keys, passwords, or tokens
- Use `.env.local` for local development
- Use environment variables in deployment platforms

### 2. Input Validation
- Always validate user inputs
- Sanitize data before processing
- Use TypeScript for type safety

### 3. Error Handling
- Don't expose stack traces to users
- Log errors server-side only
- Return generic error messages to clients

### 4. Dependencies
- Run `npm audit` before committing
- Keep dependencies up to date
- Review new dependencies before adding

## Reporting a Vulnerability

If you discover a security vulnerability, please follow responsible disclosure:

1. **Do NOT** open a public GitHub issue
2. **Email** us at: hello@gridmix.co.uk
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We will respond within 48 hours and work with you to address the issue.

## Security Checklist for Deployment

Before deploying to production:

- [ ] All environment variables set in deployment platform
- [ ] `.env.local` not included in deployment
- [ ] Stripe live keys configured (not test keys)
- [ ] HTTPS enabled and enforced
- [ ] Domain configured correctly in Stripe dashboard
- [ ] Webhook endpoints verified (if using Stripe webhooks)
- [ ] CSP headers configured (if needed)
- [ ] Rate limiting configured (recommended)

## Recommended Enhancements

While the current implementation is secure, these enhancements would further improve security:

### Optional: Rate Limiting
Consider adding rate limiting to prevent abuse:
- Vercel Edge Middleware for rate limiting
- Or use a service like Vercel Edge Config
- Limit checkout session creation to 5 per minute per IP

### Optional: CORS Headers
If building an API in the future, configure CORS:
```javascript
headers: {
  'Access-Control-Allow-Origin': 'https://gridmix.co.uk',
  'Access-Control-Allow-Methods': 'GET, POST',
  'Access-Control-Allow-Headers': 'Content-Type',
}
```

### Optional: Content Security Policy
Add CSP headers for additional XSS protection:
```javascript
// next.config.js
headers: [
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; connect-src 'self' https://api.stripe.com;"
  }
]
```

## Regular Security Maintenance

- **Weekly**: Check for dependency updates
- **Monthly**: Run `npm audit` and review
- **Quarterly**: Review access logs for suspicious activity
- **Yearly**: Security audit of entire application

## Compliance

- **PCI DSS**: Handled by Stripe (we don't process card data)
- **GDPR**: No personal data stored; see Privacy Policy
- **Data Retention**: No user data retained by application

## Contact

For security concerns: hello@gridmix.co.uk

Last Updated: November 2025
