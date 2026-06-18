import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import LoadingState from '../components/ui/LoadingState';
import AreaChart from '../components/charts/AreaChart';
import DonutChart from '../components/charts/DonutChart';
import { useToast } from '../context/ToastContext';
import { useApi } from '../hooks/useApi';
import { stats } from '../data/stats';
import { brl, brlShort, formatDate, formatTodayLong, initials, shortName } from '../utils/format';
import { toneBg, toneText } from '../utils/tone';

export default function Dashboard() {
  const navigate = useNavigate();
  const showToast = useToast();
  const { data: nfes } = useApi('nfes');
  const { data: company } = useApi('company');

  const sorted = useMemo(() => (nfes ? [...nfes].sort((a, b) => b.data.localeCompare(a.data)) : []), [nfes]);

  const recent = useMemo(
    () =>
      sorted.slice(0, 5).map((n) => ({
        id: n.id,
        ini: initials(n.fornecedor),
        fornecedor: shortName(n.fornecedor),
        numero: n.numero,
        data: formatDate(n.data),
        valor: brl(n.valor),
      })),
    [sorted]
  );

  const topSuppliers = useMemo(() => {
    if (!nfes) return [];
    const agg = {};
    nfes.forEach((n) => {
      if (n.sit === 'cancelada') return;
      if (!agg[n.supId]) agg[n.supId] = { nome: n.fornecedor, v: 0 };
      agg[n.supId].v += n.valor;
    });
    const arr = Object.values(agg).sort((a, b) => b.v - a.v);
    const max = arr[0] ? arr[0].v : 1;
    return arr.slice(0, 5).map((s) => ({ nome: shortName(s.nome), valor: brl(s.v), pct: Math.round((s.v / max) * 100) }));
  }, [nfes]);

  const categoryRows = useMemo(() => {
    if (!company) return [];
    const total = company.categories.reduce((a, b) => a + b.v, 0);
    return company.categories.map((c) => ({ ...c, pct: Math.round((c.v / total) * 100) }));
  }, [company]);

  if (!nfes || !company) return <LoadingState />;

  const yearTotal = company.monthly.reduce((a, b) => a + b.v, 0);

  return (
    <div>
      <div className="mb-[22px] flex flex-wrap items-end justify-between gap-3.5">
        <div>
          <div className="mb-[5px] text-[12.5px] font-semibold text-text-3">{formatTodayLong()}</div>
          <h1 className="whitespace-nowrap text-[26px] font-extrabold tracking-[-0.025em]">Visão geral de compras</h1>
        </div>
        <div className="flex gap-[9px]">
          <button
            onClick={() => showToast('Coleta iniciada — consultando SEFAZ…')}
            className="flex h-10 items-center gap-2 rounded-[11px] border border-border bg-surface px-4 text-[13px] font-semibold text-text"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M20 12a8 8 0 11-2.3-5.6M20 4v4h-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Coletar agora
          </button>
          <button
            onClick={() => navigate('/relatorios')}
            className="flex h-10 items-center gap-2 rounded-[11px] bg-accent px-4 text-[13px] font-semibold text-white"
          >
            Relatórios
          </button>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-[repeat(auto-fit,minmax(210px,1fr))] gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <div className="mb-3.5 flex items-center justify-between">
                <span className="text-[12.5px] font-semibold text-text-2">{s.label}</span>
                <div className={`flex h-[30px] w-[30px] items-center justify-center rounded-[9px] ${toneBg[s.tone]}`}>
                  <Icon size={16} />
                </div>
              </div>
              <div className="font-mono text-[25px] font-extrabold tracking-[-0.03em]">{s.value}</div>
              <div className="mt-[9px] flex items-center gap-1.5">
                <span className={`rounded-full px-[7px] py-0.5 text-[11.5px] font-bold ${toneBg[s.deltaTone]} ${toneText[s.deltaTone]}`}>
                  {s.delta}
                </span>
                <span className="text-[11.5px] text-text-3">{s.sub}</span>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="mb-4 grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4">
        <Card>
          <div className="mb-2 flex items-start justify-between">
            <div>
              <h3 className="text-[15px] font-bold">Evolução mensal de compras</h3>
              <div className="mt-0.5 text-[12px] text-text-3">Janeiro – Junho 2026</div>
            </div>
            <div className="text-right">
              <div className="font-mono text-[20px] font-extrabold tracking-[-0.02em]">{brlShort(yearTotal)}</div>
              <div className="text-[11.5px] font-bold text-pos">acumulado no ano</div>
            </div>
          </div>
          <AreaChart data={company.monthly} />
          <div className="mt-1.5 flex justify-between px-1.5">
            {company.monthly.map((m) => (
              <span key={m.m} className="text-[11.5px] font-semibold text-text-3">
                {m.m}
              </span>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="mb-3.5 text-[15px] font-bold">Compras por categoria</h3>
          <div className="flex items-center gap-3.5">
            <div className="flex-none">
              <DonutChart data={company.categories} />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-2.5">
              {categoryRows.map((c) => (
                <div key={c.nome} className="flex items-center gap-2.5">
                  <span className="h-[9px] w-[9px] flex-none rounded-[3px]" style={{ background: c.color }} />
                  <span className="flex-1 text-[12px] text-text-2">{c.nome}</span>
                  <span className="font-mono text-[12px] font-bold">{c.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4">
        <Card>
          <h3 className="mb-4 text-[15px] font-bold">Top fornecedores</h3>
          <div className="flex flex-col gap-[15px]">
            {topSuppliers.map((f) => (
              <div key={f.nome}>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-[12.5px] font-semibold">{f.nome}</span>
                  <span className="font-mono text-[12.5px] font-bold">{f.valor}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-md bg-surface-3">
                  <div
                    className="h-full rounded-md bg-gradient-to-r from-accent to-accent-2"
                    style={{ width: `${f.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="mb-3.5 flex items-center justify-between">
            <h3 className="text-[15px] font-bold">Notas recebidas recentemente</h3>
            <button onClick={() => navigate('/nfe')} className="text-[12.5px] font-bold text-accent-2">
              Ver todas →
            </button>
          </div>
          <div className="flex flex-col">
            {recent.map((r) => (
              <div
                key={r.id}
                onClick={() => navigate(`/nfe/${r.id}`)}
                className="flex cursor-pointer items-center gap-3 rounded-[10px] px-2 py-2.5 hover:bg-surface-2"
              >
                <div className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-[9px] bg-accent-soft text-[11px] font-extrabold text-accent-2">
                  {r.ini}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="overflow-hidden truncate text-[12.5px] font-semibold">{r.fornecedor}</div>
                  <div className="font-mono text-[11px] text-text-3">
                    NF {r.numero} · {r.data}
                  </div>
                </div>
                <div className="font-mono text-[13px] font-bold">{r.valor}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
