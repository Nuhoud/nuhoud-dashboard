#!/bin/bash

# NUHOUD Dashboard Production Deployment Script
# This script automates the deployment process for production

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 16 or higher."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm."
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        print_warning "Docker is not installed. Docker deployment will be skipped."
        DOCKER_AVAILABLE=false
    else
        DOCKER_AVAILABLE=true
    fi
    
    print_success "Dependencies check completed"
}

# Check Node.js version
check_node_version() {
    print_status "Checking Node.js version..."
    
    NODE_VERSION=$(node -v | cut -d'v' -f2)
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1)
    
    if [ "$NODE_MAJOR" -lt 16 ]; then
        print_error "Node.js version $NODE_VERSION is not supported. Please upgrade to Node.js 16 or higher."
        exit 1
    fi
    
    print_success "Node.js version $NODE_VERSION is supported"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    if [ -f "package-lock.json" ]; then
        npm ci
    else
        npm install
    fi
    
    print_success "Dependencies installed successfully"
}

# Run linting and tests
run_quality_checks() {
    print_status "Running quality checks..."
    
    # Run linting
    print_status "Running ESLint..."
    npm run lint
    
    # Run tests
    print_status "Running tests..."
    npm run test:coverage
    
    print_success "Quality checks passed"
}

# Build for production
build_production() {
    print_status "Building for production..."
    
    # Set production environment
    export NODE_ENV=production
    export REACT_APP_ENVIRONMENT=production
    export REACT_APP_DEBUG=false
    
    # Build the application
    npm run build:prod
    
    print_success "Production build completed"
}

# Deploy using Docker
deploy_docker() {
    if [ "$DOCKER_AVAILABLE" = false ]; then
        print_warning "Skipping Docker deployment (Docker not available)"
        return
    fi
    
    print_status "Deploying with Docker..."
    
    # Build Docker image
    docker build -t nuhoud-dashboard:latest .
    
    # Stop existing containers
    docker-compose down || true
    
    # Start services
    docker-compose up -d
    
    print_success "Docker deployment completed"
}

# Deploy to static hosting
deploy_static() {
    print_status "Preparing for static hosting deployment..."
    
    if [ ! -d "build" ]; then
        print_error "Build directory not found. Please run the build first."
        exit 1
    fi
    
    print_success "Build directory ready for deployment"
    print_status "You can now upload the 'build' directory to your hosting provider"
}

# Health check
health_check() {
    print_status "Performing health check..."
    
    # Wait for services to start
    sleep 10
    
    # Check if the application is responding
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        print_success "Application is healthy and responding"
    else
        print_warning "Health check failed. Application may still be starting up."
    fi
}

# Main deployment function
main() {
    echo "=========================================="
    echo "  NUHOUD Dashboard Production Deployment"
    echo "=========================================="
    echo ""
    
    # Parse command line arguments
    DEPLOYMENT_TYPE=${1:-"static"}
    
    case $DEPLOYMENT_TYPE in
        "docker")
            print_status "Starting Docker deployment..."
            check_dependencies
            check_node_version
            install_dependencies
            run_quality_checks
            build_production
            deploy_docker
            health_check
            ;;
        "static")
            print_status "Starting static deployment..."
            check_dependencies
            check_node_version
            install_dependencies
            run_quality_checks
            build_production
            deploy_static
            ;;
        "build-only")
            print_status "Building only..."
            check_dependencies
            check_node_version
            install_dependencies
            run_quality_checks
            build_production
            ;;
        *)
            print_error "Invalid deployment type. Use: docker, static, or build-only"
            echo "Usage: $0 [docker|static|build-only]"
            exit 1
            ;;
    esac
    
    echo ""
    print_success "Deployment completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Configure your domain and SSL certificates"
    echo "2. Set up monitoring and logging"
    echo "3. Configure backup strategies"
    echo "4. Set up CI/CD pipelines"
    echo ""
}

# Run main function with all arguments
main "$@" 