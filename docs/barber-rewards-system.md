# Barber Rewards System Documentation

## Overview
The Barber Rewards System is a comprehensive incentive program designed to recognize and reward barbers for their achievements, loyalty, and performance. The system tracks various metrics including visit counts, client retention, work duration, and more to automatically award rewards to eligible barbers.

## Database Models

### BarberReward Model
```typescript
interface IBarberReward {
  _id: ObjectId;
  name: string;                // Name of the reward
  description: string;         // Detailed description
  rewardType: 'monetary' | 'gift' | 'time_off' | 'recognition';  // Type of reward
  rewardValue: string;         // Value/benefit of the reward
  requirementType: 'visits' | 'clients' | 'months_worked' | 'client_retention' | 'custom';
  requirementValue: number;    // Numerical target to achieve
  requirementDescription: string; // Human-readable requirement description
  category: string;           // Category for grouping rewards
  icon: string;              // Icon identifier for UI
  color: string;             // Color theme for UI
  priority: number;          // Display/importance priority
  isActive: boolean;         // Whether reward is currently available
  createdAt: Date;
  updatedAt: Date;
}
```

### BarberRewardRedemption Model
```typescript
interface IBarberRewardRedemption {
  _id: ObjectId;
  barberId: ObjectId;        // Reference to Admin (barber)
  rewardId: ObjectId;        // Reference to BarberReward
  status: 'earned' | 'redeemed';
  earnedAt: Date;           // When the reward was earned
  redeemedAt?: Date;        // When the reward was redeemed
  redeemedBy?: ObjectId;    // Admin who processed the redemption
  notes?: string;           // Optional redemption notes
  progressAtEarning: {      // Snapshot of metrics when earned
    totalVisits: number;
    uniqueClients: number;
    monthsWorked: number;
    clientRetentionRate: number;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

## API Endpoints

### Admin Endpoints

#### GET /api/admin/barber-rewards
- Lists all barber rewards
- Supports filtering by category, status, and type
- Returns active and inactive rewards for admin management

#### POST /api/admin/barber-rewards
- Creates a new barber reward
- Requires admin authentication
- Body includes all reward details except `isActive` (defaults to true)

#### GET /api/admin/barber-rewards/:id
- Retrieves detailed information about a specific reward
- Includes redemption statistics

#### PUT /api/admin/barber-rewards/:id
- Updates an existing reward
- Can modify requirements, values, or deactivate the reward

#### GET /api/admin/barber-rewards/redemptions
- Lists all reward redemptions
- Supports filtering by status, date range, and barber

#### POST /api/admin/barber-rewards/:id/redeem
- Processes a reward redemption
- Requires admin authentication
- Body includes optional redemption notes

### Barber Endpoints

#### GET /api/barber/rewards
- Lists rewards available to the authenticated barber
- Shows progress towards each reward
- Includes earned but unredeemed rewards

#### GET /api/barber/rewards/progress
- Returns detailed progress information for all rewards
- Includes:
  - Current progress values
  - Percentage completion
  - Time-based progress displays
  - Earned/redeemed status

## Progress Tracking

### Duration Progress Calculation
The system uses a sophisticated duration tracking system that:
- Calculates exact days worked
- Converts to a human-readable format (e.g., "1 year, 2 months, 5 days")
- Provides accurate percentage progress based on days rather than months
- Handles various time formats:
  ```typescript
  {
    totalDays: number;      // Total days worked
    months: number;         // Complete months worked
    remainingDays: number;  // Days beyond complete months
    displayText: string;    // Formatted display text
    requiredDays: number;   // Total days required
    progressPercentage: number; // Progress as percentage
  }
  ```

### Progress Calculation Methods
```typescript
// Example for duration-based rewards
const durationProgress = calculateDurationProgress(joinDate, requirementMonths);
progressPercentage = (totalDaysWorked / requiredDays) * 100;

// Example for visit-based rewards
progressPercentage = (currentVisits / requiredVisits) * 100;
```

## UI Components

### Progress Display
- Progress bars showing percentage completion
- Color-coded status indicators
- Time-based progress with detailed breakdowns
- Reward cards with:
  - Icon and category
  - Progress information
  - Redemption status
  - Action buttons for eligible rewards

### Reward Categories
- Monetary Rewards
- Gift Rewards
- Time-off Benefits
- Recognition Awards

## Automatic Progress Updates

The system automatically:
1. Tracks barber statistics daily
2. Updates progress towards rewards
3. Marks rewards as earned when requirements are met
4. Notifies barbers of newly earned rewards
5. Maintains historical data of achievements

## Security and Validation

### Access Control
- Admin-only endpoints for reward management
- Barber-specific endpoints for viewing and tracking progress
- Validation of redemption eligibility
- Prevention of duplicate redemptions

### Data Validation
- Requirement type validation
- Progress calculation verification
- Date and time format validation
- Status transition validation

## Best Practices

### Creating Rewards
1. Choose appropriate requirement types
2. Set achievable but motivating targets
3. Provide clear descriptions
4. Use consistent categorization
5. Set meaningful priorities

### Managing Redemptions
1. Verify eligibility before processing
2. Document redemption details
3. Maintain redemption history
4. Handle edge cases (e.g., partially met requirements)
5. Provide clear feedback on redemption status

## Error Handling

The system includes comprehensive error handling for:
- Invalid reward configurations
- Duplicate redemption attempts
- Progress calculation edge cases
- Data validation failures
- Authentication/authorization errors

## Future Enhancements
- Team-based rewards
- Seasonal/special event rewards
- Custom requirement combinations
- Advanced progress tracking metrics
- Integration with external reward systems 