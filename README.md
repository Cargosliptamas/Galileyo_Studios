# Galileyo

> A modern information distribution platform delivering uncensored, vital, and life-saving information via global satellite networks.

Galileyo is a comprehensive platform that ensures critical information reaches you no matter where you are. Built with a focus on free speech, privacy, and reliability, Galileyo provides real-time alerts, influencer feeds, and private communication channels that work even when traditional networks fail.

## 🌟 Features

- **Information Feeds**: Real-time alerts for weather, emergencies, financial markets, health alerts, and more
- **Influencer Feeds**: Uncensored content from popular creators and journalists
- **Private Feeds**: Create and manage private groups for secure, uncensored communication
- **Real-time Chat**: In-app messaging with voice/video call support
- **Alert Maps**: Interactive maps showing real-time emergency alerts and hazards
- **Bookmarks**: Save and organize important content
- **User Profiles**: Customizable profiles with follower/subscription management
- **Payment System**: Subscription management and payment processing
- **Push Notifications**: Stay informed with real-time notifications

## 🏗️ Architecture

This is a **Turborepo monorepo** built with modern web technologies:

### Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Mobile**: Expo SDK 53, React Native, NativeWind
- **Backend**: tRPC v11 for type-safe APIs
- **Database**: Drizzle ORM
- **Authentication**: Better Auth
- **Real-time**: WebSockets, Redis Pub/Sub
- **Monorepo**: Turborepo, pnpm workspaces
- **Type Safety**: TypeScript, Zod validation

### Project Structure

```
galileyo-new/
├── apps/
│   ├── nextjs/          # Next.js web application
│   └── expo/            # React Native mobile app
├── packages/
│   ├── api/             # tRPC router definitions
│   ├── auth/            # Better Auth configuration
│   ├── db/              # Drizzle schema and database client
│   ├── emails/          # Email templates (React Email)
│   ├── ui/              # Shared UI components (shadcn/ui)
│   └── validators/      # Shared Zod validation schemas
└── tooling/
    ├── eslint/          # Shared ESLint configuration
    ├── prettier/        # Shared Prettier configuration
    ├── tailwind/        # Shared Tailwind configuration
    └── typescript/      # Shared TypeScript configuration
```

## 📋 Prerequisites

- **Node.js**: >= 22.14.0
- **pnpm**: >= 9.6.0
- **Redis**: For real-time features and caching
- **XCode** (macOS): For iOS development
- **Android Studio**: For Android development (optional)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL=mysql://user:password@localhost:5432/galileyo

# Authentication
AUTH_SECRET=your-secret-key-here

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000
PORT=3000
NEXT_PUBLIC_WS_PORT=3001

# Email Configuration
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your-email@example.com
EMAIL_PASSWORD=your-password
EMAIL_FROM=noreply@galileyo.com
EMAIL_IS_SECURE=true

# Redis
REDIS_URL=redis://localhost:6379

# External Services
ZYTE_API_KEY=your-zyte-api-key
DISASTERAWARE_USERNAME=your-username
DISASTERAWARE_PASSWORD=your-password
```

### 3. Start Development Servers

```bash
# Start all apps (Next.js + Expo)
pnpm dev

# Or start only Next.js
pnpm dev:next

# Or start only email preview
pnpm dev:emails
```

The Next.js app will be available at `http://localhost:3000`

## 📱 Mobile Development

### iOS Setup

1. Ensure XCode and XCode Command Line Tools are installed
2. Configure the Expo dev script in `apps/expo/package.json`:

```json
{
  "scripts": {
    "dev": "expo start --ios"
  }
}
```

3. Run `pnpm dev` from the root directory

### Android Setup

1. Install Android Studio and set up an emulator
2. Configure the Expo dev script:

```json
{
  "scripts": {
    "dev": "expo start --android"
  }
}
```

3. Run `pnpm dev` from the root directory

### Better Auth with Expo

For OAuth to work with Expo, you have two options:

1. **Deploy Auth Proxy** (Recommended): Deploy the Next.js app and use the Better Auth proxy plugin
2. **Local IP**: Add your local IP (e.g., `192.168.x.y:3000`) to your OAuth provider settings

## 🛠️ Development

### Available Scripts

```bash
# Development
pnpm dev              # Start all apps in watch mode
pnpm dev:next         # Start only Next.js app
pnpm dev:emails       # Start email preview studio

# Building
pnpm build            # Build all packages and apps

# Code Quality
pnpm lint             # Lint all packages
pnpm lint:fix         # Fix linting issues
pnpm typecheck        # Type check all packages
pnpm format           # Check formatting
pnpm format:fix       # Fix formatting

# Database
pnpm db:push          # Push schema changes to database
pnpm db:pull          # Pull schema from database
pnpm db:studio        # Open Drizzle Studio
pnpm db:genm          # Generate migrations

# UI Components
pnpm ui-add           # Add new shadcn/ui component interactively

# Mobile
pnpm ios              # Run iOS app
pnpm android          # Run Android app
```

### Adding New Packages

To add a new package to the monorepo:

```bash
pnpm turbo gen init
```

This will prompt you for a package name and set up all necessary configurations.

### Adding UI Components

To add new shadcn/ui components:

```bash
pnpm ui-add
```

This uses the interactive shadcn/ui CLI to add components to the `@galileyo/ui` package.

## 📦 Packages

### `@galileyo/api`

tRPC router definitions for all API endpoints. Includes:
- Authentication routes
- Chat and messaging
- Feed management
- Profile management
- Payment processing
- Alert management
- Search functionality

### `@galileyo/auth`

Better Auth configuration and setup. Handles:
- Email/password authentication
- OAuth providers (Discord, etc.)
- Session management
- Magic links

### `@galileyo/db`

Database schema and client using Drizzle ORM:
- User and authentication schemas
- Feed and post schemas
- Chat and messaging schemas
- Payment schemas
- Alert schemas

### `@galileyo/ui`

Shared UI component library built on shadcn/ui:
- Form components
- Navigation components
- Data display components
- AI-powered elements
- Custom components

### `@galileyo/emails`

Email templates using React Email:
- Magic link emails
- Notification emails
- Transactional emails

### `@galileyo/validators`

Shared Zod validation schemas used across the monorepo.

## 🚢 Deployment

### Next.js (Vercel)

1. Create a new project on Vercel
2. Select `apps/nextjs` as the root directory
3. Add all environment variables from your `.env` file
4. Deploy!

The Next.js app must be deployed for the Expo app to communicate with the backend in production.

### Expo

1. Update the `getBaseUrl` function in `apps/expo/src/utils/api.tsx` to point to your production backend URL
2. Install EAS CLI: `pnpm add -g eas-cli`
3. Login: `eas login`
4. Configure: `cd apps/expo && eas build:configure`
5. Build: `eas build --platform ios --profile production`
6. Submit: `eas submit --platform ios --latest`

For OTA updates, use EAS Update:

```bash
cd apps/expo
pnpm expo install expo-updates
eas update:configure
eas update --auto
```

## 🔒 Security

- All API routes are protected with Better Auth
- Environment variables are validated using `@t3-oss/env-nextjs`
- Database queries use parameterized statements via Drizzle ORM
- OAuth flows use secure proxy patterns

## 📝 License

See [LICENSE](./LICENSE) file for details.

## 🤝 Contributing

This is a private repository. For questions or issues, please contact the development team.

## 📚 References

- [T3 Stack](https://create.t3.gg/) - The foundation for this project
- [Turborepo](https://turborepo.org) - Monorepo build system
- [tRPC](https://trpc.io) - End-to-end typesafe APIs
- [Drizzle ORM](https://orm.drizzle.team) - TypeScript ORM
- [Better Auth](https://www.better-auth.com) - Authentication library
- [Expo](https://expo.dev) - React Native framework
- [Next.js](https://nextjs.org) - React framework

---

Built with ❤️ by the Galileyo team
