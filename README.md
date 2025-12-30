# NUHOUD Dashboard

A modern React-based dashboard for the NUHOUD platform, providing admin and employer interfaces for job portal management.

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm start
```

The application will be available at `http://localhost:3001`

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Development (via local nginx reverse proxy)
REACT_APP_API_URL_MAIN=http://localhost/Nuhoud
REACT_APP_API_URL_JOBS=http://localhost/NuhoudJob

# Development (direct to services, without nginx)
# REACT_APP_API_URL_MAIN=http://localhost:3000
# REACT_APP_API_URL_JOBS=http://localhost:4000

# Production
REACT_APP_API_URL_MAIN=https://api.nuhoud.com
REACT_APP_API_URL_JOBS=https://jobs-api.nuhoud.com
```

Optional: set `REACT_APP_ENVIRONMENT=production|development|test` to select the config block used in `src/config/environment.js`.

## 🚀 Production Deployment

### Docker Deployment

```bash
# Build the application
docker build -t nuhoud-dashboard .

# Run with docker-compose
docker-compose up -d
```

### Manual Deployment

```bash
# Build for production
npm run build

# Deploy the build folder to your web server
```

## 📋 Features

### Admin Dashboard

- User management (create, view, update, delete)
- Job offers management
- Application tracking
- Analytics and reporting
- System configuration

### Employer Dashboard

- Job posting and management
- Applicant tracking
- Profile management
- Job analytics

### Authentication

- Role-based access control
- JWT token authentication
- Secure login/logout
- Password validation

## 🛠️ Development

### Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run deploy` - Deploy to production

### Code Style

This project uses ESLint for code quality. Run `npm run lint` to check for issues.

## 🔒 Security

- JWT token-based authentication
- Role-based access control
- Input validation and sanitization
- Secure API communication
- Environment-based configuration

## 📱 Responsive Design

The dashboard is fully responsive and works on:

- Desktop computers
- Tablets
- Mobile devices

## 🎨 UI/UX Features

- Modern Material-UI design
- Dark/light theme support
- Smooth animations and transitions
- Intuitive navigation
- Loading states and error handling

## 🔄 API Integration

The dashboard integrates with:

- Main backend API (port 3000)
- Job portal service API (port 4000)
- File upload service
- Email notification service
