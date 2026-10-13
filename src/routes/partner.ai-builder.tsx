import { createFileRoute } from '@tanstack/react-router';
import { StudioShell } from '@/components/partner-studio/StudioShell';
import { AiBuilderSuper } from '@/components/partner-studio/AiBuilderSuper';
export const Route=createFileRoute('/partner/ai-builder')({head:()=>({meta:[{title:'AI Builder | Mbombela Transfer'},{name:'description',content:'AI Builder for Mbombela Transfer partners.'},{property:'og:title',content:'AI Builder | Mbombela Transfer'},{property:'og:description',content:'Manage your Mbombela Transfer business with AI Builder.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),component:()=> <StudioShell><AiBuilderSuper/></StudioShell>});
