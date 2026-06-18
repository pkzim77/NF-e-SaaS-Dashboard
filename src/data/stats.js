import { brl, brlShort } from '../utils/format';
import { IconAxisBars, IconBarsTrend, IconCheck, IconCifrao, IconClock, IconDocument, IconTrendUp, IconUsers } from '../icons/Icons';

export const stats = [
  { label: 'Comprado hoje', value: brl(22829.4), icon: IconTrendUp, tone: 'accent', delta: '+8,2%', deltaTone: 'pos', sub: 'vs. ontem' },
  { label: 'Comprado no mês', value: brl(142360), icon: IconBarsTrend, tone: 'pos', delta: 'parcial', deltaTone: 'warn', sub: 'junho/2026' },
  { label: 'Comprado no ano', value: brlShort(1172400), icon: IconAxisBars, tone: 'accent', delta: '+14,6%', deltaTone: 'pos', sub: 'vs. 2025' },
  { label: 'NF-e recebidas', value: '1.284', icon: IconDocument, tone: 'accent', delta: '16 novas', deltaTone: 'accent', sub: 'este mês' },
  { label: 'Fornecedores ativos', value: '23', icon: IconUsers, tone: 'pos', delta: '+2', deltaTone: 'pos', sub: 'no ano' },
  { label: 'Ticket médio', value: brl(913.08), icon: IconCifrao, tone: 'accent', delta: '-3,1%', deltaTone: 'danger', sub: 'por nota' },
  { label: 'Economia estimada', value: brl(18740), icon: IconCheck, tone: 'pos', delta: '+12,4%', deltaTone: 'pos', sub: 'melhor preço' },
  { label: 'Última nota', value: 'há 12 min', icon: IconClock, tone: 'accent', delta: 'NF 048213', deltaTone: 'accent', sub: 'Sol Nascente' },
];
