import { useMemo } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { ArrowLeft, Clock3, ExternalLink, Instagram, MapPin, MessageCircle, Phone } from 'lucide-react';
import { useParams } from 'wouter';
import { getGetPublicWebsiteQueryKey, useGetPublicWebsite } from '@workspace/api-client-react';

type Json = Record<string, unknown>;

const asObject = (value: unknown): Json => (value && typeof value === 'object' && !Array.isArray(value) ? value as Json : {});
const text = (data: Json, keys: string[], fallback: string) => {
  for (const key of keys) if (typeof data[key] === 'string' && data[key]) return data[key] as string;
  return fallback;
};
const items = (data: Json, keys: string[]) => {
  for (const key of keys) if (Array.isArray(data[key])) return data[key] as unknown[];
  return [];
};
const money = (value: unknown) => typeof value === 'number' ? `${value.toLocaleString('ar-SA')} ر.س` : typeof value === 'string' ? value : 'اطلب السعر';

function SiteShell({ children, siteName, accent }: { children: ReactNode; siteName: string; accent: string }) {
  const style = { '--site-accent': accent } as CSSProperties;
  return <div dir="rtl" style={style} className="min-h-[100dvh] bg-[#fffdf8] text-[#202b2d] [--site-soft:#f2eee6] [--site-ink:#202b2d]">
    <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 md:px-10 md:py-7">
      <a href="#top" className="font-serif text-xl font-bold tracking-tight" data-testid="link-site-top">{siteName}</a>
      <nav className="hidden items-center gap-6 text-sm font-semibold text-[#657174] md:flex"><a href="#about" data-testid="link-site-about">عنّا</a><a href="#contact" data-testid="link-site-contact">تواصل</a><a href="#top" className="rounded-full bg-[var(--site-accent)] px-4 py-2 text-white" data-testid="link-site-action">ابدأ الآن</a></nav>
      <a href="#contact" className="grid size-10 place-items-center rounded-full bg-[var(--site-accent)] text-white md:hidden" data-testid="link-site-contact-mobile"><MessageCircle size={18} /></a>
    </header>
    {children}
     <footer id="contact" className="mt-20 border-t border-[#e8e1d7] bg-[var(--site-soft)] px-5 py-12 md:px-10"><div className="mx-auto flex max-w-6xl flex-col gap-5 md:flex-row md:items-end md:justify-between"><div><p className="font-serif text-lg font-bold">{siteName}</p><p className="mt-2 text-sm text-[#657174]">نصنع تجربة تستحق أن تُحكى.</p></div><div className="flex gap-3"><a href="#top" className="grid size-10 place-items-center rounded-full bg-white text-[var(--site-accent)]" data-testid="link-site-phone"><Phone size={17} /></a><a href="#top" className="grid size-10 place-items-center rounded-full bg-white text-[var(--site-accent)]" data-testid="link-site-social"><Instagram size={17} /></a></div></div></footer>
  </div>;
}

function StoreTemplate({ data, siteName }: { data: Json; siteName: string }) {
  const products = items(data, ['products', 'items', 'featuredProducts']);
  const intro = text(data, ['description', 'intro', 'about'], 'منتجات نختارها بعناية، لتصل إليك كما تحب.');
  return <SiteShell siteName={siteName} accent={text(data, ['themeColor', 'accent'], '#e66f51')}>
    <section id="top" className="mx-auto grid max-w-6xl gap-12 px-5 pb-10 pt-10 md:grid-cols-[1.1fr_.9fr] md:items-center md:px-10 md:pb-20 md:pt-16">
      <div><span className="mb-5 inline-flex rounded-full bg-[var(--site-soft)] px-3 py-2 text-xs font-bold text-[var(--site-accent)]">مختارات اليوم</span><h1 className="font-serif text-4xl font-bold leading-[1.45] md:text-6xl">{text(data, ['headline', 'title', 'heroTitle'], `أهلاً بك في ${siteName}`)}</h1><p className="mt-6 max-w-lg text-lg leading-8 text-[#657174]">{intro}</p><a href="#products" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[var(--site-accent)] px-5 py-3 font-bold text-white" data-testid="link-store-products">تصفّح المنتجات <ArrowLeft size={17} /></a></div>
      <div className="relative min-h-[340px] rounded-[32px] bg-[var(--site-soft)] p-5"><div className="absolute inset-8 rounded-[24px] border border-white/80 bg-white/55" /><div className="absolute right-12 top-12 size-28 rounded-full bg-[var(--site-accent)] opacity-80" /><div className="absolute bottom-10 left-10 h-32 w-44 rounded-[28px] bg-[#d4bc98] opacity-80" /><div className="absolute bottom-16 right-20 text-sm font-bold text-[#fffdf8]">{siteName}</div></div>
    </section>
       <section id="products" className="mx-auto max-w-6xl px-5 py-12 md:px-10"><div className="mb-7 flex items-end justify-between"><h2 className="font-serif text-2xl font-bold">المنتجات</h2><span className="text-xs text-[#657174]">{products.length} منتجات</span></div>{products.length === 0 ? <EmptyCollection label="لم تتم إضافة منتجات بعد." /> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{products.map((raw, index) => { const item = asObject(raw); return <article key={index} className="group overflow-hidden rounded-2xl border border-[#e8e1d7] bg-white p-3" data-testid={`card-product-${index}`}><div className="relative h-40 rounded-xl bg-[var(--site-soft)]"><div className="absolute bottom-4 right-4 size-16 rounded-full bg-[var(--site-accent)] opacity-80 transition-transform group-hover:scale-110" /></div><div className="px-2 pb-2 pt-4"><h3 className="font-bold">{text(item, ['name', 'title'], 'منتج')}</h3><div className="mt-3 flex items-center justify-between text-sm"><span className="font-bold text-[var(--site-accent)]">{money(item.price)}</span><a href="#contact" className="text-xs font-bold underline underline-offset-4" data-testid={`link-product-${index}`}>اطلبه</a></div></div></article>; })}</div>}</section>
  </SiteShell>;
}

function RestaurantTemplate({ data, siteName }: { data: Json; siteName: string }) {
  const menu = items(data, ['menu', 'menuItems', 'items']);
  return <SiteShell siteName={siteName} accent={text(data, ['themeColor', 'accent'], '#b35f3d')}>
    <section id="top" className="bg-[#27352f] px-5 py-20 text-[#fff9ef] md:px-10 md:py-28"><div className="mx-auto max-w-6xl"><p className="mb-6 text-sm font-bold text-[#e8be73]">{text(data, ['eyebrow', 'tagline'], 'من مطبخنا إلى مائدتكم')}</p><h1 className="max-w-3xl font-serif text-5xl font-bold leading-[1.35] md:text-7xl">{text(data, ['headline', 'title', 'heroTitle'], `نكهة ${siteName}`)}</h1><p className="mt-6 max-w-xl text-lg leading-8 text-[#c8d0c6]">{text(data, ['description', 'intro', 'about'], 'أطباق صادقة، مكونات طازجة، ووقت جميل حول الطاولة.')}</p><div className="mt-9 flex flex-wrap gap-3"><a href="#menu" className="rounded-xl bg-[var(--site-accent)] px-5 py-3 font-bold text-white" data-testid="link-restaurant-menu">شاهد القائمة</a><a href="#contact" className="rounded-xl border border-[#ffffff40] px-5 py-3 font-bold" data-testid="link-restaurant-reserve">احجز طاولتك</a></div></div></section>
     <section id="menu" className="mx-auto max-w-6xl px-5 py-16 md:px-10"><div className="mb-8 flex items-end justify-between"><div><p className="mb-2 text-xs font-bold text-[var(--site-accent)]">القائمة</p><h2 className="font-serif text-3xl font-bold">ما يشتهي القلب</h2></div><Clock3 size={25} className="text-[#b7a88e]" /></div>{menu.length === 0 ? <EmptyCollection label="لم تتم إضافة عناصر القائمة بعد." /> : <div className="grid gap-x-12 md:grid-cols-2">{menu.map((raw, index) => { const item = asObject(raw); return <div key={index} className="flex items-start justify-between gap-5 border-b border-[#e8e1d7] py-5" data-testid={`row-menu-${index}`}><div><h3 className="font-bold">{text(item, ['name', 'title'], 'طبق')}</h3><p className="mt-1 text-sm text-[#657174]">{text(item, ['description', 'details'], '')}</p></div><span className="shrink-0 font-bold text-[var(--site-accent)]">{money(item.price)}</span></div>; })}</div>}</section>
  </SiteShell>;
}

function ServicesTemplate({ data, siteName }: { data: Json; siteName: string }) {
  const services = items(data, ['services', 'offerings', 'items']);
  return <SiteShell siteName={siteName} accent={text(data, ['themeColor', 'accent'], '#5f7f72')}>
    <section id="top" className="mx-auto max-w-6xl px-5 pb-14 pt-14 md:px-10 md:pb-24 md:pt-24"><div className="max-w-3xl"><div className="mb-6 flex items-center gap-2 text-sm font-bold text-[var(--site-accent)]"><span className="size-2 rounded-full bg-[var(--site-accent)]" /> نعمل معك من الفكرة إلى الأثر</div><h1 className="font-serif text-5xl font-bold leading-[1.35] md:text-7xl">{text(data, ['headline', 'title', 'heroTitle'], `${siteName} ينجزها معك`)}</h1><p className="mt-7 max-w-2xl text-lg leading-9 text-[#657174]">{text(data, ['description', 'intro', 'about'], 'خدمات عملية مصممة لتجعل يومك أسهل ونتيجتك أوضح.')}</p><a href="#services" className="mt-9 inline-flex items-center gap-2 rounded-xl bg-[var(--site-accent)] px-5 py-3 font-bold text-white" data-testid="link-services-list">استكشف خدماتنا <ArrowLeft size={17} /></a></div></section>
     <section id="services" className="bg-[var(--site-soft)] px-5 py-16 md:px-10"><div className="mx-auto max-w-6xl"><h2 className="font-serif text-3xl font-bold">كيف نساعدك؟</h2>{services.length === 0 ? <EmptyCollection label="لم تتم إضافة الخدمات بعد." /> : <div className="mt-9 grid gap-4 md:grid-cols-2">{services.map((raw, index) => { const item = asObject(raw); return <article key={index} className="group rounded-2xl border border-[#e2d9cb] bg-[#fffdf8] p-6 transition-transform hover:-translate-y-1" data-testid={`card-service-${index}`}><span className="font-mono text-xs font-bold text-[var(--site-accent)]">0{index + 1}</span><h3 className="mt-10 font-serif text-xl font-bold">{text(item, ['name', 'title'], 'خدمة')}</h3><p className="mt-3 text-sm leading-7 text-[#657174]">{text(item, ['description', 'details'], '')}</p><ArrowLeft className="mt-6 text-[var(--site-accent)] transition-transform group-hover:-translate-x-1" size={17} /></article>; })}</div>}</div></section>
  </SiteShell>;
}

function PortfolioTemplate({ data, siteName }: { data: Json; siteName: string }) {
  const projects = items(data, ['projects', 'work', 'items']);
  return <SiteShell siteName={siteName} accent={text(data, ['themeColor', 'accent'], '#315e78')}>
    <section id="top" className="mx-auto max-w-6xl px-5 pb-16 pt-14 md:px-10 md:pb-28 md:pt-24"><p className="mb-5 text-sm font-bold text-[var(--site-accent)]">{text(data, ['eyebrow', 'tagline'], 'أعمال مختارة')}</p><h1 className="max-w-4xl font-serif text-5xl font-bold leading-[1.3] md:text-7xl">{text(data, ['headline', 'title', 'heroTitle'], `هذا هو ${siteName}`)}</h1><p className="mt-7 max-w-xl text-lg leading-8 text-[#657174]">{text(data, ['description', 'intro', 'about'], 'أصنع أشياء جميلة، مفيدة، وتبقى في الذاكرة.')}</p></section>
     <section id="projects" className="mx-auto max-w-6xl px-5 md:px-10">{projects.length === 0 ? <EmptyCollection label="لم تتم إضافة أعمال بعد." /> : <div className="grid gap-4 md:grid-cols-12">{projects.map((raw, index) => { const item = asObject(raw); return <article key={index} className={`group relative overflow-hidden rounded-3xl bg-[var(--site-soft)] p-5 ${index === 0 ? 'md:col-span-7 md:row-span-2' : 'md:col-span-5'}`} data-testid={`card-project-${index}`}><div className={`rounded-2xl bg-[var(--site-accent)]/15 ${index === 0 ? 'h-72 md:h-full md:min-h-[500px]' : 'h-48'}`}><div className="h-full w-full bg-[radial-gradient(circle_at_30%_25%,white_0,transparent_2px)] [background-size:24px_24px] opacity-50" /></div><div className="absolute bottom-8 right-8 left-8 flex items-end justify-between text-[#fffdf8]"><div><span className="text-xs font-bold opacity-80">{text(item, ['category', 'type'], 'مشروع')}</span><h3 className="mt-1 font-serif text-xl font-bold">{text(item, ['name', 'title'], 'عمل')}</h3></div><span className="grid size-9 place-items-center rounded-full bg-white/20"><ExternalLink size={15} /></span></div></article>; })}</div>}</section>
  </SiteShell>;
}

function EmptyCollection({ label }: { label: string }) {
  return <div className="rounded-2xl border border-dashed border-[#ded4c6] bg-[var(--site-soft)] px-6 py-12 text-center text-sm text-[#657174]">{label}</div>;
}

export default function PublicWebsite() {
  const { publicId = '' } = useParams<{ publicId: string }>();
  const query = useGetPublicWebsite(publicId, { query: { queryKey: getGetPublicWebsiteQueryKey(publicId), enabled: Boolean(publicId) } });
  const website = query.data;
  const data = useMemo(() => asObject(website?.jsonStructure), [website?.jsonStructure]);
  if (query.isLoading) return <div className="grid min-h-[100dvh] place-items-center bg-[#fffdf8] p-6"><div className="w-full max-w-xl space-y-4"><div className="h-4 w-28 animate-pulse rounded bg-[#eee5d9]" /><div className="h-16 w-4/5 animate-pulse rounded bg-[#eee5d9]" /><div className="h-5 w-full animate-pulse rounded bg-[#eee5d9]" /><div className="h-64 animate-pulse rounded-[28px] bg-[#f2eee6]" /></div></div>;
  if (query.isError || !website) return <div dir="rtl" className="grid min-h-[100dvh] place-items-center bg-[#fff8ee] p-6 text-center"><div><div className="mx-auto grid size-16 place-items-center rounded-2xl bg-[#f4d8c9] text-[#b3523e]"><MapPin size={25} /></div><h1 className="mt-6 font-serif text-2xl font-bold">هذا الموقع غير متاح حالياً</h1><p className="mt-3 text-sm text-[#657174]">تحقق من الرابط أو حاول مرة أخرى بعد قليل.</p><button onClick={() => query.refetch()} className="mt-7 rounded-xl bg-[#1b2735] px-5 py-3 text-sm font-bold text-white" data-testid="button-retry-website">حاول مرة أخرى</button></div></div>;
  const template = website.templateId.toLowerCase();
  if (template.includes('restaurant') || template.includes('مطعم')) return <RestaurantTemplate data={data} siteName={website.siteName} />;
  if (template.includes('service') || template.includes('خدمات')) return <ServicesTemplate data={data} siteName={website.siteName} />;
  if (template.includes('portfolio') || template.includes('أعمال')) return <PortfolioTemplate data={data} siteName={website.siteName} />;
  return <StoreTemplate data={data} siteName={website.siteName} />;
}