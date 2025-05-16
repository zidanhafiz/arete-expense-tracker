# Arete Expense Tracker API

A robust REST API for the Arete Expense Tracker application, built with Express.js, TypeScript, and MongoDB. This API provides comprehensive endpoints for managing personal finances, including expense tracking, income management, and financial analytics.

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Prerequisites](#-prerequisites)
- [Environment Variables](#-environment-variables)
- [Getting Started](#-getting-started)
- [Deployment](#-deployment)
- [Testing](#-testing)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)
- [Support](#-support)

## 🚀 Features

- **User Management**
  - Authentication and authorization
  - User profile management
  - Secure password handling
  - JWT-based authentication with refresh tokens
  - Password reset functionality

- **Expense Management**
  - Create, read, update, and delete expenses
  - Categorize expenses
  - Attach images to expenses
  - Filter expenses by date range
  - Bulk operations support

- **Income Management**
  - Track multiple income sources
  - Income history and details
  - Source-wise income breakdown
  - Image attachments support
  - Recurring income tracking

- **Analytics & Reporting**
  - Expense summaries by category
  - Income summaries by source
  - Net balance calculation
  - Transaction history
  - Date range filtering
  - Highest expense/income tracking
  - Average calculations
  - Monthly/yearly trends

- **File Management**
  - Image upload support
  - Cloudinary integration for media storage
  - Multiple file uploads
  - File validation

## 🛠️ Tech Stack

- Node.js
- Express.js
- TypeScript
- MongoDB with Mongoose
- Jest for testing
- Cloudinary for image storage
- Turbo for monorepo management
- Winston for logging
- Express-validator for validation

## 📋 Prerequisites

- Node.js (v18 or higher)
- pnpm package manager
- MongoDB instance
- Cloudinary account
- Git

## 🔧 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
PORT=8000
MONGODB_URI=your_mongodb_connection_string
SECRET_ACCESS_KEY=your_access_token_secret
SECRET_REFRESH_KEY=your_refresh_token_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
NODE_ENV=development
```

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd apps/api
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Run development server**
   ```bash
   pnpm dev
   ```

5. **Run tests**
   ```bash
   pnpm test
   ```

6. **Build for production**
   ```bash
   pnpm build
   ```

## 🚀 Deployment

### Production Build
1. Build the application:
   ```bash
   pnpm build
   ```

2. Start production server:
   ```bash
   pnpm start
   ```

### Docker Deployment
```dockerfile
# Dockerfile included in the repository
docker build -t arete-expense-api .
docker run -p 8000:8000 arete-expense-api
```

## 🧪 Testing

The project uses Jest for testing. Test files are located in the `src/__tests__` directory.

```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run tests in watch mode
pnpm test:watch
```

## 📦 Project Structure

```
src/
├── config/         # Configuration files
│   ├── database.ts
│   ├── cloudinary.ts
│   └── logger.ts
├── controllers/    # Route controllers
│   ├── auth.controllers.ts
│   ├── expense.controllers.ts
│   └── income.controllers.ts
├── middlewares/    # Custom middlewares
│   ├── auth.middleware.ts
│   └── validation.middleware.ts
├── models/         # Mongoose models
│   ├── user.models.ts
│   ├── expense.models.ts
│   └── income.models.ts
├── routes/         # API routes
│   ├── auth.routes.ts
│   └── expense.routes.ts
├── types/         # TypeScript type definitions
├── utils/         # Utility functions
└── __tests__/     # Test files
```

## 🔍 Monitoring

The API includes:
- Winston logging
- Performance monitoring
- Error tracking
- Request/Response logging

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Coding Standards
- Follow TypeScript best practices
- Write unit tests for new features
- Update documentation
- Follow ESLint rules

## 📝 License

This project is licensed under the MIT License.

### What you can do:
- ✅ Commercial use
- ✅ Modify the code
- ✅ Distribute the code
- ✅ Use privately
- ✅ Use in closed source projects

### Requirements:
- ℹ️ Include the original license
- ℹ️ Include copyright notice

### Limitations:
- ❌ No liability
- ❌ No warranty

The full license text can be found in the [LICENSE](LICENSE) file.

## 📞 Support

For support, please contact:
- Email: hrofiyani@gmail.com

---

<div align="center">

**[Website](https://arete-expense-tracker.com)** • 
**[Documentation](https://docs.arete-expense-tracker.com)**

Made with ❤️ by Zidan

</div>
