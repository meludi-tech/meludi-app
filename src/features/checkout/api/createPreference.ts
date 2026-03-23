import { CreatePreferencePayload, CreatePreferenceResponse } from '../types';

export const createPreference = async (
  payload: CreatePreferencePayload
): Promise<CreatePreferenceResponse> => {
  const res = await fetch(
    'https://YOUR_BACKEND_URL/mp-create-preference',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    throw new Error('Error creando preferencia de pago');
  }

  return res.json();
};