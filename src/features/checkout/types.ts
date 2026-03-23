export type DeliveryType = 'shipping' | 'in_person';

export type CreatePreferencePayload = {
  listing_id: string;
  delivery_type: DeliveryType;
};

export type CreatePreferenceResponse = {
  init_point: string;
};