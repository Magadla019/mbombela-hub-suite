import { createFileRoute } from '@tanstack/react-router';
import { StudioShell } from '@/components/partner-studio/StudioShell';
import { WebDesigner } from '@/components/partner-studio/WebDesigner';
export const Route=createFileRoute('/partner/web-designer')({head:()=>({meta:[{title:'Web Designer | Mbombela Transfer'},{name:'description',content:'Web Designer for Mbombela Transfer partners.'},{property:'og:title',content:'Web Designer | Mbombela Transfer'},{property:'og:description',content:'Manage your Mbombela Transfer business with Web Designer.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),component:()=> <StudioShell><WebDesigner/></StudioShell>});
