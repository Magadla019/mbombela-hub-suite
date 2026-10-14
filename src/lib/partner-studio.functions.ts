import { createServerFn } from '@tanstack/react-start';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import type { Database } from '@/integrations/supabase/types';
import { partnerDb } from './partner-studio.server';

const auth = z.object({ token: z.string().min(1) });
const sectionSchema = z.object({ id:z.string().uuid().optional(), section_type:z.string().min(1).max(50), title:z.string().trim().min(1).max(100), layout_type:z.enum(['grid','carousel','list']).default('grid'), card_design:z.string().max(50).default('restaurant_card'), position:z.number().int().min(0), is_active:z.boolean(), config:z.record(z.string(),z.unknown()).default({}) });

export const loadPublishedSections = createServerFn({method:'GET'}).handler(async()=>{
  const url=process.env['SUPABASE_URL']; const key=process.env['SUPABASE_PUBLISHABLE_KEY'];
  if(!url || !key) throw new Error('The catalogue is unavailable.');
  const db=createClient<Database>(url,key,{auth:{persistSession:false,autoRefreshToken:false},global:{fetch:(input,init)=>{const headers=new Headers(init?.headers);if(headers.get('Authorization')===`Bearer ${key}`)headers.delete('Authorization');headers.set('apikey',key);return fetch(input,{...init,headers});}}});
  const {data,error}=await db.from('website_sections').select('*').eq('is_active',true).order('position');
  if(error)throw new Error(error.message);return data??[];
});
export const loadStudio = createServerFn({method:'POST'}).inputValidator(d=>auth.parse(d)).handler(async({data})=>{
  const db=await partnerDb(data.token);
  const [sections,stores,items,categories,ads]=await Promise.all([db.from('website_sections').select('*').order('position'),db.from('restaurants').select('*').order('name'),db.from('menu_items').select('*').order('created_at',{ascending:false}),db.from('menu_categories').select('*').order('sort_order'),db.from('marketing_ads').select('*').order('created_at',{ascending:false})]);
  for(const result of [sections,stores,items,categories,ads])if(result.error)throw new Error(result.error.message);
  return {sections:sections.data??[],stores:stores.data??[],items:items.data??[],categories:categories.data??[],ads:ads.data??[]};
});
export const saveStudioSections = createServerFn({method:'POST'}).inputValidator(d=>auth.extend({sections:z.array(sectionSchema).max(5000)}).parse(d)).handler(async({data})=>{
  const db=await partnerDb(data.token);
  const rows:Database['public']['Tables']['website_sections']['Insert'][]=data.sections.map(({id,...s})=>({...s,...(id?{id}:{}),config:JSON.parse(JSON.stringify(s.config)) as Database['public']['Tables']['website_sections']['Row']['config']}));
  if(!rows.length)return {saved:0};
  const {error}=await db.from('website_sections').upsert(rows);if(error)throw new Error(error.message);return {saved:rows.length};
});
export const saveStudioStore = createServerFn({method:'POST'}).inputValidator(d=>auth.extend({id:z.string().uuid().optional(),section_id:z.string().uuid(),name:z.string().trim().min(1).max(100),location:z.string().max(300),delivery_time:z.string().max(50),description:z.string().max(1000).default(''),logo_url:z.string().max(3000).nullable().default(null),is_active:z.boolean().default(true)}).parse(d)).handler(async({data})=>{
  const db=await partnerDb(data.token);const {data:section,error:sectionError}=await db.from('website_sections').select('id,section_type').eq('id',data.section_id).eq('is_active',true).single();
  if(sectionError||!section)throw new Error('Choose an active section first.');
  const {token,id,...fields}=data;const row={...fields,section_type:section.section_type,type:section.section_type};
  const slug=fields.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');if(!slug)throw new Error('Enter a store name.');
  const result=id?await db.from('restaurants').update(row).eq('id',id).select().single():await db.from('restaurants').insert({...row,slug:`${slug}-${crypto.randomUUID().slice(0,6)}`}).select().single();
  if(result.error)throw new Error(result.error.message);return result.data;
});
export const toggleStudioStore = createServerFn({method:'POST'}).inputValidator(d=>auth.extend({id:z.string().uuid(),active:z.boolean()}).parse(d)).handler(async({data})=>{
  const db=await partnerDb(data.token);const {error}=await db.from('restaurants').update({is_active:data.active}).eq('id',data.id);if(error)throw new Error(error.message);return {ok:true};
});
export const saveStudioItem = createServerFn({method:'POST'}).inputValidator(d=>auth.extend({store_id:z.string().uuid(),name:z.string().trim().min(1).max(120),price:z.number().min(0).max(100000),category:z.string().trim().min(1).max(100),description:z.string().max(1000),image_url:z.string().max(3000).nullable(),in_stock:z.boolean()}).parse(d)).handler(async({data})=>{
  const db=await partnerDb(data.token);const {data:store,error:storeError}=await db.from('restaurants').select('id').eq('id',data.store_id).single();if(storeError||!store)throw new Error('Store not found.');
  const {data:existing,error:categoryError}=await db.from('menu_categories').select('id').eq('restaurant_id',data.store_id).eq('name',data.category).maybeSingle();if(categoryError)throw new Error(categoryError.message);
  let categoryId=existing?.id;
  if(!categoryId){const {data:created,error}=await db.from('menu_categories').insert({restaurant_id:data.store_id,name:data.category}).select('id').single();if(error||!created)throw new Error(error?.message??'Could not add category.');categoryId=created.id;}
  const {token,...item}=data;const {error}=await db.from('menu_items').insert({...item,restaurant_id:data.store_id,category_id:categoryId,is_available:data.in_stock});if(error)throw new Error(error.message);return {ok:true};
});
export const saveMarketingDraft = createServerFn({method:'POST'}).inputValidator(d=>auth.extend({title:z.string().trim().min(1).max(150),platforms:z.array(z.enum(['tiktok','instagram','facebook','whatsapp'])),budget:z.number().min(0),image_url:z.string().nullable(),caption:z.string().max(2000).optional(),scheduled_for:z.string().datetime().nullable().optional(),recurring_days:z.array(z.number().int().min(0).max(6)).max(7).optional(),time:z.string().regex(/^\d{2}:\d{2}$/).optional()}).parse(d)).handler(async({data})=>{
  const db=await partnerDb(data.token);const {token,recurring_days,time,scheduled_for,...row}=data;const recurring=!!recurring_days?.length;const rule=recurring?{days:recurring_days,time:time??'09:00'}:null;const {data:ad,error}=await db.from('marketing_ads').insert({...row,status:scheduled_for?'scheduled':'draft',scheduled_for:scheduled_for??null,publish_at:scheduled_for??null,is_recurring:recurring,recurrence_rule:rule,is_paid:row.budget>0}).select('id').single();if(!error&&ad&&scheduled_for){await db.from('scheduled_ads').insert({marketing_ad_id:ad.id,scheduled_for,recurrence:recurring?'weekly':'once',is_recurring:recurring,recurrence_rule:rule,status:'scheduled'});}if(error)throw new Error(error.message);return {ok:true};
});
const safeTables=['website_sections','restaurants','menu_items','ads','scheduled_ads','ai_chats','my_cloud_storage','social_connections','marketing_ads'] as const;
export const cloudInventory = createServerFn({method:'POST'}).inputValidator(d=>auth.parse(d)).handler(async({data})=>{
  const db=await partnerDb(data.token);const {data:buckets,error}=await db.storage.listBuckets();if(error)throw new Error(error.message);
  const tables=await Promise.all(safeTables.map(async name=>{const {count,error}=await db.from(name).select('id',{count:'exact',head:true});return {name,count:count??0,error:error?.message??null};}));
  const {count:vaultCount,error:vaultError}=await db.from('env_vault').select('id',{count:'exact',head:true});
  return {buckets:buckets.map(b=>({id:b.id,name:b.name,created_at:b.created_at,public:b.public,file_size_limit:b.file_size_limit??null})),tables:[...tables,{name:'env_vault',count:vaultCount??0,error:vaultError?.message??null}],secrets:vaultCount??0};
});
export const exportStudioData = createServerFn({method:'POST'}).inputValidator(d=>auth.parse(d)).handler(async({data})=>{
  const db=await partnerDb(data.token);const result:Record<string,Database['public']['Tables']['website_sections']['Row']['config'][] >={};
  for(const name of safeTables){let offset=0;const rows:Database['public']['Tables']['website_sections']['Row']['config'][]=[];for(;;){const {data:page,error}=await db.from(name).select('*').order('id').range(offset,offset+499);if(error)throw new Error(error.message);rows.push(...(page??[]));if(!page||page.length<500)break;offset+=500;}result[name]=rows;}
  return result;
});
export type StudioData=Awaited<ReturnType<typeof loadStudio>>;
export type StudioSection=StudioData['sections'][number];
const platformKeys:Record<string,string[]>={facebook:['FACEBOOK_APP_ID','FACEBOOK_APP_SECRET'],instagram:['INSTAGRAM_APP_ID','INSTAGRAM_APP_SECRET'],tiktok:['TIKTOK_CLIENT_KEY','TIKTOK_CLIENT_SECRET'],youtube:['YOUTUBE_CLIENT_ID','YOUTUBE_CLIENT_SECRET'],linkedin:['LINKEDIN_CLIENT_ID','LINKEDIN_CLIENT_SECRET'],x:['X_API_KEY','X_API_SECRET'],whatsapp:['WHATSAPP_TOKEN','WHATSAPP_PHONE_ID']};
export const addPlatform = createServerFn({method:'POST'}).inputValidator(d=>auth.extend({name:z.string().trim().min(1).max(60),description:z.string().max(300).default(''),icon_url:z.string().max(3000).nullable().default(null)}).parse(d)).handler(async({data})=>{
  const db=await partnerDb(data.token);const slug=data.name.toLowerCase().replace(/\/twitter/,'').replace(/[^a-z0-9]+/g,'');
  const {error}=await db.from('platforms').upsert({name:data.name,slug,description:data.description,icon_url:data.icon_url},{onConflict:'name'});if(error)throw new Error(error.message);
  const names=platformKeys[slug]??[`${slug.toUpperCase()}_API_KEY`,`${slug.toUpperCase()}_API_SECRET`];
  const {data:existing}=await db.from('env_vault').select('key_name').in('key_name',names);const have=new Set((existing??[]).map(r=>r.key_name));
  const rows=names.filter(n=>!have.has(n)).map(key_name=>({key_name,platform_group:slug,description:`${data.name} publishing key`,is_active:false}));
  if(rows.length){const {error:e}=await db.from('env_vault').insert(rows);if(e)throw new Error(e.message);}
  return {added:rows.length};
});
export const listMarketing = createServerFn({method:'POST'}).inputValidator(d=>auth.parse(d)).handler(async({data})=>{
  const db=await partnerDb(data.token);const [p,s]=await Promise.all([db.from('platforms').select('*').order('created_at'),db.from('scheduled_ads').select('*').order('scheduled_for')]);
  return {platforms:p.data??[],schedules:s.data??[]};
});
