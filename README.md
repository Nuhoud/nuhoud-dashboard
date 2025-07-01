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

## 🔐 Test Credentials

For development and testing purposes, you can use these credentials:

### Admin Access
- **Email:** admin@nuhoud.com
- **Password:** admin123456
- **Access:** Full admin dashboard with user management, job offers, and applications

### Employer Access
- **Email:** employer@nuhoud.com
- **Password:** employer123456
- **Access:** Employer dashboard for job posting and applicant management

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── MainLayout.js   # Main application layout
│   ├── Sidebar.js      # Navigation sidebar
│   └── Topbar.js       # Top navigation bar
├── pages/              # Page components
│   ├── Login.js        # Authentication page
│   ├── admin/          # Admin-specific pages
│   └── employer/       # Employer-specific pages
├── services/           # API services
│   └── api.js         # API client and endpoints
├── config/            # Configuration files
│   └── environment.js # Environment configuration
└── routes/            # Routing configuration
    └── ProtectedRoute.js
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
# Development
REACT_APP_API_URL_MAIN=http://localhost:3000
REACT_APP_API_URL_JOBS=http://localhost:3000

# Production
REACT_APP_API_URL_MAIN=https://api.nuhoud.com
REACT_APP_API_URL_JOBS=https://jobs-api.nuhoud.com
```

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

## 📞 Support

For technical support or questions, please contact the development team.

## 📄 License

This project is proprietary software for the NUHOUD platform.

---

**Note:** This is a development version with mock authentication. For production deployment, ensure proper backend integration and security measures are in place.
