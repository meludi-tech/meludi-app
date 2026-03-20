import { AuthStatus, OnboardingStep, Profile } from '@/features/auth/types';
import { Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';

interface AuthState {
  status: AuthStatus;
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  onboardingStep: OnboardingStep;

  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  setOnboardingStep: (step: OnboardingStep) => void;
  setStatus: (status: AuthStatus) => void;

  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  status: 'LOADING',
  session: null,
  user: null,
  profile: null,
  onboardingStep: 'NONE',

  setSession: (session: Session | null) =>
    set({
      session,
      user: session?.user ?? null,
      status: session ? 'AUTHENTICATED' : 'UNAUTHENTICATED',
    }),

  setProfile: (profile: Profile | null) => set({ profile }),

  setOnboardingStep: (step: OnboardingStep) =>
    set({ onboardingStep: step }),

  setStatus: (status: AuthStatus) => set({ status }),

  reset: () =>
    set({
      status: 'UNAUTHENTICATED',
      session: null,
      user: null,
      profile: null,
      onboardingStep: 'NONE',
    }),
}));