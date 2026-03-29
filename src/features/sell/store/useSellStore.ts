import { create } from 'zustand';

type SellState = {
  // 🧾 campos
  title: string;
  description: string;
  price: string;

  category: string;
  brand: string;
  size: string;
  condition: string;
  color: string;

  images: string[];

  // ⚙️ acciones
  setField: (field: keyof SellState, value: any) => void;
  addImages: (uris: string[]) => void;
  removeImage: (uri: string) => void;
  reset: () => void;
};

export const useSellStore = create<SellState>((set) => ({
  // 🧾 estado inicial
  title: '',
  description: '',
  price: '',

  category: '',
  brand: '',
  size: '',
  condition: '',
  color: '',

  images: [],

  // 🔁 set dinámico
  setField: (field, value) =>
    set((state) => ({
      ...state,
      [field]: value,
    })),

  // 📸 agregar imágenes
  addImages: (uris) =>
    set((state) => ({
      images: [...state.images, ...uris],
    })),

  // ❌ eliminar imagen
  removeImage: (uri) =>
    set((state) => ({
      images: state.images.filter((img) => img !== uri),
    })),

  // 🔄 reset completo
  reset: () =>
    set({
      title: '',
      description: '',
      price: '',

      category: '',
      brand: '',
      size: '',
      condition: '',
      color: '',

      images: [],
    }),
}));