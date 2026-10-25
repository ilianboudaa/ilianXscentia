import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createClient} from '@supabase/supabase-js';
process.loadEnvFile('.env.local');
test('Supabase matches the 20 original names, 50ml prices and local flacons',async()=>{
 const expected=JSON.parse(readFileSync('data/catalog.json','utf8'));
 const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data,error}=await db.from('products').select('id,name,price,image,product_variants(size,price)').eq('is_active',true);
 assert.equal(error,null);assert.equal(data.length,20);
 for(const p of expected){const row=data.find(r=>r.id===p.id);assert.ok(row,p.name);assert.equal(row.name,p.name);assert.equal(Number(row.price),p.price,p.name);assert.equal(Number(row.product_variants.find(v=>v.size==='50ml')?.price),p.price,p.name);assert.equal(row.image,p.image);assert.ok(existsSync('public'+row.image),p.name);}
});
