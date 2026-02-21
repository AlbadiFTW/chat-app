# Chat App

A real-time chat application built with Next.js, featuring user authentication, channel-based messaging, and live typing indicators.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Development](#development)
- [Building & Deployment](#building--deployment)
- [Authentication](#authentication)
- [Real-time Features](#real-time-features)
- [API Integration](#api-integration)

## Features

- **User Authentication**: Secure login and registration with NextAuth.js
- **Channel-Based Messaging**: Create and manage chat channels
- **Real-time Communication**: WebSocket-based live updates using Socket.IO
- **Typing Indicators**: See when other users are typing
- **User Sessions**: Persistent login sessions with JWT tokens
- **Responsive Design**: Modern UI built with Tailwind CSS
- **Dark Theme**: Violet-themed dark interface for better user experience

## Tech Stack

### Frontend
- **Framework**: [Next.js](https://nextjs.org) 16.1.6 - React framework with App Router
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) - Accessible component library
- **Styling**: [Tailwind CSS](https://tailwindcss.com) 4 - Utility-first CSS framework
- **Icons**: [Lucide React](https://lucide.dev) - Beautiful icon library
- **Real-time**: [Socket.IO Client](https://socket.io/docs/v4/client-api/) - WebSocket communication
- **Authentication**: [NextAuth.js](https://next-auth.js.org) 4.24.13 - Authentication library for Next.js

### Development Tools
- **Language**: [TypeScript](https://www.typescriptlang.org) 5 - Type-safe JavaScript
- **Linting**: [ESLint](https://eslint.org) 9 - Code quality and style enforcement
- **Components**: [Radix UI](https://www.radix-ui.com) - Unstyled, accessible primitives

### Backend Integration
- Custom authentication API for login/registration
- RESTful endpoints for user credentials
- WebSocket server for real-time messaging

## Project Structure

```
chat-app/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Authentication routes group
│   │   │   ├── login/
│   │   │   │   └── page.tsx         # Login page with form
│   │   │   ├── register/
│   │   │   │   └── page.tsx         # Register page with form
│   │   │   └── layout.tsx           # Auth layout wrapper
│   │   ├── api/
│   │   │   └── auth/
│   │   │       └── [...nextauth]/
│   │   │           └── route.ts     # NextAuth configuration & routes
│   │   ├── chat/
│   │   │   ├── page.tsx             # Main chat interface
│   │   │   └── layout.tsx           # Chat layout with providers
│   │   ├── page.tsx                 # Home page (redirects to /chat)
│   │   ├── layout.tsx               # Root layout
│   │   └── globals.css              # Global styles and utilities
│   ├── components/
│   │   ├── ui/                      # shadcn/ui components
│   │   │   ├── badge.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── providers.tsx        # SessionProvider wrapper
│   │   │   ├── scroll-area.tsx
│   │   │   └── separator.tsx
│   ├── lib/
│   │   └── utils.ts                 # Utility functions
│   └── types/
│       └── next-auth.d.ts           # NextAuth type definitions
├── middleware.ts                     # NextAuth middleware for route protection
├── tsconfig.json                     # TypeScript configuration
├── next.config.ts                    # Next.js configuration
├── tailwind.config.ts                # Tailwind CSS configuration
├── components.json                   # shadcn/ui components config
├── package.json                      # Dependencies and scripts
├── postcss.config.mjs                # PostCSS configuration
└── public/                           # Static assets
```

## Prerequisites

- **Node.js**: v18.0 or higher
- **npm**: v9.0 or higher (or yarn, pnpm)
- **Backend Server**: Running authentication and WebSocket server

## Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd chat-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Setup environment variables** (see [Environment Setup](#environment-setup))

## Environment Setup

Create a `.env.local` file in the project root with the following variables:

```bash
# API Configuration
API_URL=http://localhost:3001              # Backend API URL (server-side)
NEXT_PUBLIC_API_URL=http://localhost:3001  # Backend API URL (client-side)

# NextAuth Configuration
NEXTAUTH_SECRET=your-secret-key-here       # JWT encryption secret (generate with: openssl rand -base64 32)
NEXTAUTH_URL=http://localhost:3000         # Application URL
```

### Generating NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

Or use Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Development

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

3. **Features available**:
   - Register a new account at `/register`
   - Login with credentials at `/login`
   - Access chat interface at `/chat` (protected route)
   - Create channels and send messages
   - See real-time typing indicators

The app automatically redirects to `/chat` from the home page when authenticated.

## Building & Deployment

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Start production server**:
   ```bash
   npm start
   ```

3. **Lint code**:
   ```bash
   npm run lint
   ```

### Deployment Platforms

The app is ready for deployment on:
- [Vercel](https://vercel.com) (recommended for Next.js)
- [Netlify](https://netlify.com)
- [Docker](https://www.docker.com/)
- Any Node.js hosting platform

Set environment variables in your hosting platform's dashboard before deploying.

## Authentication

### NextAuth.js Configuration

- **Provider**: Credentials-based authentication
- **Strategy**: JWT (JSON Web Tokens)
- **Session Management**: Server-side session validation with client-side JWT caching
- **Protected Routes**: All `/chat` routes require valid authentication

### Authentication Flow

1. User registers with email and password
2. Backend validates credentials and returns user object with token
3. NextAuth creates JWT token including user ID and backend token
4. Token stored in session for authenticated requests
5. Middleware protects `/chat` routes from unauthenticated access

### Key Files

- [src/app/api/auth/[...nextauth]/route.ts](src/app/api/auth/[...nextauth]/route.ts) - NextAuth handler and configuration
- [src/middleware.ts](src/middleware.ts) - Route protection middleware
- [src/components/ui/providers.tsx](src/components/ui/providers.tsx) - Session provider setup

## Real-time Features

### Typing Indicators

The app displays when other users are typing in the current channel using Socket.IO events:

```typescript
// Emitted when user is typing
socket.emit('typing', { roomId, userId, userName })

// Received to display typing status
socket.on('typing', (typingUser) => { /* update state */ })
```

### Message Updates

Messages are streamed in real-time as users send them:

- New messages appear instantly across all connected clients
- Message history loads from backend API
- Socket.IO maintains persistent connection for live updates

### WebSocket Connection

- Automatic connection on chat page load
- Graceful disconnection cleanup
- Reconnection handling for dropped connections

## API Integration

### Backend Endpoints

The app expects these endpoints on your backend server:

#### Authentication

```
POST /api/auth/login
Body: { email: string, password: string }
Response: { user: { id, name, email }, token: string }
```

#### Chat Messages

```
GET /api/chat/messages?roomId=<id>    # Get message history
GET /api/chat/rooms                   # Get user's channels
POST /api/chat/rooms                  # Create new channel
```

### Configuration

- Backend URL: Set via `API_URL` environment variable (server-side)
- Client-side API calls: Use `NEXT_PUBLIC_API_URL` for browser requests
- WebSocket URL: Configured in chat component

### Error Handling

- Failed authentication redirects to login page
- Invalid tokens trigger re-login flow
- API errors display user-friendly messages
- Network errors with reconnection retry logic

## Troubleshooting

### Common Issues

**"Session Invalid" on login attempt**
- Verify `NEXTAUTH_SECRET` is set and consistent
- Check backend API is accessible at `API_URL`
- Ensure backend returns correct token format

**"Cannot find module '@/components/ui/providers'"**
- Run `npm install` to install all dependencies
- Clear `.next` build cache: `rm -rf .next`

**WebSocket connection fails**
- Verify backend WebSocket server is running
- Check network firewall isn't blocking WebSocket
- Verify Socket.IO version compatibility

**Typing indicators not showing**
- Ensure Socket.IO client version matches server
- Check browser console for WebSocket errors
- Verify `socket.io-client` is installed

**Build fails with TypeScript errors**
- Run `npm run lint` to check code quality
- Ensure all imports are correct paths
- Check `tsconfig.json` for proper path configuration

### Debug Mode

Enable detailed logging:

```typescript
// In chat component
const socket = io(socketUrl, {
  debug: true,  // Enables Socket.IO debug logs
})
```

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes and test locally
3. Commit with clear messages: `git commit -m "Add feature description"`
4. Push to branch: `git push origin feature/your-feature`
5. Create a Pull Request

## License

This project is licensed under the MIT License - see LICENSE file for details.

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review Next.js documentation: [https://nextjs.org/docs](https://nextjs.org/docs)
3. Check NextAuth.js docs: [https://next-auth.js.org](https://next-auth.js.org)
4. Report issues in the project repository
