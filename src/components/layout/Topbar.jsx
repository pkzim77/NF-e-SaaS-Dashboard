import { useMemo, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useSearch } from '../../context/SearchContext';
import { useApi } from '../../hooks/useApi';
import { brl, daysUntil, formatDate, shortName, timeAgo } from '../../utils/format';
import {
  IconBell,
  IconCheck,
  IconChevronDown,
  IconDocument,
  IconLock,
  IconMoon,
  IconSearch,
  IconSun,
  IconWarningTriangle,
} from '../../icons/Icons';

export default function Topbar() {
  const { theme, toggleTheme } = useTheme();
  const { query, setQuery } = useSearch();
  const { data: company } = useApi('company');
  const { data: nfes } = useApi('nfes');
  const [companyOpen, setCompanyOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const notifications = useMemo(() => {
    const list = [];
    const ultima = nfes && [...nfes].sort((a, b) => b.data.localeCompare(a.data))[0];
    if (ultima) {
      list.push({
        title: 'Nova NF-e recebida',
        desc: `${shortName(ultima.fornecedor)} · ${brl(ultima.valor)}`,
        time: formatDate(ultima.data),
        bg: 'bg-accent-soft',
        icon: <IconDocument size={16} color="var(--accent-2)" />,
      });
    }
    const cert = company?.certificate;
    const dias = cert ? daysUntil(cert.validoAte) : null;
    if (dias !== null && dias <= 60) {
      list.push({
        title: dias < 0 ? 'Certificado vencido' : 'Certificado próximo do vencimento',
        desc: dias < 0 ? `Vencido há ${Math.abs(dias)} dias (${cert.validoAte})` : `Expira em ${dias} dias (${cert.validoAte})`,
        time: '',
        bg: 'bg-warn-soft',
        icon: <IconWarningTriangle size={16} />,
      });
    }
    if (company?.sync) {
      list.push({
        title: 'Última coleta',
        desc: `${nfes?.length ?? 0} notas sincronizadas no total`,
        time: timeAgo(company.sync.lastSync),
        bg: 'bg-pos-soft',
        icon: <IconCheck size={16} color="var(--pos)" />,
      });
    }
    return list;
  }, [nfes, company]);

  return (
    <header className="sticky top-0 z-40 flex h-[66px] flex-none items-center gap-4 border-b border-border bg-surface px-[26px]">
      <div className="relative">
        <button
          onClick={() => {
            setCompanyOpen((v) => !v);
            setNotifOpen(false);
          }}
          className="flex items-center gap-2.5 rounded-[11px] border border-border bg-surface-2 px-3 py-[7px] text-text"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-accent text-[12px] font-extrabold text-white">
            {company?.initials}
          </div>
          <div className="text-left leading-[1.15]">
            <div className="text-[12.5px] font-bold">{company?.nome}</div>
            <div className="font-mono text-[10.5px] text-text-3">{company?.cnpj}</div>
          </div>
          <IconChevronDown />
        </button>
        {companyOpen && company && (
          <div className="animate-ff-pop absolute left-0 top-[52px] z-[60] w-[300px] rounded-2xl border border-border bg-surface p-[7px] shadow-card">
            <div className="px-2.5 pb-[5px] pt-2 text-[10.5px] font-bold uppercase tracking-[.05em] text-text-3">
              Empresas vinculadas
            </div>
            <div className="flex items-center gap-2.5 rounded-[9px] bg-accent-soft px-2.5 py-[9px]">
              <div className="flex h-[30px] w-[30px] items-center justify-center rounded-[8px] bg-accent text-[12px] font-extrabold text-white">
                {company.initials}
              </div>
              <div className="flex-1 leading-[1.2]">
                <div className="text-[12.5px] font-bold">{company.nome}</div>
                <div className="font-mono text-[10.5px] text-text-3">{company.cnpj}</div>
              </div>
              <IconCheck size={16} color="var(--accent-2)" />
            </div>
            <div className="flex items-center gap-1.5 px-2.5 pb-1.5 pt-2 text-[11px] text-text-3">
              <IconLock size={13} color="var(--text-3)" />
              Acesso Cliente · isolamento de dados ativo
            </div>
          </div>
        )}
      </div>

      <div className="relative max-w-[440px] flex-1">
        <IconSearch className="absolute left-[13px] top-1/2 -translate-y-1/2" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar nota, fornecedor, produto, chave ou CNPJ…"
          className="h-10 w-full rounded-[11px] border border-border bg-surface-2 pl-[38px] pr-3.5 font-sans text-[13px] text-text outline-none"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={toggleTheme}
          title="Alternar tema"
          className="flex h-10 w-10 items-center justify-center rounded-[11px] border border-border bg-surface-2 text-text-2"
        >
          {theme === 'dark' ? <IconMoon /> : <IconSun />}
        </button>

        <div className="relative">
          <button
            onClick={() => {
              setNotifOpen((v) => !v);
              setCompanyOpen(false);
            }}
            className="relative flex h-10 w-10 items-center justify-center rounded-[11px] border border-border bg-surface-2 text-text-2"
          >
            <IconBell />
            <span className="absolute right-[10px] top-[9px] h-[7px] w-[7px] rounded-full border-[1.5px] border-surface-2 bg-danger" />
          </button>
          {notifOpen && (
            <div className="animate-ff-pop absolute right-0 top-[50px] z-[60] w-[340px] overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
              <div className="flex items-center justify-between border-b border-border px-4 py-[13px]">
                <span className="text-[13.5px] font-bold">Notificações</span>
                <span className="cursor-pointer text-[11px] font-semibold text-accent-2">Marcar lidas</span>
              </div>
              {notifications.map((n, i) => (
                <div key={i} className="flex items-start gap-[11px] border-b border-border px-4 py-3">
                  <div className={`flex h-[30px] w-[30px] flex-none items-center justify-center rounded-[9px] ${n.bg}`}>
                    {n.icon}
                  </div>
                  <div className="flex-1 leading-[1.35]">
                    <div className="text-[12.5px] font-semibold">{n.title}</div>
                    <div className="text-[11.5px] text-text-3">{n.desc}</div>
                  </div>
                  <span className="whitespace-nowrap text-[10.5px] text-text-3">{n.time}</span>
                </div>
              ))}
              {notifications.length === 0 && (
                <div className="px-4 py-6 text-center text-[12px] text-text-3">Nenhuma notificação por enquanto.</div>
              )}
            </div>
          )}
        </div>

        <div className="ml-1 flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-2 text-[13px] font-bold text-white">
          CN
        </div>
      </div>
    </header>
  );
}
