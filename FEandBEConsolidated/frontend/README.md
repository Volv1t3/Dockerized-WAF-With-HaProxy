# AgriCommerce Frontend

A modern agricultural e-commerce platform built with SvelteKit, featuring user authentication, product management, and a responsive design with an agricultural theme.

## 🌾 Project Overview

AgriCommerce is a business website focused on agricultural products and services. It provides:

- **Public Pages**: Landing page, product catalog, about us, contact forms
- **Authentication**: Secure JWT-based user registration and login
- **User Dashboard**: Profile management and purchase history
- **Product Management**: Browse and search agricultural products
- **Responsive Design**: Mobile-first approach with agricultural theming

## 🏗️ Architecture

### Technology Stack
- **Framework**: SvelteKit with TypeScript
- **Database**: SQLite (development) / PostgreSQL (production)
- **ORM**: Prisma
- **Authentication**: JWT with HttpOnly cookies
- **Styling**: Custom CSS with design tokens
- **Validation**: Zod schemas
- **Containerization**: Docker with multi-stage builds

### Project Structure
```
frontend/
├── src/
│   ├── lib/
│   │   ├── server/          # Server-side utilities
│   │   │   ├── db.ts        # Database connection
│   │   │   └── jwt.ts       # JWT authentication
│   │   └── validators.ts    # Input validation schemas
│   ├── routes/
│   │   ├── api/             # API endpoints
│   │   ├── auth/            # Authentication pages
│   │   ├── account/         # Protected user pages
│   │   └── [public pages]   # Public routes
│   ├── hooks.server.ts      # Authentication middleware
│   ├── app.css             # Global styles and theme
│   └── app.d.ts            # TypeScript definitions
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.js            # Sample data script
├── static/                 # Static assets
├── Dockerfile             # Container configuration
├── docker-compose.yml     # Multi-service setup
└── package.json           # Dependencies and scripts
```

## 🚀 Setup and Installation

### Prerequisites
- Node.js 18+ and npm
- Docker and Docker Compose (optional)

### Local Development Setup

1. **Clone and Navigate**
   ```bash
   cd application-core/frontend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   DATABASE_URL="file:./prisma/dev.db"
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   PORT=3000
   NODE_ENV="development"
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Create and migrate database
   npm run db:push
   
   # Seed with sample data
   npm run db:seed
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```
   
   Application will be available at `http://localhost:3000`

### Docker Development Setup

1. **Using Docker Compose (Recommended)**
   ```bash
   docker-compose up --build
   ```
   
   This starts:
   - Frontend application on port 3000
   - PostgreSQL database on port 5432

2. **Docker Build Only**
   ```bash
   docker build -t agricommerce-frontend .
   docker run -p 3000:3000 --env-file .env agricommerce-frontend
   ```

## 🔧 Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | - | Prisma connection string |
| `JWT_SECRET` | Yes | - | Secret for signing JWTs |
| `PORT` | No | 3000 | Application server port |
| `NODE_ENV` | No | development | Environment mode |

### Database URL Examples
- **SQLite (Development)**: `file:./prisma/dev.db`
- **PostgreSQL (Production)**: `postgresql://user:password@host:port/database`

## 🗄️ Database Migrations and Seeding

### Development Workflow
```bash
# Make schema changes in prisma/schema.prisma
npm run db:push          # Apply changes to database
npm run db:generate      # Regenerate Prisma client
```

### Production Migrations
```bash
npm run db:migrate       # Create and apply migration
```

### Sample Data
```bash
npm run db:seed          # Populate with sample products and users
```

**Sample User Account:**
- Email: `demo@agricommerce.com`
- Password: `password123`

## 🧪 Testing

### Unit Tests
```bash
npm run test             # Run Vitest unit tests
```

### Integration Tests
```bash
npm run test:integration # Run Playwright tests
```

### Test Coverage
```bash
npm run test -- --coverage
```

## 🚢 Deployment Notes

### Production Build
```bash
npm run build           # Build for production
npm run preview         # Preview production build
```

### Docker Production
```bash
# Build production image
docker build -t agricommerce-frontend:latest .

# Run with production environment
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="secure-secret" \
  agricommerce-frontend:latest
```

### Environment Considerations
- **Development**: Uses SQLite, verbose logging, insecure cookies
- **Production**: Requires PostgreSQL, secure cookies, minimal logging

## 🔒 Security Considerations

### Authentication
- JWT tokens with 1-hour expiration
- HttpOnly, Secure, SameSite cookies
- Password hashing with bcrypt (12 rounds)
- Protected routes with middleware

### Headers and CSP
- Content Security Policy (CSP) headers
- X-Frame-Options, X-Content-Type-Options
- CORS configuration for same-origin

### Input Validation
- Zod schemas for all user inputs
- Server-side validation on all endpoints
- SQL injection prevention via Prisma ORM

### Rate Limiting
- Implement rate limiting for auth endpoints
- Monitor for suspicious activity

## 📝 Commenting Guidelines

### File Headers
Every file includes a header comment explaining:
- Purpose and functionality
- Dependencies and relationships
- Usage examples where relevant

### Function Documentation
```typescript
/**
 * Brief description of function purpose
 * 
 * @param {Type} paramName - Parameter description
 * @returns {Type} Return value description
 * @throws {Error} Error conditions
 */
```

### Configuration Comments
- Environment variables with purpose and examples
- Security settings with rationale
- Performance optimizations with explanations

## 🎨 Design System

### Color Palette
- **Primary**: `#6BAF5E` (Agricultural green)
- **Secondary**: `#F4A261` (Warm accent)
- **Neutral**: `#E9E5DC` (Earth tone)
- **Dark**: `#2E2A24` (Rich soil)

### Typography
- **Headings**: Poppins (modern, clean)
- **Body**: Inter (readable, professional)

### Components
- Consistent spacing scale (4px base unit)
- Rounded corners and soft shadows
- Hover states and smooth transitions
- Mobile-first responsive design

## 🔧 Development Scripts

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build
npm run check            # Type checking
npm run lint             # Code linting
npm run format           # Code formatting
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema changes
npm run db:migrate       # Create migration
npm run db:seed          # Seed database
```

## 🐛 Troubleshooting

### Common Issues

**Database Connection Errors**
- Verify `DATABASE_URL` in `.env`
- Ensure database server is running
- Check network connectivity

**JWT Authentication Issues**
- Verify `JWT_SECRET` is set
- Check cookie settings in browser
- Ensure HTTPS in production

**Build Failures**
- Clear `node_modules` and reinstall
- Verify Node.js version compatibility
- Check for TypeScript errors

**Docker Issues**
- Ensure Docker daemon is running
- Check port availability (3000, 5432)
- Verify environment variables in container

### Performance Optimization
- Enable gzip compression
- Implement caching strategies
- Optimize database queries
- Use CDN for static assets

## 📄 License

This project is part of an educational assignment for Network Engineering coursework.

## 🤝 Contributing

This is an academic project. For questions or suggestions, please contact the development team.

---

**Built with ❤️ for sustainable agriculture and modern web development**