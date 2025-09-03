# Barbaros System Diagrams

This directory contains comprehensive UML diagrams for the Barbaros Barber Shop Management System.

## Files

- `architecture.puml` - System architecture and technology stack diagram
- `use-case.puml` - Use case diagram showing system functionality and user interactions
- `sequence.puml` - Sequence diagrams for key workflows and processes
- `class.puml` - Comprehensive class diagram showing system structure and relationships

## Architecture Overview

The Barbaros system is built using modern web technologies with a focus on:

### Frontend Technologies
- **React 19.0.0** with **Next.js 15.3.4** for the UI framework
- **TypeScript 5** for type safety
- **TailwindCSS 4** for styling
- **Framer Motion**, **GSAP**, and **Lottie** for animations
- **React Query** for state management
- **QR Code scanning** capabilities

### Backend Technologies
- **Next.js API Routes** for serverless functions
- **MongoDB** with **Mongoose ODM** for database operations
- **NextAuth.js** for authentication
- **Chart.js** for analytics visualization
- **File processing** with PDF and Excel export capabilities

### Security & Authentication
- **JWT-based authentication** with NextAuth.js
- **Role-based access control** (Admin, Barber, Client)
- **Password hashing** with bcryptjs
- **Rate limiting** and security headers

### Infrastructure
- **Vercel** for deployment and hosting
- **MongoDB Atlas** for cloud database
- **Environment-based configuration**
- **HTTPS/SSL** security

## How to View the Diagram

### Option 1: PlantUML Online Server
1. Copy the contents of `architecture.puml`
2. Go to [PlantUML Online Server](http://www.plantuml.com/plantuml/uml/)
3. Paste the code and click "Submit"

### Option 2: VS Code Extension
1. Install the "PlantUML" extension in VS Code
2. Open `architecture.puml`
3. Press `Alt+D` to preview the diagram

### Option 3: Local PlantUML Installation
1. Install PlantUML locally
2. Run: `plantuml architecture.puml`
3. This will generate a PNG/SVG file

## System Architecture Highlights

1. **Multi-Role System**: Supports Admin/Owner, Barber, and Client roles with different interfaces
2. **Real-time Features**: Live analytics and updates using React Query
3. **Scanner Integration**: QR code scanning for quick client identification
4. **File Processing**: PDF reports, Excel exports, and image transformations
5. **Modern UI/UX**: Responsive design with animations and smooth interactions
6. **Security First**: Comprehensive authentication and authorization system
7. **Scalable Infrastructure**: Built for cloud deployment with optimization

The architecture follows modern web development best practices with separation of concerns, secure authentication, and scalable design patterns.

## Diagram Descriptions

### 1. Architecture Diagram (`architecture.puml`)
Shows the complete technology stack and system architecture including:
- Frontend technologies (React, Next.js, TailwindCSS)
- Backend services and API structure
- Database layer (MongoDB with Mongoose)
- Authentication and security systems
- External services and infrastructure
- Development tools and deployment pipeline

### 2. Use Case Diagram (`use-case.puml`)
Illustrates all system functionalities organized by user roles:
- **Guest Users**: Landing page, gallery, guest reservations
- **Clients**: Dashboard, QR codes, loyalty tracking, reservations
- **Barbers**: Scanner interface, visit recording, client management
- **Admins/Owners**: Complete system management, analytics, reports
- **Security Features**: Authentication, authorization, data protection

### 3. Sequence Diagram (`sequence.puml`)
Details key workflow processes:
- **Client Registration & Authentication**: Complete signup and login flow
- **QR Code Visit Recording**: Barber scanning client codes and recording visits
- **Admin Analytics Dashboard**: Real-time data aggregation and visualization
- **Guest Reservation Flow**: Non-registered user booking process
- **Loyalty Reward Redemption**: Client reward selection and redemption
- **Service Management**: Admin creating and managing services
- **Error Handling & Security**: Rate limiting, authentication, and error management

### 4. Class Diagram (`class.puml`)
Comprehensive system structure including:
- **Core User Classes**: Admin, Client with all properties and methods
- **Service Management**: ServiceCategory, Service with relationship mappings
- **Visit System**: Visit, ServiceReceived with transaction tracking
- **Reservation System**: Complete booking and management structure
- **Reward Systems**: Client rewards and barber incentive programs
- **Statistics & Analytics**: BarberStats, performance tracking
- **API Layer**: Service classes for all major functionalities
- **Security & Database**: Authentication, caching, and connection management

## Technical Features Highlighted

### Authentication & Security
- JWT-based authentication with NextAuth.js
- Role-based access control (Client, Barber, Receptionist, Admin/Owner)
- Password hashing with bcryptjs
- Rate limiting and security headers
- Session management and CSRF protection

### Database Design
- MongoDB with Mongoose ODM
- Optimized indexes for performance
- Connection pooling and caching
- Data validation and error handling
- Backup and restore capabilities

### Real-time Features
- Live analytics and dashboard updates
- Real-time reservation notifications
- QR code scanning with camera integration
- Push notifications for rewards and updates

### Business Logic
- Comprehensive loyalty program with tier progression
- Automated reward calculations and eligibility tracking
- Visit recording with service and revenue tracking
- Analytics and reporting for business insights
- Multi-role workflow management
