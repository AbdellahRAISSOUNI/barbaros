# Barbershop Loyalty System

## Overview
A digital loyalty system for barbershops that tracks client visits and rewards frequent customers. The system uses QR codes to identify clients and provides an admin dashboard for barbers to manage client information and loyalty rewards.

## Core Features

### Client Management
- **Client Identification**: Each client receives a unique QR code
- **Client Profiles**: Store basic information (name, phone number)
- **Visit History**: Track haircut history, services received, and dates
- **Client Registration**: Self-service client registration and account management
- **Client Portal**: Simple dashboard for clients to view their visit history and loyalty progress

### Admin Panel
- **Secure Login**: Authentication for barbershop staff
- **Client Scanner**: Scan client QR codes via camera
- **Manual Entry**: Alternative methods to find clients (phone number, ID)
- **Client Management**: Full CRUD operations for client accounts
- **Service Management**: Create, edit, delete services with images
- **Visit Tracking**: Record new visits with detailed service selection
- **Client Creation**: Admin can create and manage client accounts directly

### Loyalty Program
- **Visit Counter**: Track number of client visits
- **Reward Milestones**: Free haircut after 6 visits
- **Status Levels**: Potential for different client tiers (Regular, Silver, Gold)
- **Custom Rewards**: Ability to assign special rewards
- **Reward Redemption**: Process for marking rewards as redeemed during visits

### Dashboard & Analytics
- **Client Statistics**: View frequent vs occasional clients
- **Popular Services**: Track most requested haircuts/services
- **Busy Periods**: Identify peak business times
- **Revenue Tracking**: Monitor earnings from services
- **Client Retention**: Track return rates and loyalty metrics

## Technical Architecture

### Frontend (Next.js + Tailwind CSS)
- **Landing Page**: Information about the barbershop and services
- **Admin Login**: Secure access to the admin system
- **Admin Dashboard**: Comprehensive management interface
- **Client Portal**: Simple interface for clients to view their information
- **QR Scanner**: Integrated camera functionality
- **Responsive Design**: Works on desktop and mobile devices

### Backend (Next.js API Routes)
- **Authentication**: JWT-based authentication for admin and clients
- **Client API**: CRUD operations for client data
- **Visit API**: Record and manage client visits
- **Loyalty API**: Calculate and manage reward status
- **Service API**: Manage service offerings and images

### Database (MongoDB)
- **Admin Collection**: Staff login credentials
- **Client Collection**: Client information, credentials, and unique IDs
- **Visit Collection**: Record of all client visits and services
- **Service Collection**: Available haircut types and services with images

## User Flows

### Client Registration Flow
1. Client accesses the registration page from landing page
2. Client enters basic information (name, phone, email, password)
3. System creates account and generates unique QR code
4. Client can download or save their QR code
5. Client can now log in to personal dashboard

### Client Dashboard Flow
1. Client logs in with credentials
2. System displays personal dashboard showing:
   - Current loyalty status and progress
   - QR code for download/viewing
   - Visit history with services received
   - Reward eligibility status
3. Client can download/print their QR code
4. Client can view detailed history of past visits

### New Client Flow (Admin-Created)
1. Admin creates new client profile with basic information
2. System generates unique QR code for client
3. QR code is displayed for client to save (screenshot or download)
4. First visit is recorded in the system
5. Admin can provide login credentials to client (if desired)

### Returning Client Flow
1. Client shows their QR code
2. Admin scans the QR code with the system
3. Client profile appears showing visit history and loyalty status
4. Admin selects services provided from service catalog
5. Admin records new visit with selected services
6. System updates loyalty status (progress toward free haircut)

### Reward Redemption Flow
1. Client reaches 6 visits (or other milestone)
2. System flags the account as eligible for free haircut
3. Admin confirms the reward redemption during next visit
4. Admin selects which service is being provided as a reward
5. System resets the visit counter or marks the reward as used
6. System updates client history to reflect redeemed reward

## Enhanced User Experience Features

### For Clients
- **Digital Loyalty Card**: QR code stored in phone gallery or wallet app
- **Progress Visibility**: Clear indication of progress toward next reward
- **Service History**: Record of previous haircuts and styles
- **Personal Dashboard**: Access to loyalty status and visit history
- **Self-Service Registration**: Create and manage their own account
- **Responsive Interface**: Mobile-optimized design with collapsible navigation

### For Barbers/Admins
- **Comprehensive Dashboard**: Complete management system with analytics
- **Collapsible Sidebar**: Smooth animated navigation with state persistence
- **Quick Identification**: Fast client lookup with QR scan
- **Client Preferences**: See client's previous haircuts and preferences
- **Efficient Reward Management**: Automated tracking of loyalty milestones
- **Service Management**: Maintain catalog of services with images and pricing
- **Visit Details**: Record specific services for each client visit
- **Client Management**: Create and manage client accounts directly
- **Enhanced Forms**: Responsive visit recording with improved layout
- **Better Data Display**: Enhanced statistics and history views

## Future Enhancement Possibilities
- **Online Appointment Booking**: Allow clients to schedule appointments
- **Client Photos**: Store before/after photos of haircuts
- **Payment Integration**: Link payment processing to client accounts
- **Additional Reward Types**: Birthday specials, referral bonuses
- **Marketing Tools**: Export client contact info for promotions









