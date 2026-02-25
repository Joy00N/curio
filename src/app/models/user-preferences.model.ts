export type AppLanguage = 'en' | 'ko';

export interface LanguageOption {
  code: AppLanguage;
  label: string;
  nativeLabel: string;
  locale: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', nativeLabel: 'English', locale: 'en-US' },
  { code: 'ko', label: 'Korean', nativeLabel: '한국어', locale: 'ko-KR' }
];

export interface UserPreferences {
  selectedInterests: string[];
  depth: 'light' | 'normal';
  audioEnabled: boolean;
  language: AppLanguage;
  hasCompletedOnboarding?: boolean;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  selectedInterests: [],
  depth: 'normal',
  audioEnabled: true,
  language: 'en',
  hasCompletedOnboarding: false
};
