# Signup Confirmation Email Setup

## Overview
Signup confirmation emails are now automatically sent whenever a user creates an account, regardless of whether they use the signup form or Google OAuth.

## Implementation Details

### Files Modified/Created

1. **`app/utils/mailer/SignupEmail.ts`** - New utility function
   - Handles email sending for both signup methods
   - Reads and processes HTML template with placeholders
   - Non-blocking implementation (doesn't fail signup if email fails)
   - Includes proper error handling and logging

2. **`app/api/auth/route.ts`** - Form-based signup
   - Added import for `sendSignupConfirmationEmail`
   - Sends email after successful user creation
   - Catches errors to prevent blocking signup

3. **`app/api/auth/google/route.ts`** - OAuth signup
   - Added import for `sendSignupConfirmationEmail`
   - Sends email only for new users (not returning users)
   - Catches errors to prevent blocking signup

4. **`templates/signup.html`** - Professional email template
   - Matches styling of `registration.html`
   - Modern gradient hero section
   - Responsive design with mobile support
   - Conditional content based on signup method
   - Inter font family for clean typography

### Template Features

The email template includes:
- **Hero Section**: Gradient background with welcome message
- **Account Details**: Shows email, registration method, and university (if provided)
- **Conditional Content**:
  - Form signups: Shows email verification notice
  - OAuth signups: Confirms email is already verified
- **Call-to-Action**: Dashboard button
- **Footer**: Contact information and timestamp

### Template Placeholders

The following placeholders are automatically replaced:
- `{{name}}` - User's full name
- `{{email}}` - User's email address
- `{{universityName}}` - University name (or "Not provided yet")
- `{{signupMethod}}` - "Google OAuth" or "Email & Password"
- `{{dashboardUrl}}` - Link to dashboard (from ROOT_URL env var)
- `{{timestamp}}` - Formatted date/time (IST timezone)
- `{{currentYear}}` - Current year for copyright
- `{{#if universityName}}...{{/if}}` - Conditional university display
- `{{#if isFormSignup}}...{{else}}...{{/if}}` - Conditional verification message

## Email Flow

### Form Signup
1. User fills out registration form
2. User record created in MongoDB with `emailVerified: false`
3. Signup confirmation email sent (non-blocking)
4. User receives email with verification notice
5. User must verify email to access full features

### Google OAuth Signup
1. User authenticates with Google
2. User record created in MongoDB with `emailVerified: true`
3. Signup confirmation email sent (non-blocking)
4. User receives email confirming account is ready
5. User can immediately access dashboard

## Environment Variables Required

Ensure these are set in your `.env` file:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
ROOT_URL=https://agneepath.co.in/
LOGO=/path/to/logo2.png
```

## Error Handling

- Email failures are logged but **never block user signup**
- Console logs show success (✅) or failure (❌) messages
- Errors are caught with `.catch()` to prevent promise rejection
- Template processing errors are caught and logged

## Testing

To test the email functionality:

1. **Test Form Signup**:
   ```bash
   # Create a test user via the signup form
   # Check console for: "✅ Signup confirmation email sent to..."
   # Check inbox for email with verification notice
   ```

2. **Test OAuth Signup**:
   ```bash
   # Sign up with Google OAuth (use new email not in database)
   # Check console for: "✅ Signup confirmation email sent to..."
   # Check inbox for email confirming verified status
   ```

3. **Test OAuth Returning User**:
   ```bash
   # Sign in with Google OAuth (use existing email)
   # No email should be sent (user already exists)
   ```

## Styling Details

The email template uses:
- **Colors**: Blue theme (#2563eb, #1e40af, #1e3a8a)
- **Font**: Inter (web font with fallbacks)
- **Layout**: 600px max-width, centered, responsive
- **Sections**: Hero, content, info boxes, CTA, footer
- **Mobile**: Media queries for screens < 600px and < 480px

## Troubleshooting

### Email not sending
- Check console for error messages
- Verify SMTP credentials in `.env`
- Ensure Gmail App Password is configured correctly
- Check SMTP_HOST and SMTP_PORT values

### Template not rendering correctly
- Verify `templates/signup.html` exists
- Check file path in `SignupEmail.ts` (uses `process.cwd()`)
- Ensure all placeholders have fallback values

### Duplicate emails
- Each email has unique Message-ID to prevent threading
- Google OAuth only sends emails for NEW users (checks if user exists)

## Future Enhancements

Potential improvements:
- Add email verification link for form signups
- Include personalized next steps based on user data
- Add unsubscribe link
- Implement email queuing system (Redis/BullMQ)
- Add email analytics tracking
- Support multiple languages

## Related Documentation

- Main mailer setup: See `SETUP_APP_PASSWORD.md` in demo-mailer2
- Registration emails: See `templates/registration.html`
- JWT middleware: See `app/api/auth/middleware/route.ts`

---

**Last Updated**: January 2025
**Status**: ✅ Production Ready
