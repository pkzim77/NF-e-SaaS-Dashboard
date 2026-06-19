import { useEffect, useState } from 'react';
import Card from '../components/ui/Card';
import LoadingState from '../components/ui/LoadingState';
import { api } from '../api/client';
import { useApi } from '../hooks/useApi';
import { useToast } from '../context/ToastContext';
import { daysUntil } from '../utils/format';
import { IconLock, IconUpload, IconWarningTriangle } from '../icons/Icons';

const scheduleOptions = [
  { id: '1h', label: 'A cada hora', hint: 'recomendado' },
  { id: '6h', label: 'A cada 6 horas', hint: '' },
  { id: '24h', label: 'Uma vez por dia', hint: '' },
  { id: 'manual', label: 'Apenas manual', hint: '' },
];

function formatDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('pt-BR');
}

export default function Empresa() {
  const showToast = useToast();
  const { data: company } = useApi('company');
  const [schedule, setSchedule] = useState(null);

  useEffect(() => {
    if (company) setSchedule(company.scheduleFrequency);
  }, [company]);

  if (!company) return <LoadingState />;

  const companyFields = [
    { label: 'Razão social', value: company.razaoSocial },
    { label: 'Nome fantasia', value: company.nomeFantasia },
    { label: 'CNPJ', value: company.cnpj },
    { label: 'Inscrição estadual', value: company.ie },
    { label: 'Endereço', value: company.endereco },
    { label: 'Cidade / UF', value: company.cidadeUf },
    { label: 'Telefone', value: company.telefone },
    { label: 'E-mail', value: company.email },
    { label: 'Situação', value: company.situacao },
    { label: 'Data de cadastro', value: company.dataCadastro },
  ];

  const cert = company.certificate;
  const dias = cert ? daysUntil(cert.validoAte) : null;
  const vencido = dias !== null && dias < 0;

  const changeSchedule = async (id, label) => {
    setSchedule(id);
    try {
      await api.patch('company', { scheduleFrequency: id });
      showToast('Frequência: ' + label);
    } catch {
      showToast('Não foi possível salvar a frequência');
    }
  };

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-[26px] font-extrabold tracking-[-0.025em]">Empresa &amp; Certificado</h1>
        <div className="mt-1 text-[13px] text-text-3">Dados cadastrais e certificado digital A1</div>
      </div>

      <div className="mb-4 grid grid-cols-[1.3fr_1fr] gap-4">
        <Card>
          <div className="mb-[18px] flex items-center gap-3.5">
            <div className="flex h-[52px] w-[52px] items-center justify-center rounded-[13px] bg-gradient-to-br from-accent to-accent-2 text-[18px] font-extrabold text-white">
              {company.initials}
            </div>
            <div>
              <div className="text-[17px] font-extrabold tracking-[-0.02em]">{company.nome}</div>
              <div className="text-[12.5px] text-text-3">{company.segmento}</div>
            </div>
            <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-pos-soft px-3 py-1 text-[11.5px] font-bold text-pos">
              <span className="h-1.5 w-1.5 rounded-full bg-pos" />
              {company.situacao}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3.5">
            {companyFields.map((f) => (
              <div key={f.label}>
                <div className="mb-[3px] text-[11px] font-semibold uppercase tracking-[.04em] text-text-3">{f.label}</div>
                <div className="text-[13.5px] font-semibold">{f.value}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="flex flex-col">
          <div className="mb-4 flex items-center gap-2.5">
            <div className="flex h-[34px] w-[34px] items-center justify-center rounded-[9px] bg-accent-soft">
              <IconLock size={18} color="var(--accent-2)" />
            </div>
            <div className="text-[15px] font-bold">Certificado Digital A1</div>
          </div>
          {cert ? (
            <>
              {dias !== null && (
                <div
                  className={`mb-4 flex items-start gap-[11px] rounded-xl border px-3.5 py-[13px] ${
                    vencido ? 'border-danger bg-danger-soft' : 'border-warn bg-warn-soft'
                  }`}
                >
                  <IconWarningTriangle className="mt-px flex-none" />
                  <div className="leading-[1.4]">
                    <div className="text-[12.5px] font-bold text-text">
                      {vencido ? `Vencido há ${Math.abs(dias)} dias` : `Vence em ${dias} dias`}
                    </div>
                    <div className="text-[11.5px] text-text-2">
                      {vencido ? 'Renove o certificado para retomar a coleta.' : `Renove antes de ${cert.validoAte} para não interromper a coleta.`}
                    </div>
                  </div>
                </div>
              )}
              <div className="mb-4 flex flex-col gap-2.5">
                <div className="flex justify-between">
                  <span className="text-[12.5px] text-text-3">Titular</span>
                  <span className="text-[12.5px] font-semibold">{cert.titular}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[12.5px] text-text-3">Emitido em</span>
                  <span className="font-mono text-[12.5px] font-semibold">{cert.emitidoEm}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[12.5px] text-text-3">Válido até</span>
                  <span className="font-mono text-[12.5px] font-semibold">{cert.validoAte}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[12.5px] text-text-3">Arquivo</span>
                  <span className="font-mono text-[12.5px] font-semibold">{cert.arquivo}</span>
                </div>
              </div>
            </>
          ) : (
            <div className="mb-4 text-[12.5px] text-text-3">Nenhum certificado configurado.</div>
          )}
          <button
            onClick={() => showToast('Selecione um arquivo .pfx para enviar')}
            className="mt-auto flex h-[42px] items-center justify-center gap-2 rounded-[11px] border-[1.5px] border-dashed border-border-2 bg-surface-2 text-[13px] font-semibold text-text-2"
          >
            <IconUpload />
            Enviar novo .pfx
          </button>
        </Card>
      </div>

      <div className="grid grid-cols-[1fr_1.3fr] gap-4">
        <Card>
          <h3 className="mb-[5px] text-[15px] font-bold">Agendamento da coleta</h3>
          <div className="mb-[15px] text-[12px] text-text-3">Frequência de consulta à SEFAZ</div>
          <div className="flex flex-col gap-2">
            {scheduleOptions.map((o) => {
              const active = schedule === o.id;
              return (
                <button
                  key={o.id}
                  onClick={() => changeSchedule(o.id, o.label)}
                  className={[
                    'flex w-full items-center justify-between rounded-[11px] px-3.5 py-3 text-left text-[13px] font-semibold',
                    active ? 'border border-accent bg-accent-soft text-accent-2' : 'border border-border bg-surface text-text',
                  ].join(' ')}
                >
                  <span className="flex items-center gap-2.5">
                    <span className={`inline-block h-[9px] w-[9px] rounded-full ${active ? 'bg-accent' : 'bg-border-2'}`} />
                    {o.label}
                  </span>
                  <span className="text-[11.5px] text-text-3">{o.hint}</span>
                </button>
              );
            })}
          </div>
        </Card>

        <Card>
          <h3 className="mb-[15px] text-[15px] font-bold">Status da sincronização</h3>
          {company.sync ? (
            <div className="flex flex-col gap-3">
              <div className="flex justify-between">
                <span className="text-[12.5px] text-text-3">Última sincronização</span>
                <span className="font-mono text-[12.5px] font-semibold">{formatDateTime(company.sync.lastSync)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[12.5px] text-text-3">NSU atual</span>
                <span className="font-mono text-[12.5px] font-semibold">{company.sync.ultNSU}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[12.5px] text-text-3">NSU máximo disponível</span>
                <span className="font-mono text-[12.5px] font-semibold">{company.sync.maxNSU}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[12.5px] text-text-3">Situação</span>
                <span className="text-[12.5px] font-semibold">
                  {company.sync.ultNSU === company.sync.maxNSU ? 'Em dia com a SEFAZ' : 'Há lotes pendentes para baixar'}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-[12.5px] text-text-3">Nenhuma sincronização registrada ainda.</div>
          )}
        </Card>
      </div>
    </div>
  );
}
