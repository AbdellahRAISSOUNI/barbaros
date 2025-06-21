# Database Seeding

## Overview

The Barbaros system includes a comprehensive database seeding utility that populates the database with sample data for development and testing purposes. This document explains the seeding process, the data that is created, and how to use the seeding utility.

## Seeding Process

The seeding process is implemented in the `src/lib/db/seed.ts` file. The process follows these steps:

1. Clear existing data from all collections (if requested)
2. Create sample data in the following order:
   - Admin users
   - Service categories
   - Services
   - Rewards
   - Clients
   - Visits

This order ensures that relationships between collections are properly maintained.

## Sample Data

### Admin Users

The seeding process creates the following admin users:

| Name | Email | Password | Role |
|------|-------|----------|------|
| Admin User | admin@barbaros.com | admin123 | owner |
| Barber 1 | barber1@barbaros.com | barber123 | barber |
| Receptionist | receptionist@barbaros.com | reception123 | receptionist |

### Service Categories

The following service categories are created:

| Name | Description | Display Order |
|------|-------------|---------------|
| Haircuts | All haircut services | 1 |
| Shaves | Beard and facial hair services | 2 |
| Treatments | Hair and scalp treatments | 3 |
| Packages | Service packages and combos | 4 |

### Services

Sample services are created for each category:

#### Haircuts Category
- Regular Haircut ($25, 30 mins)
- Premium Haircut ($35, 45 mins)

#### Shaves Category
- Classic Shave ($20, 25 mins)
- Beard Trim ($15, 20 mins)

#### Treatments Category
- Scalp Treatment ($30, 30 mins)
- Hair Coloring ($50, 60 mins)

#### Packages Category
- Haircut + Shave ($40, 50 mins)
- Full Service Package ($75, 90 mins)

### Rewards

The following rewards are created:

| Name | Description | Visits Required |
|------|-------------|----------------|
| Free Haircut | One free regular haircut | 10 |
| 50% Off Premium | Half price premium haircut | 5 |
| Free Beard Trim | One free beard trim | 3 |

### Clients

The seeding process creates 10 sample clients with randomized:
- Names
- Email addresses
- Phone numbers
- Visit counts
- Rewards earned/redeemed

### Visits

For each client, a random number of visits (0-10) are created with:
- Random services
- Random barbers
- Appropriate pricing
- Random dates within the last 6 months
- Occasional reward redemptions

## Using the Seeding Utility

### API Endpoint

The seeding utility can be accessed through the API endpoint:

```
POST /api/seed
```

With the following body:

```json
{
  "force": true
}
```

The `force` parameter is required to confirm the intention to seed the database, as this operation will clear existing data if requested.

### Web Interface

A web interface for seeding the database is available at:

```
/api/seed-test
```

This interface provides buttons for:
- Seeding the database
- Clearing the database
- Testing the database connection

### Programmatic Usage

The seeding utility can also be used programmatically:

```typescript
import { seedDatabase, clearDatabase } from '@/lib/db/seed';

// Seed the database
await seedDatabase();

// Clear the database
await clearDatabase();
```

## Customizing the Seed Data

To customize the seed data, you can modify the following functions in `src/lib/db/seed.ts`:

- `createAdmins()`: Modify to change admin users
- `createServiceCategories()`: Modify to change service categories
- `createServices()`: Modify to change services
- `createRewards()`: Modify to change rewards
- `createClients()`: Modify to change client data
- `createVisits()`: Modify to change visit data

## Best Practices

- Use the seeding utility only in development and testing environments
- Never run the seeding utility in production without proper safeguards
- Back up any important data before seeding
- Use the `force` parameter to prevent accidental data loss
- Customize the seed data to match your specific testing needs

## Next Steps

For more information on the database models and schema, see the [Data Models](./data-models.md) documentation. 