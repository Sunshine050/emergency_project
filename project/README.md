# Emergency Response System Backend (1669 Thailand)

This NestJS backend serves as the foundation for the 1669 Thailand Emergency Response System, designed to connect patients, emergency response centers, hospitals, and rescue teams through a secure, real-time platform.

## Tech Stack

- **NestJS**: Main backend framework
- **PostgreSQL**: Database
- **Prisma**: ORM for database interactions
- **Supabase**: For OAuth 2.0 authentication (Google, Facebook, Apple)
- **Socket.IO**: Real-time communication for emergency notifications

## User Types

The system supports four main types of users:

1. **General Users / Patients**: Can request emergency assistance
2. **1669 Emergency Response Center**: Coordinates emergency responses
3. **Hospitals**: Receive and manage emergency cases
4. **Rescue Teams**: Respond to emergencies on the ground

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- PostgreSQL database
- Supabase account with OAuth providers configured

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and configure environment variables
4. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```
5. Start the development server:
   ```bash
   npm run start:dev
   ```

## Project Structure

```
src/
├── auth/               # Authentication module (OAuth2 via Supabase)
├── user/               # User management module
├── sos/                # Emergency request handling
├── hospital/           # Hospital management
├── rescue/             # Rescue team management
├── dashboard/          # Admin & stats dashboard
├── notification/       # Real-time notifications (Socket.IO)
├── prisma/             # Database connection & models
└── common/             # Shared utilities, filters, guards, etc.
```

## Key Features

- OAuth 2.0 authentication via Supabase
- Role-based access control
- Real-time emergency notifications
- Geolocation-based emergency response
- Hospital capacity management
- Rescue team status and availability tracking
- Comprehensive admin dashboard and reporting

## API Documentation

The API follows RESTful conventions with these main endpoints:

- `/api/auth/*`: Authentication endpoints
- `/api/users/*`: User management
- `/api/sos/*`: Emergency request endpoints
- `/api/hospitals/*`: Hospital management
- `/api/rescue-teams/*`: Rescue team management
- `/api/dashboard/*`: Statistics and reporting
- `/api/notifications/*`: User notifications

## Socket.IO Events

Real-time communication uses these main event channels:

- `emergency`: Broadcasts new emergency requests
- `status-update`: Updates on emergency status changes
- `assignment`: Notifies teams of new assignments
- `location-update`: Real-time location updates for rescue teams

## Authentication Flow

1. Frontend initiates OAuth flow via `/api/auth/login` with desired provider
2. User is redirected to provider (Google, Facebook, Apple)
3. After authentication, provider redirects to our callback URL
4. Backend exchanges code for tokens and creates/updates user record
5. JWT token is issued for subsequent API calls

## License

This project is privately licensed and not for distribution.