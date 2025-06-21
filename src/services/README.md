# Services and Hooks Documentation

This directory contains the service layer and React hooks for the mini-geo-guessr application.

## Services

### Games Service (`src/services/games.ts`)

Handles all game-related API calls:

- `getTodayGame()` - Fetches today's game from the database
- `getQuestionsForGame(gameId)` - Fetches questions for a specific game
- `playGame()` - Combines today's game with its questions
- `saveGameResult(gameId, score)` - Saves a user's game result

### Badges Service (`src/services/badges.ts`)

Handles badge-related API calls:

- `getBadgesWithCategories()` - Fetches all badges with their categories
- `getBadgesByCategory(categoryId)` - Fetches badges for a specific category
- `getCategories()` - Fetches all categories

### History Service (`src/services/history.ts`)

Handles user history API calls:

- `getUserGameHistory(userId)` - Fetches user's game history
- `getRecentGames(userId, limit)` - Fetches recent games
- `getUserBestScore(userId)` - Fetches user's best score

## React Hooks

### Game Hooks (`src/hooks/useGames.ts`)

- `useTodayGameQuery()` - Hook to fetch today's game
- `useGameQuestionsQuery(gameId)` - Hook to fetch questions for a game
- `usePlayGameQuery()` - Hook to play today's game (combines game + questions)
- `useSaveGameResultMutation()` - Hook to save game results

### Badge Hooks (`src/hooks/useBadges.ts`)

- `useBadgesQuery()` - Hook to fetch badges with categories
- `useBadgesByCategoryQuery(categoryId)` - Hook to fetch badges by category
- `useCategoriesQuery()` - Hook to fetch all categories

### History Hooks (`src/hooks/useHistory.ts`)

- `useUserHistoryQuery(userId)` - Hook to fetch user history
- `useRecentGamesQuery(userId, limit)` - Hook to fetch recent games
- `useUserBestScoreQuery(userId)` - Hook to fetch best score

## Usage Examples

### Basic Hook Usage

```tsx
import { usePlayGameQuery, useBadgesQuery } from '../hooks';

function MyComponent() {
  const { data: gameData, isLoading, error } = usePlayGameQuery();
  const { data: badges } = useBadgesQuery();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Today's Game: {gameData?.game.name}</h1>
      <p>Questions: {gameData?.questions.length}</p>
    </div>
  );
}
```

### Using Mutations

```tsx
import { useSaveGameResultMutation } from '../hooks';

function GameComponent() {
  const saveGameMutation = useSaveGameResultMutation();

  const handleGameComplete = (score: number) => {
    saveGameMutation.mutate({
      gameId: 1,
      score: score
    });
  };

  return (
    <button 
      onClick={() => handleGameComplete(3500)}
      disabled={saveGameMutation.isPending}
    >
      {saveGameMutation.isPending ? 'Saving...' : 'Save Score'}
    </button>
  );
}
```

### With Suspense

```tsx
import { Suspense } from 'react';
import { SkeletonCard } from '../components/Skeleton';

function App() {
  return (
    <Suspense fallback={<SkeletonCard />}>
      <MyComponent />
    </Suspense>
  );
}
```

## Types

All types are defined in `src/types/index.ts`:

- `Game` - Base game type
- `Question` - Base question type
- `BadgeWithCategory` - Badge with category information
- `UserHistoryEntry` - User game history entry
- `TodayGameData` - Combined game and questions data
- `ApiResponse<T>` - Standard API response wrapper

## Error Handling

All services return an `ApiResponse<T>` type with the following structure:

```typescript
{
  data: T | null;
  error: string | null;
}
```

Hooks automatically throw errors when `response.error` is present, which can be caught using React Query's error handling.

## Query Keys

Query keys are organized for efficient caching:

- `gameKeys.all` - All game-related queries
- `gameKeys.today()` - Today's game
- `gameKeys.questions(gameId)` - Questions for a specific game
- `badgeKeys.withCategories()` - Badges with categories
- `historyKeys.userHistory(userId)` - User history

## Caching Strategy

- Game data: 5 minutes stale time, 10 minutes garbage collection
- Badge data: 10 minutes stale time, 30 minutes garbage collection
- History data: 5 minutes stale time, 10 minutes garbage collection

## Authentication

Currently, user ID is hardcoded as `1` in the history hooks. In a real application, this should be replaced with the actual user ID from your authentication context. 