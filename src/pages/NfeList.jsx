import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '../context/SearchContext';
import { useToast } from '../context/ToastContext';
import { useApi } from '../hooks/useApi';
import LoadingState from '../components/ui/LoadingState';
import { brl, formatDate, initials, shortName } from '../utils/format';
import { toneBg, toneText } from '../utils/tone';
import { IconDownload, IconEye, IconSearch } from '../icons/Icons';

function periodLabel(ym) {
  const [y, m] = ym.split('-');
  const label = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(new Date(+y, +m - 1, 1));
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function statusBadge(sit) {
  return sit === 'autorizada'
    ? { tone: 'pos', label: 'Autorizada' }
    : { tone: 'danger', label: 'Cancelada' };
}

export default function NfeList() {
  const navigate = useNavigate();
  const showToast = useToast();
  const { query, setQuery } = useSearch();
  const { data: nfes } = useApi('nfes');
  const [fSupplier, setFSupplier] = useState('all');
  const [fPeriod, setFPeriod] = useState('all');
  const [fStatus, setFStatus] = useState('all');

  const sorted = useMemo(() => (nfes ? [...nfes].sort((a, b) => b.data.localeCompare(a.data)) : []), [nfes]);

  const supplierOptions = useMemo(() => {
    if (!nfes) return [];
    const seen = new Map();
    nfes.forEach((n) => {
      if (!seen.has(n.supId)) seen.set(n.supId, shortName(n.fornecedor));
    });
    return [...seen.entries()].map(([id, nome]) => ({ id, nome }));
  }, [nfes]);

  const periodOptions = useMemo(() => {
    if (!nfes) return [];
    const months = [...new Set(nfes.map((n) => n.data.slice(0, 7)))].sort((a, b) => b.localeCompare(a));
    return months.map((id) => ({ id, label: periodLabel(id) }));
  }, [nfes]);

  const list = useMemo(() => {
    const ql = query.trim().toLowerCase();
    return sorted.filter((n) => {
      if (fSupplier !== 'all' && n.supId !== fSupplier) return false;
      if (fStatus !== 'all' && n.sit !== fStatus) return false;
      if (fPeriod !== 'all' && !n.data.startsWith(fPeriod)) return false;
      if (ql) {
        const hay = (n.fornecedor + ' ' + n.numero + ' ' + n.chave + ' ' + n.fornCnpj + ' ' + n.itens.map((i) => i.descricao).join(' ')).toLowerCase();
        if (!hay.includes(ql)) return false;
      }
      return true;
    });
  }, [sorted, query, fSupplier, fPeriod, fStatus]);

  if (!nfes) return <LoadingState />;

  const filteredTotal = list.reduce((a, b) => a + (b.sit === 'cancelada' ? 0 : b.valor), 0);
  const hasFilters = query || fSupplier !== 'all' || fPeriod !== 'all' || fStatus !== 'all';

  const clearFilters = () => {
    setQuery('');
    setFSupplier('all');
    setFPeriod('all');
    setFStatus('all');
  };

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-[26px] font-extrabold tracking-[-0.025em]">Notas Fiscais Eletrônicas</h1>
        <div className="mt-1 text-[13px] text-text-3">
          {list.length} de {nfes.length} notas · valor filtrado{' '}
          <b className="font-mono text-text-2">{brl(filteredTotal)}</b>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <div className="relative min-w-[220px] flex-1">
          <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nº, chave, fornecedor ou produto…"
            className="h-10 w-full rounded-[11px] border border-border bg-surface pl-9 pr-3.5 font-sans text-[13px] text-text outline-none"
          />
        </div>
        <select
          value={fSupplier}
          onChange={(e) => setFSupplier(e.target.value)}
          className="h-10 cursor-pointer rounded-[11px] border border-border bg-surface px-3 font-sans text-[13px] text-text outline-none"
        >
          <option value="all">Todos os fornecedores</option>
          {supplierOptions.map((o) => (
            <option key={o.id} value={o.id}>
              {o.nome}
            </option>
          ))}
        </select>
        <select
          value={fPeriod}
          onChange={(e) => setFPeriod(e.target.value)}
          className="h-10 cursor-pointer rounded-[11px] border border-border bg-surface px-3 font-sans text-[13px] text-text outline-none"
        >
          <option value="all">Todo o período</option>
          {periodOptions.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
        <select
          value={fStatus}
          onChange={(e) => setFStatus(e.target.value)}
          className="h-10 cursor-pointer rounded-[11px] border border-border bg-surface px-3 font-sans text-[13px] text-text outline-none"
        >
          <option value="all">Toda situação</option>
          <option value="autorizada">Autorizada</option>
          <option value="cancelada">Cancelada</option>
        </select>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="h-10 rounded-[11px] border border-border bg-surface px-3.5 text-[12.5px] font-semibold text-text-2"
          >
            Limpar
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
        <div className="grid grid-cols-[1.7fr_92px_1fr_1.1fr_130px_96px] gap-3.5 border-b border-border bg-surface-2 px-5 py-[13px]">
          <span className="text-[11px] font-bold uppercase tracking-[.05em] text-text-3">Fornecedor</span>
          <span className="text-[11px] font-bold uppercase tracking-[.05em] text-text-3">Nº / Série</span>
          <span className="text-[11px] font-bold uppercase tracking-[.05em] text-text-3">Emissão</span>
          <span className="text-right text-[11px] font-bold uppercase tracking-[.05em] text-text-3">Valor</span>
          <span className="text-[11px] font-bold uppercase tracking-[.05em] text-text-3">Situação</span>
          <span className="text-right text-[11px] font-bold uppercase tracking-[.05em] text-text-3">Ações</span>
        </div>

        {list.map((n) => {
          const badge = statusBadge(n.sit);
          return (
            <div
              key={n.id}
              onClick={() => navigate(`/nfe/${n.id}`)}
              className="grid cursor-pointer grid-cols-[1.7fr_92px_1fr_1.1fr_130px_96px] items-center gap-3.5 border-b border-border px-5 py-[13px] hover:bg-surface-2"
            >
              <div className="flex min-w-0 items-center gap-[11px]">
                <div className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-[9px] bg-accent-soft text-[11px] font-extrabold text-accent-2">
                  {initials(n.fornecedor)}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-[13px] font-semibold">{n.fornecedor}</div>
                  <div className="truncate font-mono text-[10.5px] text-text-3">{n.chave.slice(0, 29)}…</div>
                </div>
              </div>
              <div className="font-mono text-[12.5px]">
                <div className="font-semibold">{n.numero}</div>
                <div className="text-[10.5px] text-text-3">Série {n.serie}</div>
              </div>
              <div className="font-mono text-[12.5px] text-text-2">{formatDate(n.data)}</div>
              <div className="text-right font-mono text-[13.5px] font-bold">{brl(n.valor)}</div>
              <div>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-[3px] text-[11.5px] font-bold ${toneBg[badge.tone]} ${toneText[badge.tone]}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${badge.tone === 'pos' ? 'bg-pos' : 'bg-danger'}`} />
                  {badge.label}
                </span>
              </div>
              <div className="flex justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => navigate(`/nfe/${n.id}`)}
                  title="Ver detalhes"
                  className="flex h-8 w-8 items-center justify-center rounded-[9px] border border-border bg-surface text-text-2"
                >
                  <IconEye />
                </button>
                <button
                  onClick={() => showToast('XML ' + n.numero + ' baixado')}
                  title="Baixar XML"
                  className="flex h-8 w-8 items-center justify-center rounded-[9px] border border-border bg-surface text-text-2"
                >
                  <IconDownload />
                </button>
              </div>
            </div>
          );
        })}

        {list.length === 0 && (
          <div className="p-[54px] text-center text-text-3">
            <div className="mb-1 text-[14px] font-semibold">Nenhuma nota encontrada</div>
            <div className="text-[12.5px]">Ajuste os filtros ou limpe a busca.</div>
          </div>
        )}
      </div>
    </div>
  );
}
