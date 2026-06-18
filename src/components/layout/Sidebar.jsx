import { NavLink } from 'react-router-dom';
import { IconBarChart, IconBuilding, IconCheck, IconDocument, IconGrid, IconSwap } from '../../icons/Icons';
import { useApi } from '../../hooks/useApi';

function navLinkClass({ isActive }) {
  return [
    'flex w-full items-center gap-[11px] rounded-[11px] px-3 py-2.5 text-left text-[13.5px]',
    isActive ? 'bg-accent-soft font-bold text-accent-2' : 'font-semibold text-text-2 hover:bg-surface-2',
  ].join(' ');
}

export default function Sidebar() {
  const { data: nfes } = useApi('nfes');

  const navItems = [
    { to: '/', end: true, label: 'Dashboard', icon: IconGrid },
    { to: '/nfe', end: false, label: 'Notas Fiscais', icon: IconDocument, badge: nfes?.length },
    { to: '/xml', end: false, label: 'Central de XML', icon: IconSwap },
    { to: '/relatorios', end: false, label: 'Relatórios', icon: IconBarChart },
    { to: '/empresa', end: false, label: 'Empresa & Certificado', icon: IconBuilding },
  ];

  return (
    <aside className="sticky top-0 flex h-screen w-[248px] flex-none flex-col border-r border-border bg-surface">
      <div className="flex items-center gap-[11px] px-[22px] pb-[18px] pt-[22px]">
        <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-accent shadow-[0_2px_8px_var(--accent-soft)]">
          <IconDocument size={20} color="#fff" />
        </div>
        <div className="leading-[1.1]">
          <div className="text-[16px] font-extrabold tracking-[-0.02em]">FiscalFlow</div>
          <div className="text-[11px] font-medium text-text-3">Coleta de NF-e</div>
        </div>
      </div>

      <nav className="flex flex-col gap-0.5 px-3 py-1.5">
        {navItems.map(({ to, end, label, icon: Icon, badge }) => (
          <NavLink key={to} to={to} end={end} className={navLinkClass}>
            <Icon size={19} />
            <span>{label}</span>
            {badge != null && (
              <span className="ml-auto rounded-full bg-accent-soft px-[7px] py-0.5 text-[11px] font-bold text-accent-2">
                {badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto px-3.5 py-4">
        <div className="flex items-start gap-[11px] rounded-[14px] border border-border bg-surface-2 px-3.5 py-[13px]">
          <div className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-[9px] bg-pos-soft">
            <IconCheck size={16} color="var(--pos)" />
          </div>
          <div className="leading-[1.3]">
            <div className="text-[12.5px] font-bold">Coleta ativa</div>
            <div className="text-[11px] text-text-3">Última sync há 12 min</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
