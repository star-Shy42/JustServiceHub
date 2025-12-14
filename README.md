# Home Service Discovery Platform

A comprehensive home service marketplace built with Next.js, enabling users to discover, book, and review home services while providing providers with tools to manage their offerings.

## 🌟 Features

### For Users
- **Service Discovery**: Browse and search home services by category
- **Smart Recommendations**: AI-powered service recommendations using machine learning
- **Booking Management**: Complete booking lifecycle with status tracking
- **Review System**: Rate and review services after completion
- **User Dashboard**: Track bookings, reviews, and profile management
- **Secure Authentication**: JWT-based authentication with role-based access

### For Service Providers
- **Provider Dashboard**: Manage services, bookings, and customer interactions
- **Service Management**: Create, edit, and manage service offerings
- **Booking Management**: Accept, manage, and update booking statuses
- **Profile Management**: Build provider reputation with verified profiles
- **Review Management**: Monitor and respond to customer feedback

### For Administrators
- **Admin Dashboard**: Platform oversight and user management
- **Content Moderation**: Manage services, reviews, and user reports
- **Analytics**: Platform performance and usage insights

## 🛠 Tech Stack

### Frontend
- **Next.js 16**: React framework with App Router
- **React 19**: Modern React with concurrent features
- **TypeScript**: Type-safe development
- **Tailwind CSS 4**: Utility-first CSS framework

### Backend
- **Next.js API Routes**: Server-side API endpoints
- **Prisma ORM**: Type-safe database client
- **PostgreSQL**: Primary database
- **JWT**: Authentication and authorization

### AI & ML
- **Hugging Face Transformers**: AI-powered recommendations
- **Custom Recommendation Engine**: Service matching algorithms

### DevOps & Deployment
- **Docker**: Containerization support
- **Docker Compose**: Multi-container development
- **ESLint**: Code linting and formatting
- **PostCSS**: CSS processing

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Docker (optional, for containerized deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd home-service-discovery
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/home_service_discovery"
   JWT_SECRET="your-super-secret-jwt-key-here"
   NEXT_PUBLIC_API_URL="http://localhost:3000"
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma db push
   
   # (Optional) Seed database
   npx prisma db seed
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

   Visit `http://localhost:3000` to access the application.

### Docker Deployment

1. **Build and run with Docker Compose**
   ```bash
   docker-compose up --build
   ```

   This will start:
   - Next.js application on port 3000
   - PostgreSQL database on port 5432

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── bookings/      # Booking management
│   │   ├── providers/     # Provider operations
│   │   ├── services/      # Service CRUD operations
│   │   ├── reviews/       # Review system
│   │   └── recommendations/ # AI recommendations
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # User dashboards
│   ├── services/          # Service browsing
│   └── admin/             # Admin panel
├── components/            # Reusable UI components
├── context/               # React context providers
├── lib/                   # Utility libraries
│   ├── auth.ts           # Authentication helpers
│   ├── prisma.ts         # Database client
│   ├── security.ts       # Security utilities
│   ├── validation.ts     # Input validation
│   └── ai.ts             # AI/ML utilities
├── middleware/            # Next.js middleware
└── models/                # Data models
```

## 🗄 Database Schema

### Core Models

**User**
- Role-based access (user, provider, admin)
- Profile management with verification
- Authentication with secure password hashing

**Service**
- Service offerings with detailed information
- Category-based organization
- Pricing and availability management
- Rating and review aggregation

**Booking**
- Complete booking lifecycle management
- Status tracking (pending → confirmed → in_progress → completed)
- Payment status integration
- Provider-user relationship management

**Review**
- Post-service feedback system
- Rating aggregation
- Provider reputation building

## 🔐 Authentication

The platform uses JWT-based authentication with the following features:

- **Registration**: User and provider registration with email verification
- **Login**: Secure login with password hashing (bcryptjs)
- **Profile Management**: User profile updates and verification
- **Role-Based Access**: Different permissions for users, providers, and admins
- **Session Management**: Secure token handling and refresh

## 🤖 AI Recommendations

The platform includes an AI-powered recommendation system:

- **Service Matching**: ML-based service recommendations
- **User Behavior Analysis**: Personalized suggestions
- **Provider Matching**: Smart provider recommendations
- **Hugging Face Integration**: State-of-the-art transformer models

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Services
- `GET /api/services` - List services with filtering
- `POST /api/services` - Create new service (providers only)
- `GET /api/services/[id]` - Get service details
- `PUT /api/services/[id]` - Update service (providers only)
- `DELETE /api/services/[id]` - Delete service (providers only)

### Bookings
- `GET /api/bookings` - List user bookings
- `POST /api/bookings` - Create new booking
- `GET /api/bookings/[id]` - Get booking details
- `PUT /api/bookings/[id]` - Update booking status

### Providers
- `GET /api/providers` - List service providers
- `GET /api/providers/[id]` - Get provider details

### Reviews
- `GET /api/reviews` - List service reviews
- `POST /api/reviews` - Create new review
- `PUT /api/reviews/[id]` - Update review

### Recommendations
- `GET /api/recommendations` - Get personalized recommendations

## 🧪 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npx prisma studio` - Open Prisma database browser

### Code Quality

The project uses:
- **ESLint**: Code linting and formatting
- **TypeScript**: Type safety and better developer experience
- **Prisma**: Type-safe database access
- **Zod**: Runtime type validation

### Security Features

- **Input Validation**: All inputs validated using Zod schemas
- **Password Hashing**: bcryptjs for secure password storage
- **JWT Security**: Secure token-based authentication
- **SQL Injection Protection**: Prisma ORM prevents SQL injection
- **CSRF Protection**: Built-in Next.js CSRF protection

## 🚀 Deployment

### Production Environment

1. **Environment Variables**
   ```env
   DATABASE_URL="postgresql://user:password@host:5432/database"
   JWT_SECRET="production-jwt-secret"
   NEXT_PUBLIC_API_URL="https://your-domain.com"
   ```

2. **Build and Deploy**
   ```bash
   npm run build
   npm start
   ```

3. **Database Migration**
   ```bash
   npx prisma migrate deploy
   ```

### Docker Production

```bash
docker-compose -f docker-compose.prod.yml up --build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use Prisma for all database operations
- Implement proper error handling
- Add validation for all inputs
- Write meaningful commit messages
- Test your changes thoroughly

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints

## 🔄 Changelog

### Version 0.1.0
- Initial release
- Basic authentication system
- Service booking functionality
- Provider management
- Review and rating system
- AI-powered recommendations
- Admin dashboard
- Docker support

---

**Built with ❤️ using Next.js, Prisma, and modern web technologies**