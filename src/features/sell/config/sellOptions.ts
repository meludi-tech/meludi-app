export const SELL_CATEGORIES = [
  {
    key: 'fashion_women',
    label: 'Moda mujer',
    subcategories: [
      'Tops',
      'Pantalones',
      'Vestidos',
      'Chaquetas',
      'Faldas',
      'Jeans',
    ],
    sizes: ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    key: 'shoes',
    label: 'Zapatos',
    subcategories: ['Zapatillas', 'Botas', 'Sandalias', 'Tacones', 'Mocasines'],
    sizes: ['35', '36', '37', '38', '39', '40', '41', '42'],
  },
  {
    key: 'bags',
    label: 'Bolsos',
    subcategories: ['Crossbody', 'Tote', 'Shoulder bag', 'Mochila'],
    sizes: ['Única'],
  },
  {
    key: 'electronics',
    label: 'Electrónica',
    subcategories: ['Smartphones', 'Laptops', 'Audio', 'Cámaras', 'Tablets'],
    sizes: ['Única'],
  },
] as const;

export const CONDITION_OPTIONS = [
  {
    label: 'Nuevo con etiquetas',
    description:
      'Artículo sin estrenar que todavía tiene las etiquetas o está en su embalaje original.',
  },
  {
    label: 'Nuevo sin etiquetas',
    description:
      'Artículo sin estrenar que no tiene las etiquetas o el embalaje original.',
  },
  {
    label: 'Muy bueno',
    description:
      'Artículo poco usado que puede tener algún defecto menor, pero se ve casi como nuevo.',
  },
  {
    label: 'Bueno',
    description:
      'Artículo usado con señales visibles de uso, pero en buen estado general.',
  },
  {
    label: 'Satisfactorio',
    description:
      'Artículo bastante usado con defectos visibles o desgaste marcado.',
  },
] as const;

export const COLOR_OPTIONS = [
  'Negro',
  'Blanco',
  'Beige',
  'Azul',
  'Rojo',
  'Verde',
  'Gris',
  'Marrón',
  'Rosa',
  'Plateado',
  'Dorado',
] as const;

export function getCategoryBySubcategory(subcategory: string) {
  return SELL_CATEGORIES.find((cat) =>
    cat.subcategories.includes(subcategory as any)
  );
}

export function getSizesForSubcategory(subcategory: string) {
  const category = getCategoryBySubcategory(subcategory);
  return category?.sizes ?? ['Única'];
}