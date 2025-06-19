# 🚀 Bons-Ai Installation Guide

Welcome to the complete installation guide for Bons-Ai! This guide is designed with neurodivergent developers in mind, with clear step-by-step instructions and helpful tips.

## 📋 Prerequisites Checklist

Before starting, you'll need accounts for these services. Don't worry - we'll walk through each one:

- [ ] 3 Google accounts for AI Studio access
- [ ] Google Cloud account with £240 free credits  
- [ ] OpenRouter account with initial funding
- [ ] Scrapybara Pro account
- [ ] Cursor Pro subscription
- [ ] Mem0 Pro account
- [ ] GitHub account (for deployment)

## 🏁 Quick Start (5 Minutes)

If you just want to try Bons-Ai locally without full service integration:

```bash
# Clone the repository
git clone https://github.com/mamabear-ai/Bons-Ai.git
cd Bons-Ai

# Install dependencies
bun install

# Start in demo mode
bun run dev:demo
```

This will start Bons-Ai with mock data so you can explore the interface.

## 🔧 Full Installation (30-45 Minutes)

### Step 1: System Requirements

**Minimum Requirements:**
- Node.js 20+ (we recommend using bun)
- 8GB RAM
- 10GB free disk space
- Modern web browser (Chrome, Firefox, Safari, Edge)

**Recommended:**
- 16GB+ RAM
- 25GB+ free disk space
- Fast internet connection

### Step 2: Account Setup

#### 2.1 Google AI Studio Accounts (FREE)

You need 3 Google accounts to maximize free tier usage:

1. **Primary Account**: Your main Google account
2. **Secondary Account**: Create a new Gmail account  
3. **Tertiary Account**: Create another Gmail account

For each account:
1. Go to [Google AI Studio](https://aistudio.google.com)
2. Sign in with the account
3. Accept terms and conditions
4. Generate API key:
   - Click "Get API Key"
   - Click "Create API Key"
   - Copy the key (save it securely!)

**💡 Tip**: Name your API keys clearly (e.g., "Bons-Ai-Primary", "Bons-Ai-Secondary")

#### 2.2 Google Cloud Account (£240 FREE CREDITS)

1. Go to [Google Cloud Console](https://console.cloud.google.com)  
2. Sign up with your primary Google account
3. Complete the free trial setup (requires credit card for verification)
4. You'll get £240 in free credits (valid for 90 days)
5. Enable Vertex AI API:
   - Go to APIs & Services > Library
   - Search for "Vertex AI API"
   - Click Enable
6. Create a service account:
   - Go to IAM & Admin > Service Accounts
   - Click "Create Service Account"
   - Name it "bons-ai-service"
   - Grant "Vertex AI User" role
   - Generate and download JSON key

**💡 Tip**: Set up billing alerts at £50, £100, £150, and £200 to track usage

#### 2.3 OpenRouter Account (£40 INITIAL FUNDING)

1. Go to [OpenRouter](https://openrouter.ai)
2. Sign up with email
3. Verify your email address
4. Go to API Keys section
5. Generate API key
6. Add £40 in credits:
   - Go to Billing
   - Add credit via card or crypto
   - This covers fallback usage for complex tasks

**💡 Tip**: Start with £20 if you're budget-conscious, you can add more later

#### 2.4 Scrapybara Pro (£99/MONTH, 500 HOURS)

1. Go to [Scrapybara](https://scrapybara.com)
2. Sign up for Pro account
3. You get 500 hours of virtual Ubuntu instances
4. Generate API key from dashboard
5. Test connection in dashboard to ensure it works

**💡 Tip**: This is the most expensive service, but essential for computer use agent training

#### 2.5 Cursor Pro (£40/MONTH)

1. Download [Cursor](https://cursor.sh)
2. Install and open the application
3. Sign up for Pro account
4. Generate API token:
   - Go to Settings > API
   - Generate new token
   - Copy token

**💡 Tip**: You can use Cursor's free tier initially, upgrade when you need advanced features

#### 2.6 Mem0 Pro (£1 FOR 6 MONTHS)

1. Go to [Mem0](https://mem0.ai)
2. Sign up for account
3. Upgrade to Pro (£1 for 6 months promotion)
4. Generate API key from dashboard
5. Note your organization ID

**💡 Tip**: This is the best value service - £1 for 6 months of shared memory!

### Step 3: Project Setup

#### 3.1 Clone and Install

```bash
# Clone the repository
git clone https://github.com/mamabear-ai/Bons-Ai.git
cd Bons-Ai

# Install dependencies (using bun for speed)
bun install

# If you don't have bun, install it first:
curl -fsSL https://bun.sh/install | bash
```

#### 3.2 Environment Configuration

```bash
# Copy the environment template
cp .env.example .env

# Open the environment file
nano .env  # or use your preferred editor
```

Fill in your API keys:

```env
# Google AI Studio (3 accounts)
GOOGLE_AI_KEY_PRIMARY=your_primary_google_ai_key_here
GOOGLE_AI_KEY_SECONDARY=your_secondary_google_ai_key_here  
GOOGLE_AI_KEY_TERTIARY=your_tertiary_google_ai_key_here

# Google Cloud (Vertex AI)
GOOGLE_CLOUD_PROJECT_ID=your_project_id_here
GOOGLE_APPLICATION_CREDENTIALS=./path/to/service-account.json

# OpenRouter
OPENROUTER_API_KEY=your_openrouter_key_here

# Scrapybara
SCRAPYBARA_API_KEY=your_scrapybara_key_here

# Cursor Pro
CURSOR_API_TOKEN=your_cursor_token_here

# Mem0
MEM0_API_KEY=your_mem0_key_here
MEM0_ORG_ID=your_mem0_org_id_here

# Additional Services
DEEPSEEK_API_KEY=your_deepseek_key_here  # Optional
GITHUB_TOKEN=your_github_pat_here        # For deployments
PIPEDREAM_API_KEY=your_pipedream_key_here # For workflows
```

**🔒 Security Note**: Never commit your .env file to version control!

### Step 4: First Run

```bash
# Start the development server
bun run dev

# Or start with full monitoring
bun run dev:monitor
```

The application will be available at `http://localhost:3000`

### Step 5: Onboarding

1. Open your browser to `http://localhost:3000`
2. Complete the neurodivergent-friendly onboarding flow
3. Customize your sensory preferences:
   - Choose your theme (purple, orange, neon, high-contrast)
   - Set font size and animation speed
   - Configure break reminders
4. Test service connections in the setup wizard
5. Choose your first project type to verify everything works

## 🔧 Advanced Configuration

### Custom Themes

You can create custom themes by modifying `src/styles/themes.css`:

```css
.theme-custom {
  --primary: your-primary-color;
  --secondary: your-secondary-color;
  --background: your-background-color;
  --text: your-text-color;
}
```

### Performance Tuning

For better performance on lower-end machines:

```env
# Reduce concurrent requests
MAX_CONCURRENT_REQUESTS=2

# Lower memory usage
ENABLE_MEMORY_OPTIMIZATION=true

# Disable animations
DISABLE_ANIMATIONS=true
```

### Service Priorities

You can customize which AI services to prioritize:

```env
# Service priority order (comma-separated)
AI_SERVICE_PRIORITY=google-ai,vertex-ai,openrouter,deepseek

# Budget limits (in USD)
DAILY_BUDGET_LIMIT=50
MONTHLY_BUDGET_LIMIT=500
```

## 🐛 Troubleshooting

### Common Issues

#### "Failed to connect to Google AI Studio"
- **Problem**: API key is invalid or expired
- **Solution**: Regenerate API key in Google AI Studio
- **Prevention**: Set up API key rotation in your calendar

#### "Vertex AI quota exceeded"  
- **Problem**: Used up free credits or hit rate limits
- **Solution**: Check billing in Google Cloud Console
- **Prevention**: Set up billing alerts

#### "Scrapybara instance unavailable"
- **Problem**: No available instances or account suspended
- **Solution**: Check Scrapybara dashboard for instance status
- **Prevention**: Monitor usage in Scrapybara dashboard

#### "Memory allocation error"
- **Problem**: Not enough RAM for all services
- **Solution**: Close other applications or increase system RAM
- **Prevention**: Monitor system resources

### Debug Mode

Enable debug mode for detailed logging:

```bash
# Start with debug logging
DEBUG=true bun run dev

# Or with specific components
DEBUG=ai-router,studios bun run dev
```

### Health Checks

Test all service connections:

```bash
# Run health checks
bun run health-check

# Test specific service
bun run test:google-ai
bun run test:vertex-ai
bun run test:openrouter
```

## 🚀 Deployment

### Local Development
```bash
# Standard development
bun run dev

# With hot reload and monitoring
bun run dev:watch

# Production build testing
bun run build && bun run preview
```

### Production Deployment

```bash
# Build for production
bun run build

# Deploy to Vercel
bun run deploy:vercel

# Deploy to Netlify  
bun run deploy:netlify

# Self-hosted deployment
bun run build && bun run start
```

## 📊 Monitoring Setup

### Usage Tracking

Monitor your service usage:

```bash
# Check daily usage
bun run usage:daily

# Check monthly costs
bun run usage:monthly

# Generate usage report
bun run usage:report
```

### Alerts Configuration

Set up monitoring alerts:

```env
# Slack webhook for alerts
SLACK_WEBHOOK=your_slack_webhook_url

# Email alerts
ALERT_EMAIL=your_email@example.com

# Budget alert thresholds
ALERT_THRESHOLD_WARNING=80  # 80% of budget
ALERT_THRESHOLD_CRITICAL=95 # 95% of budget
```

## 🆘 Getting Help

### Documentation
- **User Guide**: `docs/USER_GUIDE.md`
- **API Reference**: `docs/API.md`
- **Troubleshooting**: `docs/TROUBLESHOOTING.md`

### Support Channels
- **GitHub Issues**: Technical problems and bug reports
- **Discussions**: Feature requests and general questions
- **Email**: Priority support for licensed users

### Emergency Contacts
- **Technical Issues**: tech-support@mamabear-ai.com
- **Billing Problems**: billing@mamabear-ai.com
- **Security Concerns**: security@mamabear-ai.com

## ✅ Post-Installation Checklist

After successful installation:

- [ ] All service connections are green in health check
- [ ] Completed onboarding flow
- [ ] Customized interface preferences
- [ ] Created first test project
- [ ] Set up monitoring alerts
- [ ] Configured budget limits
- [ ] Bookmarked documentation
- [ ] Joined community discussions

## 🎉 You're Ready!

Congratulations! You've successfully installed Bons-Ai. You now have access to:

- 7 specialized AI development studios
- Smart model routing across multiple AI services
- Neurodivergent-friendly interface
- Production monitoring and cost control
- Comprehensive documentation and support

**Next Steps:**
1. Explore each studio with sample projects
2. Customize workflows to match your development style
3. Connect with the community for tips and best practices
4. Start building amazing projects with AI assistance!

Welcome to the future of neurodivergent-friendly AI development! 🌿✨