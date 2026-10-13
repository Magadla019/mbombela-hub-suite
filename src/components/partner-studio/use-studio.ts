import { useCallback, useEffect, useState } from 'react';
import { getStaffToken } from '@/lib/transfer';
import { loadPublishedSections, loadStudio, type StudioData } from '@/lib/partner-studio.functions';
export function useStudio(){
  const [data,setData]=useState<StudioData>({sections:[],stores:[],items:[],categories:[],ads:[]});const [error,setError]=useState('');const [loading,setLoading]=useState(true);
  const reload=useCallback(async()=>{setLoading(true);try{const token=getStaffToken();if(!token){const sections=await loadPublishedSections();setData(d=>({...d,sections}));setError('Partner sign-in must be restored before changes can be saved. Existing store and menu records still need importing.');return;}setData(await loadStudio({data:{token}}));setError('');}catch(e){setError(e instanceof Error?e.message:'Could not load workspace.');}finally{setLoading(false);}},[]);
  useEffect(()=>{void reload();},[reload]);return {data,error,loading,reload,setData};
}