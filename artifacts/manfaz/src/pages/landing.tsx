import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { ArrowLeft, ArrowUpLeft, Check, ChevronDown, MessageCircle, MousePointer2, Sparkles, Store, WandSparkles } from 'lucide-react';
import { Link } from 'wouter';
import { getGetPublicWhatsappQueryKey, useGetPublicWhatsapp } from '@workspace/api-client-react';
import { Brand } from '@/components/brand';

function WhatsAppLink({ number, children, className = '' }: { number?: string; children: ReactNode; className?: string }) {
  const href = number ? `https://wa.me/${number.replace(/[^\d]/g, '')}` : undefined;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-disabled={!href}
      className={`${className} ${!href ? 'pointer-events-none opacity-60' : ''}`}
      data-testid="link-start-whatsapp"
    >
      {children}
    </a>
  );
}

export default function Landing() {
  const whatsapp = useGetPublicWhatsapp({ query: { queryKey: getGetPublicWhatsappQueryKey() } });
  const number = whatsapp.data?.whatsappNumber || import.meta.env.VITE_WHATSAPP_NUMBER || '';
  const displayNumber = useMemo(() => number || 'واتساب منفذ', [number]);

  return (
    <main className="grain min-h-[100dvh] overflow-hidden bg-[#fff8ee] text-[#1b2735]">
      <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 md:px-10 md:py-7">
        <Brand />
        <div className="hidden items-center gap-8 text-sm font-semibold text-[#5c6970] md:flex">
          <a href="#how-it-works" className="transition-colors hover:text-[#e66f51]" data-testid="link-how-it-works">كيف يعمل؟</a>
          <a href="#why-manfaz" className="transition-colors hover:text-[#e66f51]" data-testid="link-why-manfaz">لماذا منفذ؟</a>
          <Link href="/admin" className="rounded-full border border-[#ded2c3] px-4 py-2 transition-colors hover:border-[#e66f51] hover:text-[#e66f51]" data-testid="link-admin">دخول الإدارة</Link>
        </div>
        <Link href="/admin" className="rounded-full border border-[#ded2c3] px-3 py-2 text-xs font-bold md:hidden" data-testid="link-admin-mobile">الإدارة</Link>
      </nav>

      <section className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-10 md:grid-cols-[.93fr_1.07fr] md:px-10 md:pb-32 md:pt-20">
        <div className="relative z-10 max-w-2xl">
          <div className="rise-in mb-7 inline-flex items-center gap-2 rounded-full border border-[#e7d9c8] bg-[#fffdf8] px-3 py-2 text-xs font-bold text-[#e66f51] shadow-[0_8px_30px_rgba(69,47,30,.05)]">
            <span className="pulse-soft size-2 rounded-full bg-[#e66f51]" />
            مساحة جديدة لعملك
          </div>
          <h1 className="rise-in rise-in-delay-1 font-serif text-[clamp(2.8rem,7vw,6.4rem)] font-bold leading-[1.12] tracking-[-.055em]">
            من محادثة،<br /><span className="text-[#e66f51]">إلى موقع يُرى.</span>
          </h1>
          <p className="rise-in rise-in-delay-2 mt-7 max-w-lg text-lg leading-9 text-[#5c6970] md:text-xl">
            منفذ يحوّل طلباتك على واتساب إلى حضور رقمي يشبهك. اكتب، عدّل، وانشر موقعك بدون تعقيد.
          </p>
          <div className="rise-in rise-in-delay-3 mt-9 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <WhatsAppLink number={number} className="group flex items-center gap-3 rounded-2xl bg-[#1b2735] px-6 py-4 font-bold text-[#fff8ee] shadow-[0_12px_0_#d9c5a8] transition-all hover:-translate-y-1 hover:shadow-[0_15px_0_#d9c5a8] active:translate-y-0 active:shadow-[0_7px_0_#d9c5a8]">
              <MessageCircle size={21} />
              ابدأ عبر واتساب
              <ArrowLeft className="transition-transform group-hover:-translate-x-1" size={18} />
            </WhatsAppLink>
            <span className="text-xs font-medium text-[#829097]">{whatsapp.isError ? 'تعذّر تحميل الرقم، حاول مرة أخرى' : displayNumber}</span>
          </div>
          <div className="mt-8 flex items-center gap-4 text-xs font-semibold text-[#829097]">
            <span className="flex items-center gap-2"><Check size={15} className="text-[#789d64]" /> بدون بطاقة بنكية</span>
            <span className="flex items-center gap-2"><Check size={15} className="text-[#789d64]" /> جاهز للمشاركة</span>
          </div>
        </div>

        <div className="relative min-h-[470px] md:min-h-[590px]">
          <div className="absolute right-0 top-8 h-[390px] w-[390px] rounded-full bg-[#f3dfb0] opacity-70 blur-[1px] md:h-[540px] md:w-[540px]" />
          <div className="absolute -left-6 bottom-5 size-24 rounded-[30px] border-[10px] border-[#789d64]/30 bg-[#dbe8d5] md:left-4" />
          <div className="absolute right-3 top-0 z-10 flex w-[min(100%,420px)] -rotate-2 flex-col rounded-[28px] border border-[#ded2c3] bg-[#fffdf8] p-5 shadow-[0_30px_80px_rgba(69,47,30,.15)] md:right-8 md:top-10">
            <div className="mb-5 flex items-center gap-3 border-b border-[#eee4d7] pb-4">
              <span className="grid size-10 place-items-center rounded-xl bg-[#dbe8d5] text-[#426440]"><MessageCircle size={19} /></span>
              <div><div className="text-sm font-bold">منفذ</div><div className="text-[11px] text-[#829097]">متصل الآن</div></div>
              <span className="mr-auto size-2 rounded-full bg-[#789d64]" />
            </div>
            <div className="self-start rounded-2xl rounded-tr-sm bg-[#f2eadf] px-4 py-3 text-sm leading-7 text-[#35434b]">أهلاً! أريد موقعاً لمخبزي<br />بألوان دافئة وبسيطة.</div>
            <div className="mt-3 max-w-[86%] self-end rounded-2xl rounded-tl-sm bg-[#dbe8d5] px-4 py-3 text-sm leading-7 text-[#35434b]">فكرة جميلة. ما اسم المخبز؟<br />وما الذي تحب أن يعرفه الناس عنك؟</div>
            <div className="mt-3 self-start rounded-2xl rounded-tr-sm bg-[#f2eadf] px-4 py-3 text-sm leading-7 text-[#35434b]">رغيف وسمسم. نخبز كل صباح<br />بمكونات من مزارعنا المحلية.</div>
            <div className="mt-5 flex items-center gap-2 border-t border-[#eee4d7] pt-4 text-xs font-semibold text-[#789d64]"><Sparkles size={14} /> جارٍ تجهيز واجهتك</div>
          </div>
          <div className="drift absolute bottom-4 left-0 z-20 w-[min(78%,330px)] rotate-3 rounded-[26px] border border-[#ded2c3] bg-[#1b2735] p-3 shadow-[0_25px_55px_rgba(28,39,53,.24)] md:bottom-3 md:left-7">
            <div className="rounded-[18px] bg-[#fff8ee] p-4">
              <div className="flex items-center justify-between"><span className="font-serif text-lg font-bold">رغيف وسمسم</span><span className="grid size-7 place-items-center rounded-full bg-[#e66f51] text-[#fff8ee]"><ArrowUpLeft size={15} /></span></div>
              <div className="mt-4 h-24 rounded-2xl bg-[#e9c89d] p-3"><div className="size-12 rounded-full border-[8px] border-[#b87b54]/60" /></div>
              <div className="mt-3 flex items-center justify-between text-[10px] text-[#829097]"><span>خبز اليوم</span><span className="font-bold text-[#e66f51]">اكتشف القائمة</span></div>
            </div>
          </div>
          <div className="absolute bottom-28 right-0 z-20 flex -rotate-6 items-center gap-2 rounded-2xl border border-[#eadcc8] bg-[#efb93b] px-4 py-3 text-xs font-bold shadow-[0_12px_25px_rgba(173,124,30,.18)] md:right-2"><MousePointer2 size={15} /> موقعك يبدأ من هنا</div>
        </div>
      </section>

      <section className="border-y border-[#e9dece] bg-[#f6eddf] px-5 py-14 md:px-10 md:py-20" id="how-it-works">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex flex-col gap-5 md:flex-row md:items-end md:justify-between"><div><p className="mb-3 text-sm font-bold text-[#e66f51]">ثلاث خطوات فقط</p><h2 className="font-serif text-3xl font-bold tracking-tight md:text-5xl">خلّ الباقي علينا.</h2></div><p className="max-w-sm text-sm leading-7 text-[#69777d]">لا قوالب معقدة ولا لوحة تحكم مربكة. تحدث مع منفذ كأنك تتحدث مع شخص من فريقك.</p></div>
          <div className="grid gap-px overflow-hidden rounded-[28px] border border-[#dfd1bd] bg-[#dfd1bd] md:grid-cols-3">
            {[
              { n: '٠١', icon: MessageCircle, title: 'احكِ فكرتك', body: 'أرسل رسالة على واتساب: اسم مشروعك، خدماتك، وما تريد أن يراه عملاؤك.' },
              { n: '٠٢', icon: WandSparkles, title: 'عدّل براحتك', body: 'اطلب تغيير الألوان أو النصوص أو الصور. منفذ يفهمك وينفّذ فوراً.' },
              { n: '٠٣', icon: Store, title: 'شارك موقعك', body: 'تحصل على رابط خاص بمشروعك. ضعه في حساباتك وابدأ باستقبال عملاء جدد.' },
            ].map(({ n, icon: Icon, title, body }) => <div key={n} className="group bg-[#fffaf1] p-7 transition-colors hover:bg-[#fffdf8] md:p-9" data-testid={`card-step-${n}`}><div className="flex items-center justify-between"><span className="font-mono text-xs font-bold text-[#e66f51]">{n}</span><span className="grid size-11 place-items-center rounded-2xl bg-[#dbe8d5] text-[#426440] transition-transform group-hover:-rotate-6"><Icon size={20} /></span></div><h3 className="mt-12 font-serif text-xl font-bold">{title}</h3><p className="mt-3 text-sm leading-7 text-[#69777d]">{body}</p></div>)}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 md:px-10 md:py-28" id="why-manfaz">
        <div className="grid gap-12 md:grid-cols-[.72fr_1.28fr] md:items-center">
          <div><p className="mb-4 text-sm font-bold text-[#e66f51]">صُمّم لك</p><h2 className="font-serif text-3xl font-bold leading-[1.4] tracking-tight md:text-5xl">مشروعك يستحق<br /><span className="text-[#789d64]">أن يُؤخذ بجدية.</span></h2><p className="mt-6 max-w-md leading-8 text-[#69777d]">منفذ يعطي أصحاب المشاريع الصغيرة الأدوات التي كانت تبدو بعيدة: موقع جميل، صوت واضح، ومكان واحد يجمع كل شيء.</p><WhatsAppLink number={number} className="mt-8 inline-flex items-center gap-2 font-bold text-[#e66f51] underline decoration-[#efb93b] decoration-4 underline-offset-8 transition-colors hover:text-[#1b2735]" >جرّبها الآن <ArrowLeft size={17} /></WhatsAppLink></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[28px] bg-[#1b2735] p-7 text-[#fff8ee] sm:translate-y-8"><Sparkles className="mb-12 text-[#efb93b]" size={25} /><h3 className="font-serif text-xl font-bold">صوتك أولاً</h3><p className="mt-3 text-sm leading-7 text-[#c7d0cd]">نكتب معك، لا بدلاً منك. موقعك يحتفظ بلهجتك وروح مشروعك.</p></div>
            <div className="rounded-[28px] border border-[#e2d5c5] bg-[#fffdf8] p-7"><MousePointer2 className="mb-12 text-[#e66f51]" size={25} /><h3 className="font-serif text-xl font-bold">واضح من أول نظرة</h3><p className="mt-3 text-sm leading-7 text-[#69777d]">كل صفحة مرتبة حول الشيء الأهم: أن يتواصل العميل معك.</p></div>
            <div className="rounded-[28px] border border-[#e2d5c5] bg-[#dbe8d5] p-7"><Check className="mb-12 text-[#426440]" size={25} /><h3 className="font-serif text-xl font-bold">جاهز للنمو</h3><p className="mt-3 text-sm leading-7 text-[#4e6651]">ابدأ بصفحة واحدة، ثم طوّرها كلما كبر مشروعك.</p></div>
            <div className="rounded-[28px] bg-[#efb93b] p-7 sm:translate-y-8"><ArrowUpLeft className="mb-12 text-[#1b2735]" size={25} /><h3 className="font-serif text-xl font-bold">لك رابطك الخاص</h3><p className="mt-3 text-sm leading-7 text-[#5c4818]">موقع مستقل تستطيع إرساله بثقة في كل مكان.</p></div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#e66f51] px-5 py-20 text-[#fff8ee] md:px-10 md:py-28">
        <div className="absolute -left-24 -top-24 size-72 rounded-full border-[40px] border-[#f3a486]/50" /><div className="absolute -bottom-36 right-10 size-96 rounded-full border-[55px] border-[#c95a43]/50" />
        <div className="relative mx-auto flex max-w-5xl flex-col items-start justify-between gap-8 md:flex-row md:items-center"><div><p className="mb-4 text-sm font-bold text-[#ffe0a4]">الخطوة الأولى تبدأ برسالة</p><h2 className="max-w-2xl font-serif text-3xl font-bold leading-[1.5] md:text-5xl">جاهز تخلي الناس<br />تلقى مشروعك؟</h2></div><WhatsAppLink number={number} className="group flex shrink-0 items-center gap-3 rounded-2xl bg-[#fff8ee] px-6 py-4 font-bold text-[#1b2735] shadow-[0_10px_0_#bd503e] transition-transform hover:-translate-y-1"><MessageCircle size={20} /> ابدأ على واتساب <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" /></WhatsAppLink></div>
      </section>

      <footer className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 text-xs text-[#829097] md:flex-row md:items-center md:justify-between md:px-10"><Brand /><div className="flex items-center gap-4"><span>منفذ — حضورك الرقمي يبدأ ببساطة</span><Link href="/admin" className="font-semibold text-[#5c6970] hover:text-[#e66f51]" data-testid="link-footer-admin">الإدارة</Link></div></footer>
    </main>
  );
}