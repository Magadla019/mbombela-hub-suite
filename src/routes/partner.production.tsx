import { createFileRoute } from '@tanstack/react-router';
import { StudioShell } from '@/components/partner-studio/StudioShell';
import { Production } from '@/components/partner-studio/Production';
export const Route=createFileRoute('/partner/production')({head:()=>({meta:[{title:'Production | Mbombela Transfer'},{name:'description',content:'Production for Mbombela Transfer partners.'},{property:'og:title',content:'Production | Mbombela Transfer'},{property:'og:description',content:'Manage your Mbombela Transfer business with Production.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),component:()=> <StudioShell><Production/></StudioShell>});
