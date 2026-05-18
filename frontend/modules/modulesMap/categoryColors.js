export const CATEGORY_COLORS = {
  crime:      '#dc2626', // red-600
  transito:   '#f97316', // orange-500
  buraco:     '#d97706', // amber-600
  alagamento: '#2563eb', // blue-600
  iluminacao: '#eab308', // yellow-500
  entulho:    '#78716c', // stone-500
  outro:      '#64748b', // slate-500
};

export const DEFAULT_CATEGORY_COLOR = '#64748b';

export function corDaCategoria(tipo) {
  return CATEGORY_COLORS[tipo] || DEFAULT_CATEGORY_COLOR;
}
