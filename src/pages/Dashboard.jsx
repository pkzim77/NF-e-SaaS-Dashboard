import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import LoadingState from '../components/ui/LoadingState';
import AreaChart from '../components/charts/AreaChart';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import { useApi } from '../hooks/useApi';
import { IconAxisBars, IconBarsTrend, IconClock, IconDocument, IconCifrao, IconTrendUp, IconUsers } from '../icons/Icons';
import { brl, brlShort, formatDate, formatTodayLong, initials, monthYearLabel, shortName } from '../utils/format';
import { toneBg, toneText } from '../utils/tone';

export default function Dashboard() {
  const navigate = useNavigate();
  const showToast = useToast();
  const [syncing, setSyncing] = useState(false);
  const { data: nfes, refetch: refetchNfes } = useApi('nfes');
  const { data: company, refetch: refetchCompany } = useApi('company');

  const handleCollect = async () => {
    setSyncing(true);
    showToast('Coleta iniciada — consultando SEFAZ…');
    try {
      const result = await api.post('sync');
      await Promise.all([refetchNfes(), refetchCompany()]);
      showToast(`Coleta concluída — ${result.novos} nota(s) nova(s)`);
    } catch (e) {
      showToast('Falha na coleta: ' + e.message);
    } finally {
      setSyncing(false);
    }
  };

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

  const cards = useMemo(() => {
    if (!nfes) return [];
    const today = new Date();
    const todayIso = today.toISOString().slice(0, 10);
    const ym = todayIso.slice(0, 7);
    const year = todayIso.slice(0, 4);
    const valid = nfes.filter((n) => n.sit !== 'cancelada');

    const sum = (arr) => arr.reduce((a, b) => a + b.valor, 0);
    const hoje = sum(valid.filter((n) => n.data === todayIso));
    const noMes = sum(valid.filter((n) => n.data.startsWith(ym)));
    const noAno = sum(valid.filter((n) => n.data.startsWith(year)));
    const novasNoMes = nfes.filter((n) => n.data.startsWith(ym)).length;
    const fornecedoresAtivos = new Set(valid.map((n) => n.supId)).size;
    const ticketMedio = valid.length ? sum(valid) / valid.length : 0;
    const ultima = sorted[0];

    const list = [
      { label: 'Comprado hoje', value: brl(hoje), icon: IconTrendUp, tone: 'accent', sub: formatDate(todayIso) },
      { label: 'Comprado no mês', value: brl(noMes), icon: IconBarsTrend, tone: 'pos', sub: monthYearLabel(ym) },
      { label: 'Comprado no ano', value: brlShort(noAno), icon: IconAxisBars, tone: 'accent', sub: year },
      {
        label: 'NF-e recebidas',
        value: String(nfes.length),
        icon: IconDocument,
        tone: 'accent',
        delta: novasNoMes ? `${novasNoMes} este mês` : null,
        deltaTone: 'accent',
        sub: 'no total',
      },
      { label: 'Fornecedores ativos', value: String(fornecedoresAtivos), icon: IconUsers, tone: 'pos', sub: 'com notas recebidas' },
      { label: 'Ticket médio', value: brl(ticketMedio), icon: IconCifrao, tone: 'accent', sub: 'por nota' },
      ultima && {
        label: 'Última nota',
        value: shortName(ultima.fornecedor),
        icon: IconClock,
        tone: 'accent',
        delta: 'NF ' + ultima.numero,
        deltaTone: 'accent',
        sub: formatDate(ultima.data),
      },
    ].filter(Boolean);

    return list;
  }, [nfes, sorted]);

  if (!nfes || !company) return <LoadingState />;

  const monthly = company.monthly || [];
  const yearTotal = monthly.reduce((a, b) => a + b.v, 0);
  const periodLabel = monthly.length ? `${monthYearLabel(monthly[0].ym)} – ${monthYearLabel(monthly[monthly.length - 1].ym)}` : '';

  return (
    <div>
      <div className="mb-[22px] flex flex-wrap items-end justify-between gap-3.5">
        <div>
          <div className="mb-[5px] text-[12.5px] font-semibold text-text-3">{formatTodayLong()}</div>
          <h1 className="whitespace-nowrap text-[26px] font-extrabold tracking-[-0.025em]">Visão geral de compras</h1>
        </div>
        <div className="flex gap-[9px]">
          <button
            onClick={handleCollect}
            disabled={syncing}
            className="flex h-10 items-center gap-2 rounded-[11px] border border-border bg-surface px-4 text-[13px] font-semibold text-text disabled:opacity-60"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className={syncing ? 'animate-spin' : ''}>
              <path d="M20 12a8 8 0 11-2.3-5.6M20 4v4h-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {syncing ? 'Coletando…' : 'Coletar agora'}
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
        {cards.map((s) => {
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
                {s.delta && (
                  <span className={`rounded-full px-[7px] py-0.5 text-[11.5px] font-bold ${toneBg[s.deltaTone]} ${toneText[s.deltaTone]}`}>
                    {s.delta}
                  </span>
                )}
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
              <div className="mt-0.5 text-[12px] text-text-3">{periodLabel}</div>
            </div>
            <div className="text-right">
              <div className="font-mono text-[20px] font-extrabold tracking-[-0.02em]">{brlShort(yearTotal)}</div>
              <div className="text-[11.5px] font-bold text-pos">acumulado no período</div>
            </div>
          </div>
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
