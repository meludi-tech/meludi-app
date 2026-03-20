import { useAuthStore } from '@/stores/auth.store';
import { useEffect } from 'react';
import { getProfile } from '../api/getProfile';
import { getSession } from '../api/getSession';

export const useAuthBootstrap = () => {
  const {
    setSession,
    setProfile,
    setOnboardingStep,
    setStatus,
  } = useAuthStore();

  useEffect(() => {
    const init = async () => {
      try {
        const session = await getSession();

        setSession(session);

        if (!session) {
          setStatus('UNAUTHENTICATED');
          return;
        }

        const profile = await getProfile(session.user.id);

        setProfile(profile);

        if (!profile) {
          setOnboardingStep('PRE_TRUORA');
          return;
        }

        if (!profile.username) {
          setOnboardingStep('USERNAME');
          return;
        }

        setOnboardingStep('COMPLETE');
      } catch (e) {
        console.error(e);
        setStatus('UNAUTHENTICATED');
      }
    };

    init();
  }, []);
};