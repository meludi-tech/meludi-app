import * as Linking from 'expo-linking';
import { createPreference } from '../api/createPreference';
import { CreatePreferencePayload } from '../types';

export const useCheckout = () => {
  const startCheckout = async (payload: CreatePreferencePayload) => {
    try {
      const data = await createPreference(payload);

      if (!data?.init_point) {
        throw new Error('No se recibió URL de pago');
      }

      // 🔥 abre Mercado Pago real
      await Linking.openURL(data.init_point);
    } catch (error) {
      console.log('checkout error', error);
      throw error;
    }
  };

  return {
    startCheckout,
  };
};