import { useToastMessage } from '../../context/ToastContext';
import { IconCheckCircle } from '../../icons/Icons';

export default function Toast() {
  const message = useToastMessage();
  if (!message) return null;

  return (
    <div className="animate-ff-pop fixed bottom-6 left-1/2 z-[200] flex -translate-x-1/2 items-center gap-2.5 rounded-[13px] bg-text px-5 py-3.5 text-[13px] font-semibold text-bg shadow-[0_8px_30px_rgba(0,0,0,.25)]">
      <IconCheckCircle size={17} />
      {message}
    </div>
  );
}
