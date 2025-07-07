# Service Management System

## Overview

The Service Management System is a comprehensive solution for managing barbershop services and categories through the admin dashboard. It provides complete CRUD operations, image management, search functionality, and responsive design optimized for both desktop and mobile use.

## Features

### 🎯 Core Functionality

- **Service Categories Management**: Create, edit, delete, and organize service categories
- **Service Management**: Full CRUD operations for services with rich metadata
- **Image Upload & Storage**: Direct image upload with MongoDB storage
- **Search & Filtering**: Real-time search and advanced filtering options
- **Status Management**: Toggle active/inactive status for services and categories
- **Responsive Design**: Mobile-first design that works on all devices

### 🖼️ Image Management

- **Direct Upload**: Upload images directly through the admin interface
- **MongoDB Storage**: Images stored as base64 data in MongoDB for simplified deployment
- **Size Validation**: 5MB maximum file size with validation
- **Format Support**: JPG, PNG, WebP image formats supported
- **Preview**: Real-time image preview during upload and editing

### 🔍 Search & Filtering

- **Text Search**: Search services by name and description
- **Category Filter**: Filter services by specific categories
- **Status Filter**: Show only active or inactive services
- **Real-time Results**: Instant search results as you type
- **Clear Filters**: Easy filter reset functionality

### 📱 Responsive Design

- **Mobile-First**: Optimized for mobile devices
- **Adaptive Layout**: Grid layout adjusts to screen size
- **Touch-Friendly**: Large buttons and touch targets
- **Modal Forms**: Full-screen modals on mobile devices

## User Interface

### Service Management Tab

#### Service Grid Layout
- **Card View**: Each service displayed as a card with image, details, and actions
- **Service Image**: Large image preview with fallback icon
- **Service Info**: Name, description, price, duration, and category
- **Status Indicator**: Visual active/inactive status badge
- **Action Buttons**: Edit and delete buttons for each service

#### Search & Filter Bar
- **Search Input**: Real-time search with search icon
- **Category Dropdown**: Filter by specific categories
- **Status Dropdown**: Filter by active/inactive status
- **Clear Filters**: Reset all filters button
- **Add Service Button**: Primary action button

#### Service Form Modal
- **Image Upload Section**: Drag-and-drop or click to upload
- **Service Details**: Name, description, price, duration
- **Category Selection**: Dropdown with active categories
- **Status Toggle**: Active/inactive checkbox (for editing)
- **Validation**: Real-time form validation with error messages

### Category Management Tab

#### Category List Layout
- **List View**: Categories displayed in expandable cards
- **Category Info**: Name, description, display order, creation date
- **Status Badge**: Visual active/inactive indicator
- **Inline Actions**: Toggle status, edit, and delete buttons

#### Category Form Modal
- **Simple Form**: Name, description, and display order
- **Display Order**: Numeric input for custom sorting
- **Status Toggle**: Active/inactive checkbox (for editing)
- **Validation**: Required field validation

## API Integration

### Service Endpoints

```typescript
// List services with pagination and filtering
GET /api/services?page=1&limit=10&search=haircut&categoryId=123&isActive=true

// Create new service
POST /api/services
{
  "name": "Premium Haircut",
  "description": "Premium haircut with styling",
  "price": 45,
  "durationMinutes": 45,
  "categoryId": "...",
  "imageData": "data:image/jpeg;base64,..."
}

// Update service
PUT /api/services/:id

// Delete service
DELETE /api/services/:id

// Toggle service status
PATCH /api/services/:id?action=toggle-status
```

### Category Endpoints

```typescript
// List categories
GET /api/service-categories?page=1&limit=10&search=hair&activeOnly=true

// Create category
POST /api/service-categories
{
  "name": "Beard Services",
  "description": "Beard trimming and grooming services",
  "displayOrder": 2
}

// Update category
PUT /api/service-categories/:id

// Delete category
DELETE /api/service-categories/:id

// Toggle category status
PATCH /api/service-categories/:id?action=toggle-status
```

## Technical Implementation

### Frontend Components

#### Component Structure
```
src/components/admin/services/
├── ServicesTab.tsx          # Main services management interface
├── ServiceForm.tsx          # Service create/edit modal form
├── CategoriesTab.tsx        # Categories management interface
└── CategoryForm.tsx         # Category create/edit modal form
```

#### State Management
- **React Hooks**: useState and useEffect for local state
- **API Integration**: Fetch API for backend communication
- **Form Handling**: Controlled components with validation
- **Loading States**: Skeleton loaders and loading indicators

#### Error Handling
- **Toast Notifications**: Success and error feedback using react-hot-toast
- **Form Validation**: Client-side validation with error messages
- **API Error Handling**: Graceful error handling with user-friendly messages
- **Network Resilience**: Retry functionality and timeout handling

### Backend Implementation

#### Database Models
- **Service Model**: Enhanced with image storage and popularity tracking
- **ServiceCategory Model**: With display ordering and status management
- **Indexes**: Optimized for search and filtering operations

#### API Layer
- **RESTful Endpoints**: Standard HTTP methods for CRUD operations
- **Validation**: Server-side validation with detailed error messages
- **Search**: MongoDB regex queries for text search
- **Pagination**: Efficient pagination with total count
- **Image Processing**: Base64 encoding for MongoDB storage

#### Security
- **Input Validation**: Sanitization and validation of all inputs
- **File Upload Security**: Type and size validation for images
- **UTF-8 Safety**: Proper string handling to prevent encoding errors
- **Admin Authentication**: Protected routes requiring admin access

## Usage Guide

### Managing Services

#### Creating a New Service
1. Navigate to Admin → Services
2. Click "Add Service" button
3. Fill in service details:
   - **Name**: Enter service name (required)
   - **Description**: Provide detailed description (required)
   - **Price**: Set price in MAD (required, min: 0)
   - **Duration**: Set duration in minutes (required, min: 1)
   - **Category**: Select from available categories (required)
   - **Image**: Upload service image (optional, max 5MB)
4. Click "Create Service"

#### Editing a Service
1. Find the service in the grid
2. Click the "Edit" button
3. Modify any fields as needed
4. Update image if desired
5. Toggle active status if needed
6. Click "Update Service"

#### Deleting a Service
1. Find the service in the grid
2. Click the delete (trash) button
3. Confirm deletion in the popup
4. Service will be permanently removed

#### Managing Service Status
- Click the eye icon on any service card to toggle active/inactive status
- Active services show a green eye icon
- Inactive services show a red crossed-eye icon

### Managing Categories

#### Creating a New Category
1. Navigate to Admin → Services → Categories tab
2. Click "Add Category" button
3. Fill in category details:
   - **Name**: Enter unique category name (required)
   - **Description**: Provide category description (required)
   - **Display Order**: Set sort order (optional, default: 0)
4. Click "Create Category"

#### Editing a Category
1. Find the category in the list
2. Click the edit button
3. Modify fields as needed
4. Adjust display order for sorting
5. Toggle active status if needed
6. Click "Update Category"

#### Managing Display Order
- Lower numbers appear first in lists
- Use display order to control category presentation
- Services inherit category ordering

### Search and Filtering

#### Text Search
- Type in the search box to find services by name or description
- Search is case-insensitive and searches both fields
- Results update in real-time as you type

#### Category Filtering
- Select a category from the dropdown to show only services in that category
- "All Categories" shows services from all categories

#### Status Filtering
- Select "Active" to show only active services
- Select "Inactive" to show only inactive services
- "All Status" shows all services regardless of status

#### Clearing Filters
- Click the "Clear" button to reset all filters
- This will show all services and clear the search box

## Best Practices

### Service Management
- **Consistent Naming**: Use clear, descriptive service names
- **Detailed Descriptions**: Provide comprehensive service descriptions
- **Appropriate Pricing**: Set competitive and accurate pricing
- **Realistic Durations**: Set realistic service durations
- **Quality Images**: Use high-quality, professional service images

### Category Organization
- **Logical Grouping**: Group related services together
- **Clear Names**: Use intuitive category names
- **Proper Ordering**: Order categories by importance or frequency
- **Regular Review**: Periodically review and update categories

### Image Guidelines
- **File Size**: Keep images under 2MB for optimal performance
- **Dimensions**: Use consistent aspect ratios (recommended: 16:9 or 4:3)
- **Quality**: Use high-resolution images that look good on mobile
- **Format**: Prefer JPG for photos, PNG for graphics with transparency

### Performance Optimization
- **Pagination**: Use pagination for large service lists
- **Search Optimization**: Use specific search terms for better performance
- **Image Optimization**: Compress images before upload
- **Regular Cleanup**: Remove unused services and categories

## Troubleshooting

### Common Issues

#### Image Upload Fails
- **Check File Size**: Ensure image is under 5MB
- **Check Format**: Use JPG, PNG, or WebP formats only
- **Network Issues**: Check internet connection
- **Browser Compatibility**: Try a different browser

#### Services Not Appearing
- **Check Active Status**: Ensure service is set to active
- **Check Category**: Verify category is active
- **Clear Filters**: Reset search and filters
- **Refresh Page**: Try refreshing the browser

#### Search Not Working
- **Check Spelling**: Verify search terms are spelled correctly
- **Try Partial Terms**: Use partial words instead of full phrases
- **Clear Filters**: Reset other filters that might conflict
- **Case Sensitivity**: Search is case-insensitive

#### Form Validation Errors
- **Required Fields**: Ensure all required fields are filled
- **Number Formats**: Use proper number formats for price and duration
- **Category Selection**: Ensure a category is selected
- **Image Size**: Check image file size and format

### Getting Help

If you encounter issues not covered in this guide:

1. **Check Console**: Open browser developer tools for error messages
2. **Check Network**: Verify internet connection and API responses
3. **Clear Cache**: Clear browser cache and refresh
4. **Restart Server**: If developing, restart the development server
5. **Contact Support**: Reach out to technical support with error details

## Future Enhancements

### Planned Features
- **Service Analytics**: Detailed popularity and usage analytics
- **Bulk Operations**: Bulk edit/delete for multiple services
- **Export/Import**: CSV export and import functionality
- **Service Templates**: Pre-defined service templates
- **Advanced Search**: More sophisticated search with filters
- **Image Optimization**: Automatic image compression and resizing

### Analytics Integration
- **Popularity Tracking**: The `popularityScore` field is ready for analytics
- **Visit Integration**: Track which services are most requested
- **Revenue Analytics**: Calculate revenue per service
- **Trend Analysis**: Identify trending services over time

This service management system provides a solid foundation for managing barbershop services with room for future enhancements and scaling. 