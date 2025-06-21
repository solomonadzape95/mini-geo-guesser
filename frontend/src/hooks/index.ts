// Game hooks
export {
  useTodayGameQuery,
  useGameQuestionsQuery,
  usePlayGameQuery,
  useSaveGameResultMutation,
  gameKeys
} from './useGames';

// Badge hooks
export {
  useBadgesQuery,
  useBadgesByCategoryQuery,
  useCategoriesQuery,
  badgeKeys
} from './useBadges';

// History hooks
export {
  useUserHistoryQuery,
  useRecentGamesQuery,
  useUserBestScoreQuery,
  historyKeys
} from './useHistory'; 