import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import LoadingState from '../components/ui/LoadingState';
import { useToast } from '../context/ToastContext';
import { brl, formatDateLong } from '../utils/format';
import { toneBg, toneText } from '../utils/tone';
import { IconArrowLeft, IconDownload, IconSwap } from '../icons/Icons';

function statusBadge(sit) {
  return sit === 'autorizada' ? { tone: 'pos', label: 'Autorizada' } : { tone: 'danger', label: 'Cancelada' };
}

export default function NfeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const showToast = useToast();
  const [xmlView, setXmlView] = useState(false);
  const { data: nfe } = useApi(`nfes/${id}`);
  const { data: company } = useApi('company');

  if (!nfe || !company) return <LoadingState />;

  const badge = statusBadge(nfe.sit);

  return (
    <div>
      <button
        onClick={() => navigate('/nfe')}
        className="mb-4 flex items-center gap-1.5 text-[13px] font-semibold text-text-2"
      >
        <IconArrowLeft />
        Voltar para a listagem
      </button>

      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-[7px] flex items-center gap-2.5">
            <h1 className="whitespace-nowrap text-[23px] font-extrabold tracking-[-0.02em]">Nota Fiscal nº {nfe.numero}</h1>
            <span className={`rounded-full px-[11px] py-[3px] text-[11.5px] font-bold ${toneBg[badge.tone]} ${toneText[badge.tone]}`}>
              {badge.label}
            </span>
          </div>
          <div className="font-mono text-[11.5px] tracking-[.02em] text-text-3">{nfe.chave}</div>
        </div>
        <div className="flex gap-[9px]">
          <button
            onClick={() => setXmlView((v) => !v)}
            className="flex h-10 items-center gap-2 rounded-[11px] border border-border bg-surface px-[15px] text-[13px] font-semibold text-text"
          >
            <IconSwap />
            {xmlView ? 'Ocultar XML' : 'Visualizar XML'}
          </button>
          <button
            onClick={() => (nfe.xml ? showToast('XML ' + nfe.numero + ' baixado') : showToast('XML completo não disponível para esta nota'))}
            disabled={!nfe.xml}
            className="flex h-10 items-center gap-2 rounded-[11px] bg-accent px-[15px] text-[13px] font-semibold text-white disabled:opacity-50"
          >
            <IconDownload color="#fff" />
            Baixar XML
          </button>
        </div>
      </div>

      {xmlView ? (
        <div className="mb-4 max-h-[380px] overflow-auto rounded-2xl border border-border-2 bg-[#0c0e13] px-[22px] py-5">
          {nfe.xml ? (
            <pre className="whitespace-pre font-mono text-[12px] leading-[1.7] text-[#c9d4e8]">{nfe.xml}</pre>
          ) : (
            <div className="text-[12.5px] text-text-3">
              XML completo não disponível — esta nota foi recebida como resumo (resNFe) na Distribuição DFe, sem o XML completo.
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-border bg-surface p-[22px] shadow-card">
              <div className="mb-[11px] text-[11px] font-bold uppercase tracking-[.05em] text-text-3">Emitente · Fornecedor</div>
              <div className="mb-2.5 text-[15.5px] font-bold">{nfe.fornecedor}</div>
              <div className="flex flex-col gap-[7px]">
                <div className="flex justify-between">
                  <span className="text-[12.5px] text-text-3">CNPJ</span>
                  <span className="font-mono text-[12.5px] font-semibold">{nfe.fornCnpj}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[12.5px] text-text-3">Insc. Estadual</span>
                  <span className="font-mono text-[12.5px] font-semibold">{nfe.fornIe || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[12.5px] text-text-3">Município</span>
                  <span className="text-[12.5px] font-semibold">{nfe.fornCidade || '—'}</span>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-surface p-[22px] shadow-card">
              <div className="mb-[11px] text-[11px] font-bold uppercase tracking-[.05em] text-text-3">Destinatário · Sua empresa</div>
              <div className="mb-2.5 text-[15.5px] font-bold">{company.razaoSocial}</div>
              <div className="flex flex-col gap-[7px]">
                <div className="flex justify-between">
                  <span className="text-[12.5px] text-text-3">CNPJ</span>
                  <span className="font-mono text-[12.5px] font-semibold">{company.cnpj}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[12.5px] text-text-3">Insc. Estadual</span>
                  <span className="font-mono text-[12.5px] font-semibold">{company.ie}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[12.5px] text-text-3">Emissão</span>
                  <span className="text-[12.5px] font-semibold">{formatDateLong(nfe.data)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-4 overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
            <div className="border-b border-border px-5 py-[15px] text-[15px] font-bold">Produtos &amp; serviços</div>
            {nfe.itens.length > 0 ? (
              <>
                <div className="grid grid-cols-[62px_1fr_96px_70px_80px_100px_110px] gap-3 border-b border-border bg-surface-2 px-5 py-[11px]">
                  <span className="text-[10.5px] font-bold uppercase text-text-3">Cód</span>
                  <span className="text-[10.5px] font-bold uppercase text-text-3">Descrição</span>
                  <span className="text-[10.5px] font-bold uppercase text-text-3">NCM</span>
                  <span className="text-[10.5px] font-bold uppercase text-text-3">CFOP</span>
                  <span className="text-right text-[10.5px] font-bold uppercase text-text-3">Qtd</span>
                  <span className="text-right text-[10.5px] font-bold uppercase text-text-3">V. Unit</span>
                  <span className="text-right text-[10.5px] font-bold uppercase text-text-3">V. Total</span>
                </div>
                {nfe.itens.map((it) => (
                  <div
                    key={it.codigo}
                    className="grid grid-cols-[62px_1fr_96px_70px_80px_100px_110px] items-center gap-3 border-b border-border px-5 py-3 font-mono text-[12.5px]"
                  >
                    <span className="text-text-3">{it.codigo}</span>
                    <span className="font-sans font-semibold">{it.descricao}</span>
                    <span className="text-text-2">{it.ncm}</span>
                    <span className="text-text-2">{it.cfop}</span>
                    <span className="text-right">{it.qtd}</span>
                    <span className="text-right text-text-2">{brl(it.vUnit)}</span>
                    <span className="text-right font-bold">{brl(it.vTotal)}</span>
                  </div>
                ))}
              </>
            ) : (
              <div className="p-[40px] text-center text-text-3">
                <div className="mb-1 text-[13.5px] font-semibold">Itens não disponíveis</div>
                <div className="text-[12px]">A SEFAZ enviou apenas o resumo desta nota (resNFe), sem a lista de produtos.</div>
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center rounded-2xl bg-gradient-to-br from-accent to-accent-2 p-[22px] text-white shadow-card">
            <div className="mb-2.5 flex items-center justify-between">
              <span className="text-[13px] opacity-85">Total de produtos</span>
              <span className="font-mono text-[14px] font-bold">{brl(nfe.totalProd)}</span>
            </div>
            <div className="mb-2.5 flex items-center justify-between">
              <span className="text-[13px] opacity-85">Frete / outros</span>
              <span className="font-mono text-[14px] font-bold">{brl(nfe.frete)}</span>
            </div>
            <div className="my-1.5 h-px bg-white/25" />
            <div className="flex items-end justify-between">
              <span className="text-[14px] font-semibold opacity-90">Valor total da nota</span>
              <span className="font-mono text-[28px] font-extrabold tracking-[-0.02em]">{brl(nfe.valor)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
