import { createFileRoute, redirect } from '@tanstack/react-router';
export const Route=createFileRoute('/partner/ads-manager')({beforeLoad:()=>{throw redirect({to:'/partner/marketing-studio',statusCode:301});}});
