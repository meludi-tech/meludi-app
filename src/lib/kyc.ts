export const requireKYC = (profile: any) => {
  if (profile?.kyc_status !== 'verified') {
    throw new Error('KYC_REQUIRED');
  }
};