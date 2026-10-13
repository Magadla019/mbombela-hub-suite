import { queryOptions,useSuspenseQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { Store,Star } from 'lucide-react';
import { loadPublishedSections } from '@/lib/partner-studio.functions';
import { publicCatalogue } from '@/lib/catalogue.functions';
const sectionsOptions=queryOptions({queryKey:['published-homepage-sections'],queryFn:()=>loadPublishedSections()});
const catalogueOptions=queryOptions({queryKey:['public-catalogue'],queryFn:()=>publicCatalogue()});
export function PublishedStoreSections(){
 const {data:sections}=useSuspenseQuery(sectionsOptions);const {data:catalogue}=useSuspenseQuery(catalogueOptions);
 return <>{sections.filter(s=>!['header','ads_carousel'].includes(s.section_type)).map(section=>{const stores=catalogue.restaurants.filter(s=>s.is_active&&(s.section_id===section.id||(!s.section_id&&s.section_type===section.section_type)));return <section key={section.id} className="mx-auto max-w-7xl px-6 py-12 md:px-12"><h2 className="mb-7 text-2xl font-bold">{section.title}</h2><div className={`grid gap-4 ${section.layout_type==='list'?'grid-cols-1':'sm:grid-cols-2 lg:grid-cols-3'}`}>{stores.map(store=><Link key={store.id} to="/restaurant/$slug" params={{slug:store.slug}} className="flex items-center gap-4 rounded-lg border border-border bg-card p-5">{store.logo_url?<img src={store.logo_url} alt={store.name} className="h-16 w-16 rounded-full object-contain" width={64} height={64}/>:<Store size={36} className="text-primary"/>}<div><h3 className="font-bold">{store.name}</h3><p className="my-2 text-xs text-muted-foreground">{store.location} · {store.delivery_time}</p><span className="flex items-center gap-1 text-xs text-gold"><Star size={12}/>{store.rating}</span></div></Link>)}</div>{!stores.length&&<p className="text-sm text-muted-foreground">Stores coming soon.</p>}</section>})}</>;
}