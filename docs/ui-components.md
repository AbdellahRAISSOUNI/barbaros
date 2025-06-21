# UI Components Documentation

## Overview

This document provides comprehensive documentation for all user interface components in the Barbaros Barbershop application, with special focus on the new **Collapsible Sidebar System** and responsive design patterns.

## Table of Contents

1. [Collapsible Sidebar System](#collapsible-sidebar-system)
2. [Enhanced UI Components](#enhanced-ui-components)
3. [Design System](#design-system)
4. [Responsive Design Patterns](#responsive-design-patterns)
5. [Animation Guidelines](#animation-guidelines)

## Collapsible Sidebar System

### ✨ CollapsibleSidebar Component

**Location**: `src/components/shared/CollapsibleSidebar.tsx`

The universal collapsible sidebar component that provides a smooth, animated navigation experience for both admin and client dashboards.

#### Key Features

- **Smooth Animations**: 300ms transitions with easing functions
- **State Persistence**: localStorage integration for session persistence
- **Mobile Responsive**: Overlay behavior on mobile, collapsible on desktop
- **Tooltip System**: Hover tooltips when collapsed
- **Beautiful Design**: Gradient backgrounds and modern styling

#### Props Interface

```typescript
interface CollapsibleSidebarProps {
  title: string;                    // Sidebar header title
  subtitle: string;                 // Sidebar header subtitle
  sections: NavigationSection[];    // Navigation sections
  onCollapsedChange?: (collapsed: boolean) => void; // Callback for state changes
}

interface NavigationSection {
  title: string;                    // Section title
  items: NavigationItem[];          // Navigation items
}

interface NavigationItem {
  href: string;                     // Navigation URL
  icon: React.ComponentType<{ className?: string }>; // Icon component
  label: string;                    // Display label
  exactMatch?: boolean;             // Exact path matching
}
```

#### Animation States

1. **Expanded State** (Default):
   - Width: 264px (`w-64`)
   - Full text labels visible
   - Section headers shown
   - Normal padding and spacing

2. **Collapsed State**:
   - Width: 80px (`w-20`)
   - Icon-only display
   - Text hidden with opacity transitions
   - Compact logo in header
   - Hover tooltips enabled

#### Mobile Behavior

- **Breakpoint**: `lg` (1024px)
- **Mobile**: Overlay sidebar with backdrop
- **Desktop**: Collapsible sidebar with toggle button
- **Touch Targets**: Optimized for mobile interaction

### AdminSidebar Component

**Location**: `src/components/shared/AdminSidebar.tsx`

Admin-specific implementation with navigation structure for business management.

### ClientSidebar Component

**Location**: `src/components/shared/ClientSidebar.tsx`

Client-specific implementation with client-focused navigation for loyalty and profile management.

## Enhanced UI Components

### VisitRecordingForm Component

**Location**: `src/components/ui/VisitRecordingForm.tsx`

Enhanced visit recording form with comprehensive responsive design improvements.

#### Key Enhancements

1. **Responsive Grid System**:
   - Mobile: Single column layout
   - Large (lg): 2-column layout  
   - Extra Large (xl): 3-column with service selection spanning 2 columns

2. **Text Handling Improvements**:
   - Service names: `truncate` and `line-clamp-2` for proper text wrapping
   - Responsive font sizes: `text-sm lg:text-base`
   - Smart overflow handling with `min-w-0` classes

3. **Enhanced Service Selection**:
   - Grid layout: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
   - Card layouts with responsive padding
   - Proper button sizing and spacing

### VisitHistoryView Component

**Location**: `src/components/ui/VisitHistoryView.tsx`

Enhanced visit history display with modern design and responsive improvements.

#### Key Features

1. **Statistics Cards**:
   - Gradient backgrounds with proper color theming
   - Responsive grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
   - Enhanced typography and spacing

2. **Improved Visit Details**:
   - Color-coded information sections
   - Better modal design with gradient headers
   - Enhanced service display with proper truncation

### ClientInfoCard Component

**Location**: `src/components/ui/ClientInfoCard.tsx`

Enhanced client information display with real data integration.

#### Improvements

1. **Loyalty Progress Integration**:
   - Real API data from `/api/loyalty/${clientId}`
   - Proper reward goal tracking
   - Enhanced progress indicators

2. **Visual Enhancements**:
   - Better typography and contrast
   - Crown icons and gradient backgrounds
   - Improved responsive spacing

## Design System

### Color Palette

#### Gradient Backgrounds

```css
/* Navigation active states */
.bg-gradient-to-r.from-black.to-gray-800

/* Statistics cards */
.bg-gradient-to-r.from-blue-50.to-blue-100    /* Blue theme */
.bg-gradient-to-r.from-green-50.to-green-100  /* Green theme */
.bg-gradient-to-r.from-purple-50.to-purple-100 /* Purple theme */
```

### Responsive Design Patterns

#### Grid Systems

```css
/* Statistics cards */
.grid.grid-cols-1.sm:grid-cols-2.lg:grid-cols-4

/* Service grids */
.grid.grid-cols-1.sm:grid-cols-2.lg:grid-cols-3

/* Form layouts */
.grid.grid-cols-1.lg:grid-cols-2.xl:grid-cols-3
```

#### Text Handling

```css
/* Single line truncation */
.truncate

/* Multi-line truncation */
.line-clamp-2

/* Overflow prevention */
.min-w-0
```

## Animation Guidelines

### Sidebar Animations

```css
/* Sidebar width transition */
.transition-all.duration-300.ease-in-out

/* Text fade transitions */
.transition-all.duration-300

/* Icon scaling */
.transition-all.duration-200
```

### Component Transitions

```css
/* Hover effects */
.transition-colors.duration-200

/* Modal animations */
.transition-opacity.duration-300
```

This documentation provides comprehensive coverage of the UI component system with emphasis on the new collapsible sidebar functionality and responsive design improvements.