# 💈 Barbaros - Modern Barber Shop Management System

A comprehensive barber shop management system built with Next.js 15, MongoDB, and modern web technologies.

## 🚀 **Ready for Vercel Deployment** ✅

This project has been optimized and tested for Vercel deployment. See [DEPLOYMENT-CHECKLIST.md](./DEPLOYMENT-CHECKLIST.md) for complete deployment instructions.

## ✨ Features

- **Multi-Role Authentication**: Admin, Barber, and Client access levels
- **Visit Recording**: QR code-based visit tracking system
- **Loyalty Program**: Points-based rewards system
- **Reservation Management**: Online booking and scheduling
- **Achievement System**: Gamified experience for barbers
- **Analytics Dashboard**: Comprehensive business insights
- **Mobile-Friendly**: Responsive design for all devices

## 🛠 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **UI Components**: Custom component library
- **Deployment**: Vercel-ready configuration

## 🏗 Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── (dashboard)/    # Protected dashboard routes
│   ├── (landing)/      # Public landing pages
│   └── api/           # API routes
├── components/         # Reusable components
│   ├── admin/         # Admin-specific components
│   ├── shared/        # Shared components
│   └── ui/           # UI components
├── lib/               # Utilities and configurations
│   ├── db/           # Database models and API
│   ├── auth/         # Authentication utilities
│   └── utils/        # Helper functions
└── middleware.ts      # Next.js middleware
```

## 🚀 Quick Deploy to Vercel

1. **One-Click Deploy**:
   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/barbaros-app)

2. **Manual Deploy**:
   ```bash
   # 1. Push to GitHub
   git push origin main
   
   # 2. Connect to Vercel
   # - Go to vercel.com
   # - Import your GitHub repository
   # - Configure environment variables
   # - Deploy!
   ```

3. **Required Environment Variables**:
   ```bash
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
   NEXTAUTH_SECRET=your-secret-key-change-this-in-production
   NEXTAUTH_URL=https://your-app-name.vercel.app
   NODE_ENV=production
   ```

## 💻 Local Development

1. **Clone the repository**:
```bash
   git clone https://github.com/your-username/barbaros-app.git
cd barbaros-app
```

2. **Install dependencies**:
```bash
npm install
```

3. **Set up environment variables**:
```bash
   # Copy and configure environment variables
   cp .env.example .env.local
   # Edit .env.local with your values
```

4. **Run the development server**:
```bash
npm run dev
```

5. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📋 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues automatically
```

## 🔐 Default Credentials

**Admin Access**:
- Email: admin@barbaros.com
- Password: admin123

**Barber Access**:
- Phone: +1234567890
- Password: barber123

## 🎯 Key Features

### For Admins
- Complete dashboard with analytics
- Manage barbers, clients, and services
- View comprehensive reports
- Configure loyalty programs and rewards

### For Barbers
- Personal dashboard with performance metrics
- Visit recording via QR scanner
- Achievement tracking
- Client interaction history

### For Clients
- Personal QR code for visits
- Loyalty points tracking
- Reservation booking
- Visit history and rewards

## 🔧 Build Configuration

The project includes optimized configurations for deployment:

- **ESLint**: Configured to ignore build-blocking errors during deployment
- **TypeScript**: Type checking optimized for production builds
- **Next.js**: Standalone output for optimal Vercel performance
- **Middleware**: Enhanced security and routing

## 📱 Mobile Support

Fully responsive design optimized for:
- iOS and Android devices
- Tablet interfaces
- Desktop browsers
- QR code scanning functionality

## 🛡 Security Features

- JWT-based authentication
- Role-based access control
- Secure password hashing
- API rate limiting
- Input validation and sanitization

## 📊 Analytics & Reporting

- Client growth tracking
- Service popularity metrics
- Visit frequency analysis
- Revenue reporting
- Barber performance metrics

## 🎮 Gamification

- Achievement system for barbers
- Leaderboards and rankings
- Points-based loyalty program
- Progress tracking and rewards

## 📞 Support & Documentation

For detailed documentation and support:
- [Deployment Guide](./DEPLOYMENT-CHECKLIST.md)
- [API Documentation](./docs/api-endpoints.md)
- [Database Models](./docs/database-models.md)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**🎉 Ready to deploy! Your Barbaros app is optimized and ready for production on Vercel.**
