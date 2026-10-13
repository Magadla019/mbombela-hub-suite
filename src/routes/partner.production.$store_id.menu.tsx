import { createFileRoute } from '@tanstack/react-router';
import { StudioShell } from '@/components/partner-studio/StudioShell';
import { MenuManager } from '@/components/partner-studio/MenuManager';
export const Route=createFileRoute('/partner/production/$store_id/menu')({head:()=>({meta:[{title:'Store Menu Manager | Mbombela Transfer'},{name:'description',content:'Manage store products, categories, prices and availability.'},{property:'og:title',content:'Store Menu Manager | Mbombela Transfer'},{property:'og:description',content:'Manage your Mbombela Transfer store menu.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),component:MenuPage});
function MenuPage(){const {store_id}=Route.useParams();return <StudioShell><MenuManager storeId={store_id}/></StudioShell>}
