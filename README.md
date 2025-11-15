# AI-Powered Newsletter SaaS Platform

An intelligent, full-stack SaaS application that transforms RSS feeds into professionally curated newsletters using advanced AI. Built with Next.js 16, TypeScript, and OpenAI GPT-4o, this platform empowers content creators to generate engaging newsletters in minutes instead of hours.

![CodeRabbit Pull Request Reviews](https://img.shields.io/coderabbit/prs/github/the-adrianator/ai-newsletter-saas?utm_source=oss&utm_medium=github&utm_campaign=the-adrianator%2Fai-newsletter-saas&labelColor=171717&color=FF570A&link=https%3A%2F%2Fcoderabbit.ai&label=CodeRabbit+Reviews)

## 🚀 Features

- **AI-Powered Generation**: Automatically generates 5 newsletter titles, 5 email subject lines, and complete newsletter body content using GPT-4o
- **RSS Feed Aggregation**: Connect and manage multiple RSS feeds with automatic content fetching
- **Custom Branding**: Configure newsletter name, tone, target audience, and brand voice
- **Flexible Time Ranges**: Generate newsletters for any date range (weekly, monthly, or custom)
- **Top Announcements**: AI curates the top 5 most important news items automatically
- **Newsletter History**: Pro users can save and access all past newsletters
- **Export Ready**: Copy-paste formatted content compatible with Mailchimp, ConvertKit, Substack, and more
- **Dark Mode**: Beautiful dark/light theme support
- **Subscription Tiers**: Starter (3 feeds) and Pro (unlimited feeds + history)

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - Latest React with React Compiler
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first CSS framework
- **shadcn/ui** - High-quality React components built on Radix UI
- **Lucide React** - Beautiful icon library

### Backend & Database
- **Next.js API Routes** - Serverless API endpoints
- **Prisma** - Next-generation ORM
- **MongoDB** - NoSQL database for flexible data storage
- **Prisma Accelerate** - Connection pooling and edge caching

### AI & Integrations
- **OpenAI GPT-4o** - Advanced AI model for content generation
- **Vercel AI SDK** - Streaming AI responses with `@ai-sdk/openai` and `@ai-sdk/react`
- **RSS Parser** - Fetch and parse RSS/XML feeds

### Authentication & Security
- **Clerk** - Complete authentication solution with user management
- **Zod** - Schema validation for type-safe API requests

### Development Tools
- **Biome** - Fast formatter and linter (replaces ESLint + Prettier)
- **TypeScript** - Static type checking
- **date-fns** - Date manipulation utilities

### Additional Libraries
- **React Markdown** - Render markdown content
- **Sonner** - Toast notifications
- **next-themes** - Dark mode support
- **date-fns** - Modern date utility library

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 18+ 
- pnpm (recommended) or npm/yarn
- MongoDB database (local or cloud like MongoDB Atlas)
- Clerk account for authentication
- OpenAI API key

## 🔧 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/ai-newsletter-saas.git
   cd ai-newsletter-saas
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   # Database
   DATABASE_URL="mongodb://localhost:27017/ai-newsletter-saas"
   
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
   
   # OpenAI
   OPENAI_API_KEY=your_openai_api_key
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma Client
   pnpm prisma:generate
   
   # Push schema to database
   pnpm prisma:push
   ```

5. **Run the development server**
   ```bash
   pnpm dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
ai-newsletter-saas/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   └── newsletter/    # Newsletter generation endpoints
│   ├── dashboard/         # Dashboard pages
│   │   ├── account/       # User account page
│   │   ├── generate/      # Newsletter generation page
│   │   ├── history/       # Newsletter history
│   │   ├── pricing/       # Pricing page
│   │   └── settings/      # User settings
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── actions/               # Server actions
│   ├── generate-newsletter.ts
│   ├── rss-feed.ts
│   └── user-settings.ts
├── components/            # React components
│   ├── dashboard/         # Dashboard-specific components
│   ├── landing/           # Landing page components
│   └── ui/                # Reusable UI components (shadcn)
├── lib/                   # Utility libraries
│   ├── auth/              # Authentication helpers
│   ├── newsletter/        # Newsletter generation logic
│   ├── rss/               # RSS parsing and fetching
│   └── utils.ts           # General utilities
├── prisma/                # Database schema
│   └── schema.prisma      # Prisma schema definition
└── public/                # Static assets
```

## 🎯 Key Features Explained

### RSS Feed Management
- Add multiple RSS feeds with URL validation
- Automatic article fetching and deduplication
- Support for various RSS feed formats
- Feed metadata extraction (title, description, images)

### AI Newsletter Generation
- **Streaming Responses**: Real-time newsletter generation using Vercel AI SDK
- **Smart Prompting**: Context-aware prompts incorporating user settings
- **Structured Output**: Consistent JSON schema with titles, subject lines, body, and announcements
- **Custom Branding**: Newsletter tone, voice, and branding customization

### User Experience
- Responsive design for mobile, tablet, and desktop
- Real-time streaming updates during generation
- Toast notifications for user feedback
- Loading states and error handling
- Dark mode support

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | MongoDB connection string | Yes |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk public key | Yes |
| `CLERK_SECRET_KEY` | Clerk secret key | Yes |
| `OPENAI_API_KEY` | OpenAI API key | Yes |

## 📝 Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run Biome linter
pnpm format       # Format code with Biome
pnpm prisma:generate  # Generate Prisma Client
pnpm prisma:push      # Push schema to database
pnpm prisma:studio    # Open Prisma Studio
```

## 🗄️ Database Schema

The application uses MongoDB with the following main models:
- **User** - User accounts (linked to Clerk)
- **UserSettings** - Newsletter customization preferences
- **RssFeed** - RSS feed configurations per user
- **RssArticle** - Cached articles with deduplication
- **Newsletter** - Generated newsletter history

## 🚢 Deployment

The easiest way to deploy is using [Vercel](https://vercel.com):

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables
4. Deploy!

The app is optimized for Vercel's serverless functions and edge network.

## 📄 License

This project is private and proprietary.

## 👤 Author

Built with ❤️ for showcasing modern full-stack development capabilities.

---

**Note**: This is a portfolio project demonstrating expertise in:
- Full-stack Next.js development
- AI/LLM integration
- TypeScript and type safety
- Modern React patterns
- Database design and ORM usage
- Authentication and authorization
- SaaS application architecture
