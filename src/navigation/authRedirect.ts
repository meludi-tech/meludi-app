import { OnboardingStep } from '@/features/auth/types';

export const getAuthRedirect = ({
  hasSession,
  hasProfile,
  onboardingStep,
}: {
  hasSession: boolean;
  hasProfile: boolean;
  onboardingStep: OnboardingStep;
}) => {
  if (!hasSession) return '/(auth)/login';

  if (!hasProfile) return '/(auth)/pre-truora';

  if (onboardingStep === 'PRE_TRUORA') return '/(auth)/pre-truora';
  if (onboardingStep === 'POST_TRUORA') return '/(auth)/post-truora';
  if (onboardingStep === 'USERNAME') return '/(auth)/username';

  return '/(tabs)/home'; // futuro
};