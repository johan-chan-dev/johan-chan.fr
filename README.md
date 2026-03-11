# Johan Chan - Portfolio & CV Website

A modern, bilingual portfolio website built with SvelteKit 5, featuring comprehensive testing infrastructure and internationalization support.

## Features

- 🌍 **Bilingual Support**: French (primary) and English with Paraglide JS
- 📱 **Responsive Design**: Mobile-first approach with Tailwind CSS
- 🎨 **Modern UI**: DaisyUI components with dark/light theme support
- 📄 **Dynamic CV**: PDF generation with customizable templates
- 📧 **Contact Form**: Email integration with Mailpit testing
- 🧪 **Comprehensive Testing**: 4-layer testing strategy (Unit, Integration, E2E, Performance)
- ⚡ **Performance Optimized**: Built for Core Web Vitals excellence
- 🔍 **SEO Ready**: Structured data and meta tag optimization

## Quick Start

### Prerequisites

- Node.js 18+ with pnpm package manager
- Docker (for email testing with Mailpit)

### Installation

```bash
# Clone the repository
git clone https://github.com/jconan/jconan.github.io.git
cd jconan.github.io

# Install dependencies
pnpm install

# Install Playwright browsers for E2E testing
pnpm exec playwright install

# Start development server
pnpm dev
```

Visit [http://localhost:5173](http://localhost:5173) to see the website.

## Development

### Development Server

```bash
# Start development server
pnpm dev

# Start with specific port
PORT=3000 pnpm dev

# Start with host binding
pnpm dev --host
```

### Building

```bash
# Create production build
pnpm build

# Preview production build
pnpm preview
```

### Code Quality

```bash
# Run linting
pnpm lint

# Format code
pnpm format

# Type checking
pnpm check

# Type checking with watch mode
pnpm check:watch
```

## Testing

This project implements a comprehensive 4-layer testing strategy ensuring reliability and maintainability.

### Quick Test Commands

```bash
# Run all tests (recommended)
pnpm test:all

# Run tests with coverage and reports (CI/CD)
pnpm test:ci

# Validate testing infrastructure
tsx scripts/validate-testing-infrastructure.ts
```

### Test Layers

#### 1. Unit Tests (Vitest)

```bash
# Run unit tests
pnpm test:unit

# Run with coverage
pnpm test:unit:coverage

# Run with UI
pnpm test:unit:ui

# Run specific test
pnpm test:unit contact-form-validation.test.ts
```

#### 2. Integration Tests (Vitest + Mailpit)

```bash
# Start email testing service
pnpm mailpit:start

# Run integration tests
pnpm test:integration

# Stop email testing service
pnpm mailpit:stop
```

#### 3. End-to-End Tests (Playwright)

```bash
# Run E2E tests (all browsers)
pnpm test:e2e

# Run with UI mode
pnpm test:e2e:ui

# Run specific browser
pnpm test:e2e:chromium
pnpm test:e2e:firefox
pnpm test:e2e:webkit

# Run mobile tests
pnpm test:e2e:mobile

# Debug mode
pnpm test:e2e:debug
```

#### 4. Performance Tests (k6)

```bash
# Install k6 (macOS)
brew install k6

# Run performance tests
pnpm test:performance

# Run with custom parameters
k6 run --vus 10 --duration 30s tests/performance/contact-form.js
```

### Testing Services

#### Mailpit Email Testing

- **Web UI**: [http://localhost:8025](http://localhost:8025)
- **SMTP**: localhost:1025
- **Management**: `pnpm mailpit:start|stop|restart`

### Test Reports

- **Unit Coverage**: `coverage/index.html`
- **E2E Reports**: `playwright-report/index.html`
- **Test Results**: `test-results/`

### Troubleshooting Tests

Common issues and solutions:

```bash
# Reinstall Playwright browsers
pnpm exec playwright install

# Clear test cache
rm -rf node_modules/.cache
pnpm install

# Reset Mailpit
pnpm mailpit:restart

# Check port conflicts
lsof -ti:5173 | xargs kill -9
```

For detailed testing documentation, see [docs/TESTING.md](docs/TESTING.md).

## Internationalization

### Language Support

- **Primary**: French (fr) - Base URL `/`
- **Secondary**: English (en) - URL prefix `/en/`

### Managing Translations

```bash
# Message files
messages/fr.json  # French translations
messages/en.json  # English translations

# Usage in components
import * as m from '$lib/paraglide/messages';
<h1>{m.homepage_title()}</h1>
```

### Adding New Content

1. Add message keys to both `fr.json` and `en.json`
2. Use semantic naming: `section_element_purpose`
3. Import and use: `{m.your_message_key()}`
4. Test both languages during development

## CV & PDF Generation

### Generate CV PDFs

```bash
# Generate both language versions
pnpm generate-cv-pdf

# Development version with debug info
pnpm generate-cv-pdf-dev

# New experimental generator
pnpm generate-cv-pdf-new
```

### CV Data Management

- **Source**: `src/lib/data/cv-data.json`
- **Templates**: `static/CV.{lang}.md`
- **Output**: `static/CV.{lang}.pdf`

## Project Structure

```
src/
├── lib/
│   ├── components/     # Reusable Svelte components
│   ├── data/          # Static data (CV, SEO)
│   ├── types/         # TypeScript type definitions
│   ├── utils/         # Utility functions
│   └── paraglide/     # Internationalization
├── routes/            # SvelteKit routes
│   ├── +layout.svelte # Root layout
│   ├── +page.svelte   # Homepage
│   ├── about/         # About page with CV
│   ├── contact/       # Contact form
│   ├── services/      # Services page
│   └── portfolio/     # Portfolio projects
tests/
├── unit/              # Unit tests (Vitest)
├── integration/       # Integration tests (Vitest + Mailpit)
├── e2e/              # End-to-end tests (Playwright)
├── performance/       # Performance tests (k6)
├── setup/            # Test configuration
└── utils/            # Test utilities
docs/                 # Project documentation
static/               # Static assets
```

## Deployment

### Static Site Generation

```bash
# Build for static hosting
pnpm build

# Output directory
build/
```

### GitHub Pages Deployment

The site is automatically deployed to GitHub Pages on push to main branch.

- **Live Site**: [https://jconan.github.io](https://jconan.github.io)
- **Deployment**: Automated via GitHub Actions

### Environment Variables

```bash
# Development
NODE_ENV=development

# Production
NODE_ENV=production

# Testing
NODE_ENV=test
MAILPIT_URL=http://localhost:8025
```

## Contributing

### Development Workflow

1. **Feature Development**:

   ```bash
   # Create feature branch
   git checkout -b feature/your-feature

   # Write tests first (TDD)
   pnpm test:unit --watch

   # Implement feature
   pnpm dev

   # Run full test suite
   pnpm test:all
   ```

2. **Pre-commit Checks**:

   ```bash
   # Run pre-commit validation
   ./scripts/pre-commit-tests.sh

   # Manual validation
   pnpm lint && pnpm test:unit && pnpm test:integration
   ```

3. **Pull Request**:
   - Ensure all tests pass
   - Update documentation if needed
   - Include test coverage for new features

### Code Standards

- **TypeScript**: Strict mode enabled
- **ESLint**: Configured for Svelte and TypeScript
- **Prettier**: Automatic code formatting
- **Testing**: Minimum 80% coverage for new code
- **i18n**: All user-facing text must be internationalized

## Documentation

### Available Documentation

- [📖 Testing Guide](docs/TESTING.md) - Comprehensive testing documentation
- [🏗️ Technical Architecture](docs/02-technical-architecture.md) - System design
- [🚀 Development Guide](docs/03-development-guide.md) - Development workflows
- [📧 Contact Form Migration](docs/contact-form-migration/README.md) - Email system setup
- [🔍 SEO Guide](docs/seo/README.md) - SEO optimization

### API Reference

- [📚 API Documentation](docs/06-api-reference.md) - API endpoints and schemas
- [🎨 Component Library](src/lib/components/) - Reusable components
- [🔧 Utilities](src/lib/utils/) - Helper functions

## Performance

### Core Web Vitals

- **LCP**: < 2.5s (Largest Contentful Paint)
- **FID**: < 100ms (First Input Delay)
- **CLS**: < 0.1 (Cumulative Layout Shift)

### Performance Monitoring

```bash
# Run performance tests
pnpm test:performance

# Lighthouse audit
npx lighthouse http://localhost:5173 --output html

# Bundle analysis
pnpm build && npx vite-bundle-analyzer
```

## Security

### Security Features

- **CSP**: Content Security Policy headers
- **HTTPS**: Enforced in production
- **Input Validation**: Zod schema validation
- **Email Security**: SMTP authentication and validation

### Security Testing

```bash
# Dependency audit
pnpm audit

# Security linting
pnpm lint:security
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

### Getting Help

- **Documentation**: Check [docs/](docs/) directory
- **Issues**: [GitHub Issues](https://github.com/jconan/jconan.github.io/issues)
- **Testing**: Run `tsx scripts/validate-testing-infrastructure.ts`

### Contact

- **Website**: [https://jconan.github.io](https://jconan.github.io)
- **Email**: Via contact form on the website
- **GitHub**: [@jconan](https://github.com/jconan)

---

Built with ❤️ using SvelteKit 5, TypeScript, and comprehensive testing infrastructure.
