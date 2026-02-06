export interface UserPreferences {
  selectedInterests: string[];
  depth: 'light' | 'normal';
  audioEnabled: boolean;
  hasCompletedOnboarding?: boolean;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  selectedInterests: [],
  depth: 'normal',
  audioEnabled: true,
  hasCompletedOnboarding: false
};
