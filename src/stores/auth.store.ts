import { create } from 'zustand';

type AuthStatus = 'anonymous' | 'authenticated' | 'verified';

type AuthState = {
  user: any | null;
  status: AuthStatus;
  setUser: (user: any | null) => void;
  setVerificationStatus: (verificationStatus: string | null) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: 'anonymous',

  setUser: (user) => {
    if (!user) {
      set({ user: null, status: 'anonymous' });
      return;
    }

    set({
      user,
      status: 'authenticated',
    });
  },

  setVerificationStatus: (verificationStatus) => {
    if (verificationStatus === 'verified') {
      set((state) => ({
        ...state,
        status: 'verified',
      }));
    } else {
      set((state) => ({
        ...state,
        status: 'authenticated',
      }));
    }
  },
}));