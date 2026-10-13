import { createFileRoute } from '@tanstack/react-router';
import { StudioShell } from '@/components/partner-studio/StudioShell';
import { CloudWorkspace } from '@/components/partner-studio/CloudWorkspace';
export const Route=createFileRoute('/partner/cloud')({validateSearch:(s:Record<string,unknown>)=>({tab:typeof s['tab']==='string'?s['tab']:'secrets'}),head:()=>({meta:[{title:'My Cloud | Mbombela Transfer'},{name:'description',content:'Private storage, database and encrypted vault for Mbombela Transfer partners.'},{property:'og:title',content:'My Cloud | Mbombela Transfer'},{property:'og:description',content:'Manage private business storage and vault settings.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),component:CloudPage});
function CloudPage(){const {tab}=Route.useSearch();return <StudioShell><CloudWorkspace initialTab={tab}/></StudioShell>}
