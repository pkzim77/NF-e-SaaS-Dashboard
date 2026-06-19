import { useMemo, useState } from 'react';
import Card from '../components/ui/Card';
import LoadingState from '../components/ui/LoadingState';
import AreaChart from '../components/charts/AreaChart';
import { useToast } from '../context/ToastContext';
import { useApi } from '../hooks/useApi';
import { brl, monthYearLabel, num, shortName } from '../utils/format';
import { IconFile } from '../icons/Icons';

const TABS = [
  { id: 'compras', label: 'Compras' },
  { id: 'fornecedores', label: 'Fornecedores' },
  { id: 'produtos', label: 'Produtos' },
  { id: 'financeiro', label: 'Financeiro' },
];

export default function Reports() {
  const showToast = useToast();
  const [tab, setTab] = useState('compras');
  const { data: nfes } = useApi('nfes');
  const { data: suppliers } = useApi('suppliers');
  const { data: company } = useApi('company');

  const fornRank = useMemo(() => {
    if (!nfes || !suppliers) return [];
    const agg = {};
    nfes.forEach((n) => {
      if (n.sit === 'cancelada') return;
      agg[n.supId] = (agg[n.supId] || 0) + n.valor;
    });
    return Object.entries(agg)
      .map(([id, v]) => {
        const s = suppliers.find((x) => x.id === id);
        const notas = nfes.filter((n) => n.supId === id && n.sit !== 'cancelada').length;
        return { id, nome: shortName(s?.nome || '—'), cnpj: s?.cnpj || '—', notas, v };
      })
      .sort((a, b) => b.v - a.v)
      .map((s, i) => ({ ...s, rank: String(i + 1).padStart(2, '0'), volume: brl(s.v) }));
  }, [nfes, suppliers]);

  const prodRank = useMemo(() => {
    if (!nfes) return [];
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
  }, [nfes]);

  const monthly = company?.monthly || [];

  const notasPorMes = useMemo(() => {
    if (!nfes) return {};
    const m = {};
    nfes.forEach((n) => {
      if (n.sit === 'cancelada') return;
      const ym = n.data.slice(0, 7);
      m[ym] = (m[ym] || 0) + 1;
    });
    return m;
  }, [nfes]);

  const finCards = useMemo(() => {
    if (!monthly.length) return [];
    const total = monthly.reduce((a, b) => a + b.v, 0);
    const avg = total / monthly.length;
    const max = monthly.reduce((a, b) => (b.v > a.v ? b : a), monthly[0]);
    return [
      { label: 'Gasto médio mensal', value: brl(avg), delta: `baseado em ${monthly.length} ${monthly.length === 1 ? 'mês' : 'meses'}`, colorClass: 'text-text-3' },
      { label: 'Maior mês', value: brl(max.v), delta: monthYearLabel(max.ym), colorClass: 'text-text-3' },
      { label: 'Total no período', value: brl(total), delta: `${monthly.length} ${monthly.length === 1 ? 'mês' : 'meses'}`, colorClass: 'text-pos' },
    ];
  }, [monthly]);

  const finRows = monthly.map((m, i) => {
    const prev = i > 0 ? monthly[i - 1].v : null;
    const dv = prev ? ((m.v - prev) / prev) * 100 : null;
    return {
      mes: monthYearLabel(m.ym),
      gasto: brl(m.v),
      notas: notasPorMes[m.ym] || 0,
      varLabel: dv === null ? '—' : (dv >= 0 ? '+' : '') + dv.toFixed(1) + '%',
      varColorClass: dv === null ? 'text-text-3' : dv >= 0 ? 'text-pos' : 'text-danger',
    };
  });

  const comprasTotal = monthly.reduce((a, b) => a + b.v, 0);

  if (!nfes || !suppliers || !company) return <LoadingState />;

  const periodLabel = monthly.length
    ? `${monthYearLabel(monthly[0].ym)} – ${monthYearLabel(monthly[monthly.length - 1].ym)}`
    : 'Sem dados ainda';

  return (
    <div>
      <div className="mb-[18px] flex flex-wrap items-end justify-between gap-3.5">
        <div>
          <h1 className="text-[26px] font-extrabold tracking-[-0.025em]">Relatórios</h1>
          <div className="mt-1 text-[13px] text-text-3">Período: {periodLabel}</div>
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
            {monthly.length > 1 ? (
              <>
                <AreaChart data={monthly} />
                <div className="mt-1.5 flex justify-between px-1.5">
                  {monthly.map((m) => (
                    <span key={m.ym} className="text-[11.5px] font-semibold text-text-3">
                      {m.m}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <div className="py-10 text-center text-[12.5px] text-text-3">Dados insuficientes para o gráfico ainda.</div>
            )}
          </Card>
          <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
            <div className="grid grid-cols-3 gap-3.5 border-b border-border bg-surface-2 px-5 py-[13px]">
              <span className="text-[11px] font-bold uppercase text-text-3">Mês</span>
              <span className="text-right text-[11px] font-bold uppercase text-text-3">Volume comprado</span>
              <span className="text-right text-[11px] font-bold uppercase text-text-3">% do total</span>
            </div>
            {monthly.map((m) => (
              <div key={m.ym} className="grid grid-cols-3 gap-3.5 border-b border-border px-5 py-[13px]">
                <span className="text-[13px] font-semibold">{monthYearLabel(m.ym)}</span>
                <span className="text-right font-mono text-[13.5px] font-bold">{brl(m.v)}</span>
                <span className="text-right font-mono text-[13px] text-text-2">{comprasTotal ? Math.round((m.v / comprasTotal) * 100) : 0}%</span>
              </div>
            ))}
            {monthly.length === 0 && <div className="p-[40px] text-center text-[12.5px] text-text-3">Nenhuma nota sincronizada ainda.</div>}
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
          {prodRank.length > 0 ? (
            <>
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
            </>
          ) : (
            <div className="p-[54px] text-center text-text-3">
              <div className="mb-1 text-[14px] font-semibold">Itens não disponíveis</div>
              <div className="text-[12.5px]">A SEFAZ enviou até agora apenas o resumo das notas (resNFe), sem a lista de produtos.</div>
            </div>
          )}
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
