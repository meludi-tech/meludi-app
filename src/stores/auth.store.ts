import { create } from 'zustand';

type AuthStatus = 'anonymous' | 'authenticated' | 'verified';

type AuthState = {
  user: any | null;
  status: AuthStatus;
  isBootstrapped: boolean;

  setUser: (user: any | null) => void;
  setVerificationStatus: (kycStatus: string | null) => void;
  setBootstrapped: (value: boolean) => void;
  resetAuth: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: 'anonymous',
  isBootstrapped: false,

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

  // 🔥 ESTA ES LA CLAVE
  setVerificationStatus: (kycStatus) => {
    if (kycStatus === 'verified') {
      set((state) => ({
        ...state,
        status: 'verified',
      }));
    } else {
      set((state) => ({
        ...state,
        status: state.user ? 'authenticated' : 'anonymous',
      }));
    }
  },

  setBootstrapped: (value) => set({ isBootstrapped: value }),

  resetAuth: () =>
    set({
      user: null,
      status: 'anonymous',
      isBootstrapped: true,
    }),
}));