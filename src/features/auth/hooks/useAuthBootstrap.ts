import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth.store';
import { useEffect } from 'react';

export const useAuthBootstrap = () => {
  const setUser = useAuthStore((s) => s.setUser);
  const setVerificationStatus = useAuthStore((s) => s.setVerificationStatus);
  const setBootstrapped = useAuthStore((s) => s.setBootstrapped);

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUser(user);

        // 🔥 traer profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('kyc_status')
          .eq('id', user.id)
          .single();

        if (profile?.kyc_status) {
          setVerificationStatus(profile.kyc_status);
        }
      }

      setBootstrapped(true);
    };

    init();

    // 🔥 escuchar cambios de sesión
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setUser(session.user);

          const { data: profile } = await supabase
            .from('profiles')
            .select('kyc_status')
            .eq('id', session.user.id)
            .single();

          if (profile?.kyc_status) {
            setVerificationStatus(profile.kyc_status);
          }
        } else {
          setUser(null);
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);
};