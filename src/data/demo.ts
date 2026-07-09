import { Ionicons } from '@expo/vector-icons';

type MovementTone = 'success' | 'warning' | 'info';
type AlertTone = 'warning' | 'danger';
type ProductTone = 'success' | 'warning' | 'danger';

export const demoMetrics = {
  stockValueCents: 1245080,
  products: 156,
  lowStock: 23,
};

export const demoMovements: Array<{
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  value: string;
  tone: MovementTone;
}> = [
  {
    id: 'movement-1',
    icon: 'arrow-up-outline',
    title: 'Parafuso 3/16',
    subtitle: 'Hoje 09:30',
    value: '+50 un',
    tone: 'success',
  },
  {
    id: 'movement-2',
    icon: 'arrow-down-outline',
    title: 'Cabo USB-C',
    subtitle: 'Hoje 08:10',
    value: '-12 un',
    tone: 'warning',
  },
  {
    id: 'movement-3',
    icon: 'sync-outline',
    title: 'Ajuste manual',
    subtitle: 'Ontem 17:20',
    value: '+4 un',
    tone: 'info',
  },
];

export const demoAlerts: Array<{
  id: string;
  title: string;
  subtitle: string;
  count: string;
  tone: AlertTone;
}> = [
  {
    id: 'alert-1',
    title: 'Fita isolante 10m',
    subtitle: 'Estoque baixo',
    count: '5 un',
    tone: 'warning',
  },
  {
    id: 'alert-2',
    title: 'Lâmpada LED 9W',
    subtitle: 'Estoque zerado',
    count: '0 un',
    tone: 'danger',
  },
];

export const demoProducts: Array<{
  id: string;
  name: string;
  category: string;
  quantityLabel: string;
  minQuantity: string;
  location: string;
  status: string;
  icon: keyof typeof Ionicons.glyphMap;
  tone: ProductTone;
  valueCents: number;
}> = [
  {
    id: 'parafuso-316',
    name: 'Parafuso 3/16',
    category: 'Ferragens',
    quantityLabel: '250 un',
    minQuantity: '100',
    location: 'Gaveta A1',
    status: 'Ativo',
    icon: 'cube-outline',
    tone: 'success',
    valueCents: 3750,
  },
  {
    id: 'cabo-usbc',
    name: 'Cabo USB-C',
    category: 'Eletrônicos',
    quantityLabel: '80 un',
    minQuantity: '50',
    location: 'Prateleira B2',
    status: 'Baixo estoque',
    icon: 'hardware-chip-outline',
    tone: 'warning',
    valueCents: 12000,
  },
  {
    id: 'fita-isolante',
    name: 'Fita isolante 10m',
    category: 'Elétricos',
    quantityLabel: '5 un',
    minQuantity: '20',
    location: 'Corredor C3',
    status: 'Baixo estoque',
    icon: 'construct-outline',
    tone: 'warning',
    valueCents: 500,
  },
];

export const demoCategories = [
  {
    id: 'cat-1',
    name: 'Ferragens',
    icon: 'grid-outline' as const,
    description: 'Itens de fixação e montagem',
  },
  {
    id: 'cat-2',
    name: 'Eletrônicos',
    icon: 'flash-outline' as const,
    description: 'Cabos, placas e acessórios',
  },
];

export const demoSuppliers = [
  {
    id: 'sup-1',
    name: 'Ferragens São João',
    phone: '(11) 4000-1000',
  },
  {
    id: 'sup-2',
    name: 'Distribuidora Alfa',
    phone: '(11) 3000-2000',
  },
];
