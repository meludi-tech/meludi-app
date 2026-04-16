import { create } from 'zustand';

type PackageSize = 'S' | 'M' | 'L' | '';

type SellState = {
  title: string;
  description: string;
  price: string;

  category: string;
  subcategory: string;

  brand_id: string | null;
  brand_name: string;

  size: string;
  condition: string;
  color: string[];

  package_size: PackageSize;

  images: string[];

  setField: (field: keyof SellState, value: any) => void;
  addImages: (uris: string[]) => void;
  removeImage: (uri: string) => void;
  reset: () => void;
};

const initialState: SellState = {
  title: '',
  description: '',
  price: '',
  category: '',
  subcategory: '',
  brand_id: null,
  brand_name: '',
  size: '',
  condition: '',
  color: [],
  package_size: '' as PackageSize, // 🔥 CLAVE
  images: [],

  // 🔥 placeholders (necesarios para tipar como SellState)
  setField: () => {},
  addImages: () => {},
  removeImage: () => {},
  reset: () => {},
};

export const useSellStore = create<SellState>((set) => ({
  ...initialState,

  setField: (field, value) =>
    set((state) => ({
      ...state,
      [field]: value,
    })),

  addImages: (uris) =>
    set((state) => ({
      ...state,
      images: [...state.images, ...uris],
    })),

  removeImage: (uri) =>
    set((state) => ({
      ...state,
      images: state.images.filter((img) => img !== uri),
    })),

  reset: () => set({ ...initialState }),
}));