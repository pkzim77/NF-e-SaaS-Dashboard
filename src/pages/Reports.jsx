import { useMemo, useState } from 'react';
import Card from '../components/ui/Card';
import AreaChart from '../components/charts/AreaChart';
import { useToast } from '../context/ToastContext';
import { nfes } from '../data/nfes';
import { suppliers } from '../data/suppliers';
import { monthly } from '../data/monthly';
import { brl, brlShort, num, shortName } from '../utils/format';
import { IconFile } from '../icons/Icons';

const TABS = [
  { id: 'compras', label: 'Compras' },
  { id: 'fornecedores', label: 'Fornecedores' },
  { id: 'produtos', label: 'Produtos' },
  { id: 'financeiro', label: 'Financeiro' },
];

const NOTAS_POR_MES = [214, 231, 205, 247, 259, 128];

export default function Reports() {
  const showToast = useToast();
  const [tab, setTab] = useState('compras');

  const fornRank = useMemo(() => {
    const agg = {};
    nfes.forEach((n) => {
      if (n.sit === 'cancelada') return;
      agg[n.supId] = (agg[n.supId] || 0) + n.valor;
    });
    return Object.entries(agg)
      .map(([id, v]) => {
        const s = suppliers.find((x) => x.id === id);
        const notas = nfes.filter((n) => n.supId === id && n.sit !== 'cancelada').length;
        return { id, nome: shortName(s.nome), cnpj: s.cnpj, notas, v };
      })
      .sort((a, b) => b.v - a.v)
      .map((s, i) => ({ ...s, rank: String(i + 1).padStart(2, '0'), volume: brl(s.v) }));
  }, []);

  const prodRank = useMemo(() => {
    const map = {};
    nfes.forEach((n) => {
      if (n.sit === 'cancelada') return;
      n.itens.forEach((it) => {
        if (!map[it.descricao]) map[it.descricao] = { q: 0, t: 0 };
        map[it.descricao].q += it.qtd;
        map[it.descricao].t += it.vTotal;
      });
    });
    return Object.entries(map)
      .sort((a, b) => b[1].t - a[1].t)
      .slice(0, 8)
      .map(([nome, d]) => ({ nome, qtd: num(d.q), medio: brl(+(d.t / d.q).toFixed(2)), total: brl(+d.t.toFixed(2)) }));
  }, []);

  const finCards = [
    { label: 'Gasto médio mensal', value: brl(195400), delta: 'baseado em 6 meses', colorClass: 'text-text-3' },
    { label: 'Maior mês', value: brl(241870), delta: 'Maio 2026', colorClass: 'text-text-3' },
    { label: 'Projeção anual', value: brlShort(2344800), delta: '+14,6% vs 2025', colorClass: 'text-pos' },
  ];

  const finRows = monthly.map((m, i) => {
    const prev = i > 0 ? monthly[i - 1].v : m.v;
    const dv = ((m.v - prev) / prev) * 100;
    return {
      mes: m.m + ' 2026',
      gasto: brl(m.v),
      notas: NOTAS_POR_MES[i],
      varLabel: i === 0 ? '—' : (dv >= 0 ? '+' : '') + dv.toFixed(1) + '%',
      varColorClass: i === 0 ? 'text-text-3' : dv >= 0 ? 'text-pos' : 'text-danger',
    };
  });

  const comprasTotal = monthly.reduce((a, b) => a + b.v, 0);

  return (
    <div>
      <div className="mb-[18px] flex flex-wrap items-end justify-between gap-3.5">
        <div>
          <h1 className="text-[26px] font-extrabold tracking-[-0.025em]">Relatórios</h1>
          <div className="mt-1 text-[13px] text-text-3">Período: Janeiro – Junho 2026</div>
        </div>
        <div className="flex gap-[9px]">
          <button
            onClick={() => showToast('Relatório exportado em PDF')}
            className="flex h-10 items-center gap-2 rounded-[11px] border border-border bg-surface px-[15px] text-[13px] font-semibold text-text"
          >
            <IconFile color="var(--danger)" />
            PDF
          </button>
          <button
            onClick={() => showToast('Relatório exportado em Excel')}
            className="flex h-10 items-center gap-2 rounded-[11px] border border-border bg-surface px-[15px] text-[13px] font-semibold text-text"
          >
            <IconFile color="var(--pos)" />
            Excel
          </button>
        </div>
      </div>

      <div className="mb-[18px] flex w-fit gap-1.5 rounded-[13px] border border-border bg-surface-2 p-[5px]">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={[
              'rounded-[9px] px-4 py-2 text-[13px] font-bold',
              tab === t.id ? 'bg-surface text-accent-2 shadow-card' : 'text-text-2',
            ].join(' ')}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'compras' && (
        <>
          <Card className="mb-4">
            <h3 className="mb-1.5 text-[15px] font-bold">Compras por mês</h3>
            <AreaChart data={monthly} />
            <div className="mt-1.5 flex justify-between px-1.5">
              {monthly.map((m) => (
                <span key={m.m} className="text-[11.5px] font-semibold text-text-3">
                  {m.m}
                </span>
              ))}
            </div>
          </Card>
          <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
            <div className="grid grid-cols-3 gap-3.5 border-b border-border bg-surface-2 px-5 py-[13px]">
              <span className="text-[11px] font-bold uppercase text-text-3">Mês</span>
              <span className="text-right text-[11px] font-bold uppercase text-text-3">Volume comprado</span>
              <span className="text-right text-[11px] font-bold uppercase text-text-3">% do total</span>
            </div>
            {monthly.map((m) => (
              <div key={m.m} className="grid grid-cols-3 gap-3.5 border-b border-border px-5 py-[13px]">
                <span className="text-[13px] font-semibold">{m.m} 2026</span>
                <span className="text-right font-mono text-[13.5px] font-bold">{brl(m.v)}</span>
                <span className="text-right font-mono text-[13px] text-text-2">{Math.round((m.v / comprasTotal) * 100)}%</span>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'fornecedores' && (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
          <div className="grid grid-cols-[40px_1fr_1fr_110px_130px] gap-3.5 border-b border-border bg-surface-2 px-5 py-[13px]">
            <span className="text-[11px] font-bold uppercase text-text-3">#</span>
            <span className="text-[11px] font-bold uppercase text-text-3">Fornecedor</span>
            <span className="text-[11px] font-bold uppercase text-text-3">CNPJ</span>
            <span className="text-right text-[11px] font-bold uppercase text-text-3">Notas</span>
            <span className="text-right text-[11px] font-bold uppercase text-text-3">Volume</span>
          </div>
          {fornRank.map((f) => (
            <div key={f.id} className="grid grid-cols-[40px_1fr_1fr_110px_130px] items-center gap-3.5 border-b border-border px-5 py-[13px]">
              <span className="font-mono text-[13px] font-extrabold text-accent-2">{f.rank}</span>
              <span className="text-[13px] font-semibold">{f.nome}</span>
              <span className="font-mono text-[12px] text-text-2">{f.cnpj}</span>
              <span className="text-right font-mono text-[13px]">{f.notas}</span>
              <span className="text-right font-mono text-[13.5px] font-bold">{f.volume}</span>
            </div>
          ))}
        </div>
      )}

      {tab === 'produtos' && (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
          <div className="grid grid-cols-[1fr_110px_120px_130px] gap-3.5 border-b border-border bg-surface-2 px-5 py-[13px]">
            <span className="text-[11px] font-bold uppercase text-text-3">Produto</span>
            <span className="text-right text-[11px] font-bold uppercase text-text-3">Qtd comprada</span>
            <span className="text-right text-[11px] font-bold uppercase text-text-3">Valor médio</span>
            <span className="text-right text-[11px] font-bold uppercase text-text-3">Valor total</span>
          </div>
          {prodRank.map((p) => (
            <div key={p.nome} className="grid grid-cols-[1fr_110px_120px_130px] items-center gap-3.5 border-b border-border px-5 py-[13px]">
              <span className="text-[13px] font-semibold">{p.nome}</span>
              <span className="text-right font-mono text-[13px]">{p.qtd}</span>
              <span className="text-right font-mono text-[13px] text-text-2">{p.medio}</span>
              <span className="text-right font-mono text-[13.5px] font-bold">{p.total}</span>
            </div>
          ))}
        </div>
      )}

      {tab === 'financeiro' && (
        <>
          <div className="mb-4 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
            {finCards.map((c) => (
              <Card key={c.label}>
                <div className="mb-2 text-[12.5px] font-semibold text-text-2">{c.label}</div>
                <div className="font-mono text-[23px] font-extrabold tracking-[-0.02em]">{c.value}</div>
                <div className={`mt-1.5 text-[11.5px] font-bold ${c.colorClass}`}>{c.delta}</div>
              </Card>
            ))}
          </div>
          <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
            <div className="grid grid-cols-4 gap-3.5 border-b border-border bg-surface-2 px-5 py-[13px]">
              <span className="text-[11px] font-bold uppercase text-text-3">Mês</span>
              <span className="text-right text-[11px] font-bold uppercase text-text-3">Gasto</span>
              <span className="text-right text-[11px] font-bold uppercase text-text-3">Notas</span>
              <span className="text-right text-[11px] font-bold uppercase text-text-3">Var. mensal</span>
            </div>
            {finRows.map((m) => (
              <div key={m.mes} className="grid grid-cols-4 items-center gap-3.5 border-b border-border px-5 py-[13px]">
                <span className="text-[13px] font-semibold">{m.mes}</span>
                <span className="text-right font-mono text-[13.5px] font-bold">{m.gasto}</span>
                <span className="text-right font-mono text-[13px] text-text-2">{m.notas}</span>
                <span className={`text-right font-mono text-[12.5px] font-bold ${m.varColorClass}`}>{m.varLabel}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
