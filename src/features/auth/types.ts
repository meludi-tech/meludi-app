export type AuthStatus =
  | 'LOADING'
  | 'UNAUTHENTICATED'
  | 'AUTHENTICATED';

export type OnboardingStep =
  | 'NONE'
  | 'PRE_TRUORA'
  | 'POST_TRUORA'
  | 'USERNAME'
  | 'COMPLETE';

export interface Profile {
  id: string;
  email: string;
  username: string | null;
  created_at: string;
}