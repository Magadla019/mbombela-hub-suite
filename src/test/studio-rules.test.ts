import {describe,it,expect} from 'vitest';
import {itemIsOrderable} from '@/lib/studio-rules';
describe('Customer store stock rules',()=>{
 it('excludes an out-of-stock item',()=>{expect(itemIsOrderable({store_id:'clicks',restaurant_id:'clicks',in_stock:false,is_available:true},'clicks')).toBe(false);});
 it('does not show another store’s Panado',()=>{expect(itemIsOrderable({store_id:'dis-chem',restaurant_id:'dis-chem',in_stock:true,is_available:true},'clicks')).toBe(false);});
 it('keeps available legacy menu items associated with their original restaurant',()=>{expect(itemIsOrderable({store_id:null,restaurant_id:'original-store',in_stock:true,is_available:true},'original-store')).toBe(true);});
});