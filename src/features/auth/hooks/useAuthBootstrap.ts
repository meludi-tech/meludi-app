import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth.store';
import { useEffect } from 'react';

export const useAuthBootstrap = () => {
  const { setUser, setVerificationStatus } = useAuthStore();

  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        setUser(null);
        return;
      }

      setUser(session.user);

      // 🔥 traer profile (clave Truora)
      const { data: profile } = await supabase
        .from('profiles')
        .select('verification_status')
        .eq('id', session.user.id)
        .single();

      setVerificationStatus(profile?.verification_status ?? null);
    };

    init();

    // listener de cambios de sesión
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setUser(null);
        return;
      }

      setUser(session.user);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);
};