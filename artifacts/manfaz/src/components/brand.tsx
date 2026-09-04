import { ArrowUpLeft, MessageCircle } from 'lucide-react';
import { Link } from 'wouter';

export function Brand({ dark = false }: { dark?: boolean }) {
  return (
    <Link href="/" className="group inline-flex items-center gap-3" data-testid="link-brand-home">
      <span className={`grid size-11 place-items-center rounded-2xl ${dark ? 'bg-[#efb93b] text-[#1b2735]' : 'bg-[#1b2735] text-[#fff8ee]'} transition-transform duration-300 group-hover:-rotate-6`}>
        <MessageCircle size={21} strokeWidth={2.4} />
      </span>
      <span className="leading-none">
        <span className={`block font-serif text-xl font-bold tracking-tight ${dark ? 'text-[#fff8ee]' : 'text-[#1b2735]'}`}>منفذ</span>
        <span className={`mt-1 block text-[10px] font-semibold tracking-[.18em] ${dark ? 'text-[#efb93b]' : 'text-[#e66f51]'}`}>MANFAZ</span>
      </span>
      <ArrowUpLeft className={`mr-1 size-4 opacity-0 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100 ${dark ? 'text-[#efb93b]' : 'text-[#e66f51]'}`} />
    </Link>
  );
}