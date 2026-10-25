-- Non-destructive integration suite. All fixtures and stock changes roll back.
BEGIN;
SELECT set_config('scentia.test_user',gen_random_uuid()::text,true);
SELECT set_config('scentia.other_user',gen_random_uuid()::text,true);
SELECT set_config('scentia.request',gen_random_uuid()::text,true);
INSERT INTO auth.users(id,email,raw_user_meta_data) VALUES
(current_setting('scentia.test_user')::uuid,'scentia-test-'||current_setting('scentia.test_user')||'@example.com','{"full_name":"Test client","role":"admin"}'),
(current_setting('scentia.other_user')::uuid,'scentia-test-'||current_setting('scentia.other_user')||'@example.com','{}');
DO $$BEGIN
 IF (SELECT role FROM public.profiles WHERE id=current_setting('scentia.test_user')::uuid)<>'customer' THEN RAISE EXCEPTION 'FAIL: metadata role escalation'; END IF;
END$$;
SELECT set_config('scentia.initial_stock',(SELECT stock::text FROM public.product_variants WHERE product_id='scent-01' AND size='50ml'),true);
INSERT INTO public.cart_items(user_id,product_id,size,quantity) VALUES(current_setting('scentia.other_user')::uuid,'scent-01','50ml',1);
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub',current_setting('scentia.test_user'),true);
DO $$DECLARE a jsonb; b jsonb; denied boolean:=false; before_stock integer;
BEGIN
 IF (SELECT count(*) FROM public.profiles)<>1 THEN RAISE EXCEPTION 'FAIL: profile isolation'; END IF;
 IF (SELECT count(*) FROM public.cart_items)<>0 THEN RAISE EXCEPTION 'FAIL: cart isolation'; END IF;
 BEGIN UPDATE public.profiles SET role='admin' WHERE id=auth.uid(); EXCEPTION WHEN insufficient_privilege THEN denied:=true; END;
 IF NOT denied THEN RAISE EXCEPTION 'FAIL: role update allowed'; END IF;
 denied:=false;
 BEGIN PERFORM public.admin_metrics(); EXCEPTION WHEN insufficient_privilege THEN denied:=true; END;
 IF NOT denied THEN RAISE EXCEPTION 'FAIL: customer metrics allowed'; END IF;
 denied:=false;
 BEGIN INSERT INTO public.order_items(order_id,name,size,price,quantity) VALUES(gen_random_uuid(),'Forged','50ml',1,1); EXCEPTION WHEN insufficient_privilege THEN denied:=true; END;
 IF NOT denied THEN RAISE EXCEPTION 'FAIL: order insertion allowed'; END IF;
 INSERT INTO public.cart_items(user_id,product_id,size,quantity,engraving) VALUES(auth.uid(),'scent-01','50ml',2,'ABC');
 a:=public.place_order('[{"product_id":"scent-01","size":"50ml","quantity":2,"engraving":"ABC","price":0.01}]','Test Client','{"street":"Adresse de test","city":"Paris","postalCode":"75016","country":"France"}',current_setting('scentia.request')::uuid);
 IF (a->>'total')::numeric<>250 THEN RAISE EXCEPTION 'FAIL: authoritative price'; END IF;
 b:=public.place_order('[{"product_id":"scent-01","size":"50ml","quantity":2,"engraving":"ABC"}]','Test Client','{"street":"Adresse de test","city":"Paris","postalCode":"75016","country":"France"}',current_setting('scentia.request')::uuid);
 IF a<>b THEN RAISE EXCEPTION 'FAIL: idempotency'; END IF;
 IF (SELECT stock FROM public.product_variants WHERE product_id='scent-01' AND size='50ml')<>current_setting('scentia.initial_stock')::integer-2 THEN RAISE EXCEPTION 'FAIL: stock decrement'; END IF;
 IF (SELECT count(*) FROM public.cart_items)<>0 THEN RAISE EXCEPTION 'FAIL: checkout cart clear'; END IF;
 IF (SELECT count(*) FROM public.order_items)<>1 THEN RAISE EXCEPTION 'FAIL: order lines'; END IF;
 before_stock:=(SELECT stock FROM public.product_variants WHERE product_id='scent-02' AND size='50ml');
 denied:=false;
 BEGIN PERFORM public.place_order('[{"product_id":"scent-02","size":"50ml","quantity":1},{"product_id":"scent-03","size":"50ml","quantity":99}]','Test Client','{"street":"Adresse de test","city":"Paris","postalCode":"75016","country":"France"}',gen_random_uuid()); EXCEPTION WHEN raise_exception THEN denied:=true; END;
 IF NOT denied OR (SELECT stock FROM public.product_variants WHERE product_id='scent-02' AND size='50ml')<>before_stock OR (SELECT count(*) FROM public.orders)<>1 THEN RAISE EXCEPTION 'FAIL: transaction rollback'; END IF;
END$$;
SELECT set_config('request.jwt.claim.sub',current_setting('scentia.other_user'),true);
DO $$BEGIN
 IF (SELECT count(*) FROM public.orders)<>0 OR (SELECT count(*) FROM public.order_items)<>0 THEN RAISE EXCEPTION 'FAIL: order ownership'; END IF;
END$$;
RESET ROLE;
UPDATE public.profiles SET role='admin' WHERE id=current_setting('scentia.test_user')::uuid;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub',current_setting('scentia.test_user'),true);
DO $$DECLARE m jsonb; BEGIN
 m:=public.admin_metrics();
 IF (m->>'orders')::integer<>1 OR (m->>'demo_total')::numeric<>250 OR (m->>'revenue')::numeric<>0 THEN RAISE EXCEPTION 'FAIL: admin metrics'; END IF;
 UPDATE public.product_variants SET stock=20 WHERE product_id='scent-01' AND size='50ml';
 IF NOT FOUND THEN RAISE EXCEPTION 'FAIL: admin stock'; END IF;
END$$;
RESET ROLE;
SET LOCAL ROLE anon;
DO $$DECLARE denied boolean:=false; BEGIN
 IF (SELECT count(*) FROM public.products WHERE is_active)<>20 THEN RAISE EXCEPTION 'FAIL: public catalogue'; END IF;
 BEGIN PERFORM public.admin_metrics(); EXCEPTION WHEN insufficient_privilege THEN denied:=true; END;
 IF NOT denied THEN RAISE EXCEPTION 'FAIL: anonymous metrics'; END IF;
END$$;
RESET ROLE;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub',current_setting('scentia.test_user'),true);
DO $$DECLARE receipt jsonb; rejected boolean:=false; BEGIN
 receipt:=public.place_order('[{"product_id":"scent-01","size":"50ml","quantity":1}]','Test Client','{"street":"Adresse de test","city":"Paris","postalCode":"75016","country":"France"}',gen_random_uuid());
 IF (receipt->>'total')::numeric<>134.90 THEN RAISE EXCEPTION 'FAIL: original shipping fee'; END IF;
 BEGIN PERFORM public.place_order('[{"product_id":"scent-01","size":"50ml","quantity":0}]','Test Client','{"street":"Adresse de test","city":"Paris","postalCode":"75016","country":"France"}',gen_random_uuid()); EXCEPTION WHEN raise_exception THEN rejected:=true; END;
 IF NOT rejected THEN RAISE EXCEPTION 'FAIL: invalid quantity'; END IF;
END$$;
RESET ROLE;
SELECT 'PASS: role escalation, RLS isolation, authoritative price, stock, idempotency, atomic rollback, admin metrics, anonymous access' AS test_result;
ROLLBACK;
