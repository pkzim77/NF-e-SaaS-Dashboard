import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { nfes } from '../data/nfes';
import { useToast } from '../context/ToastContext';
import { brl, formatDate, shortName } from '../utils/format';
import { IconDownload, IconEye, IconFolder, IconSwap } from '../icons/Icons';

const periods = [
  { id: '2026-06', label: 'Junho 2026' },
  { id: '2026-05', label: 'Maio 2026' },
];

export default function XmlCentral() {
  const navigate = useNavigate();
  const showToast = useToast();

  const groups = useMemo(() => {
    const sorted = [...nfes].sort((a, b) => b.data.localeCompare(a.data));
    return periods.map((g) => {
      const items = sorted.filter((n) => n.data.startsWith(g.id));
      return {
        ...g,
        count: items.length,
        total: brl(items.reduce((a, b) => a + (b.sit === 'cancelada' ? 0 : b.valor), 0)),
        items: items.map((n) => ({
          id: n.id,
          file: 'NFe' + n.chave.replace(/\s/g, '').slice(0, 20) + '.xml',
          fornecedor: shortName(n.fornecedor),
          data: formatDate(n.data),
          valor: brl(n.valor),
          numero: n.numero,
        })),
      };
    });
  }, []);

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-[26px] font-extrabold tracking-[-0.025em]">Central de XML</h1>
        <div className="mt-1 text-[13px] text-text-3">Arquivos organizados por período · {nfes.length} XMLs armazenados</div>
      </div>

      <div className="flex flex-col gap-4">
        {groups.map((g) => (
          <div key={g.id} className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
            <div className="flex items-center justify-between border-b border-border bg-surface-2 px-5 py-3.5">
              <div className="flex items-center gap-[11px]">
                <IconFolder />
                <span className="text-[14px] font-bold">{g.label}</span>
                <span className="rounded-full bg-surface-3 px-2.5 py-0.5 text-[11.5px] font-semibold text-text-3">{g.count} arquivos</span>
              </div>
              <span className="font-mono text-[13px] font-bold">{g.total}</span>
            </div>
            {g.items.map((x) => (
              <div key={x.id} className="flex items-center gap-[13px] border-b border-border px-5 py-[11px]">
                <IconSwap size={17} color="var(--text-3)" />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-mono text-[12.5px] font-semibold">{x.file}</div>
                  <div className="text-[11px] text-text-3">
                    {x.fornecedor} · {x.data}
                  </div>
                </div>
                <span className="font-mono text-[12.5px] font-bold">{x.valor}</span>
                <button
                  onClick={() => navigate(`/nfe/${x.id}`)}
                  className="flex h-8 w-8 items-center justify-center rounded-[9px] border border-border bg-surface text-text-2"
                >
                  <IconEye size={15} />
                </button>
                <button
                  onClick={() => showToast('XML ' + x.numero + ' baixado')}
                  className="flex h-8 w-8 items-center justify-center rounded-[9px] border border-border bg-surface text-text-2"
                >
                  <IconDownload size={15} />
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
