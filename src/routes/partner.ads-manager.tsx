import { createFileRoute } from '@tanstack/react-router';
import { StudioShell } from '@/components/partner-studio/StudioShell';
import { MarketingStudio } from '@/components/partner-studio/MarketingStudio';
export const Route=createFileRoute('/partner/ads-manager')({head:()=>({meta:[{title:'Marketing Studio | Mbombela Transfer'},{name:'description',content:'Marketing Studio for Mbombela Transfer partners.'},{property:'og:title',content:'Marketing Studio | Mbombela Transfer'},{property:'og:description',content:'Manage your Mbombela Transfer business with Marketing Studio.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),component:()=> <StudioShell><MarketingStudio/></StudioShell>});
