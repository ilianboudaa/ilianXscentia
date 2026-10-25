-- ==============================================================================
-- SCENTIA - MAISON DE HAUTE PARFUMERIE
-- Migration initiale : Tables, Relations, RLS, Index et Catalogue initial et restauration de 20 parfums botaniques
-- ==============================================================================

-- 1. Table des profils utilisateurs (Liée à auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  phone TEXT,
  shipping_address JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Table des produits (Parfums)
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  tagline TEXT,
  family TEXT NOT NULL CHECK (family IN ('vanille', 'florale', 'boisee', 'ambree', 'fraiche', 'gourmande')),
  family_label TEXT NOT NULL,
  description TEXT NOT NULL,
  story TEXT NOT NULL,
  destination TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  volume TEXT NOT NULL DEFAULT '50 ml',
  rating NUMERIC(3, 2) NOT NULL DEFAULT 5.0,
  review_count INTEGER NOT NULL DEFAULT 0,
  is_bestseller BOOLEAN NOT NULL DEFAULT false,
  is_new BOOLEAN NOT NULL DEFAULT false,
  is_vanilla_collection BOOLEAN NOT NULL DEFAULT false,
  image TEXT NOT NULL,
  mood_color TEXT NOT NULL DEFAULT '#D4AF37',
  pyramid JSONB NOT NULL,
  profile JSONB NOT NULL,
  ingredients TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Table des déclinaisons de formats (30ml, 50ml, 100ml)
CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  size TEXT NOT NULL CHECK (size IN ('30ml', '50ml', '100ml')),
  price NUMERIC(10, 2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  sku TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(product_id, size)
);

-- 4. Table des paniers d'achat persistants
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  size TEXT NOT NULL CHECK (size IN ('30ml', '50ml', '100ml')),
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity BETWEEN 1 AND 99),
  engraving TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, product_id, size, engraving)
);

-- 5. Table des favoris (Wishlist)
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, product_id)
);

-- 6. Table des commandes
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  request_id UUID NOT NULL,
  is_demo BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(user_id, request_id),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  shipping_address JSONB NOT NULL,
  subtotal NUMERIC(10, 2) NOT NULL,
  shipping_cost NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  total NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'preparing', 'shipped', 'delivered', 'cancelled')),
  payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
  stripe_session_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. Table des articles de commande
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  size TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity BETWEEN 1 AND 99),
  engraving TEXT,
  image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. Table des résultats du quiz olfactif
CREATE TABLE IF NOT EXISTS public.quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  primary_family TEXT NOT NULL,
  vanilla_affinity INTEGER NOT NULL,
  recommended_product_ids TEXT[] NOT NULL DEFAULT '{}',
  answers JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. Table des avis clients
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT NOT NULL,
  comment TEXT NOT NULL,
  verified_purchase BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);


-- Public clients can never change roles or write prices/order totals.
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA private TO authenticated;

CREATE OR REPLACE FUNCTION private.is_admin() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role = 'admin'
  );
$$;
REVOKE ALL ON FUNCTION private.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.is_admin() TO authenticated;

CREATE OR REPLACE FUNCTION private.handle_new_user() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  INSERT INTO public.profiles(id,email,full_name,role)
  VALUES(NEW.id,COALESCE(NEW.email,''),left(COALESCE(NEW.raw_user_meta_data->>'full_name','Client'),120),'customer');
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION private.handle_new_user() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION private.handle_new_user();

-- Backfill accounts created before this installation, always as customers.
INSERT INTO public.profiles(id,email,full_name)
SELECT id,COALESCE(email,''),left(COALESCE(raw_user_meta_data->>'full_name','Client'),120)
FROM auth.users ON CONFLICT(id) DO NOTHING;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.profiles FROM anon, authenticated;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.products FROM anon, authenticated;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.product_variants FROM anon, authenticated;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.cart_items FROM anon, authenticated;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.favorites FROM anon, authenticated;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.orders FROM anon, authenticated;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.order_items FROM anon, authenticated;
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.quiz_results FROM anon, authenticated;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.reviews FROM anon, authenticated;

GRANT SELECT ON public.products, public.product_variants, public.reviews TO anon, authenticated;
GRANT SELECT ON public.profiles,public.orders,public.order_items TO authenticated;
GRANT UPDATE(full_name,phone,shipping_address) ON public.profiles TO authenticated;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.cart_items,public.favorites,public.quiz_results TO authenticated;
GRANT UPDATE(stock) ON public.product_variants TO authenticated;

CREATE POLICY profiles_read ON public.profiles FOR SELECT TO authenticated
USING ((SELECT auth.uid())=id OR (SELECT private.is_admin()));
CREATE POLICY profiles_update ON public.profiles FOR UPDATE TO authenticated
USING ((SELECT auth.uid())=id) WITH CHECK ((SELECT auth.uid())=id);
CREATE POLICY products_read ON public.products FOR SELECT TO anon,authenticated USING(true);
CREATE POLICY variants_read ON public.product_variants FOR SELECT TO anon,authenticated USING(true);
CREATE POLICY variants_admin_stock ON public.product_variants FOR UPDATE TO authenticated
USING ((SELECT private.is_admin())) WITH CHECK ((SELECT private.is_admin()));
CREATE POLICY reviews_read ON public.reviews FOR SELECT TO anon,authenticated USING(true);
CREATE POLICY orders_read ON public.orders FOR SELECT TO authenticated
USING ((SELECT auth.uid())=user_id OR (SELECT private.is_admin()));
CREATE POLICY items_read ON public.order_items FOR SELECT TO authenticated USING(
EXISTS(SELECT 1 FROM public.orders o WHERE o.id=order_id AND (o.user_id=(SELECT auth.uid()) OR (SELECT private.is_admin()))));
CREATE POLICY cart_items_own ON public.cart_items FOR ALL TO authenticated
USING ((SELECT auth.uid())=user_id) WITH CHECK ((SELECT auth.uid())=user_id);
CREATE POLICY favorites_own ON public.favorites FOR ALL TO authenticated
USING ((SELECT auth.uid())=user_id) WITH CHECK ((SELECT auth.uid())=user_id);
CREATE POLICY quiz_results_own ON public.quiz_results FOR ALL TO authenticated
USING ((SELECT auth.uid())=user_id) WITH CHECK ((SELECT auth.uid())=user_id);

CREATE INDEX IF NOT EXISTS idx_orders_user_date ON public.orders(user_id,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_date ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_items_product ON public.order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_quiz_user ON public.quiz_results(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_products_family ON public.products(family);
CREATE INDEX IF NOT EXISTS idx_cart_variant ON public.cart_items(product_id,size);
CREATE INDEX IF NOT EXISTS idx_favorites_product ON public.favorites(product_id);

-- Atomic, idempotent checkout. Only product IDs/quantities come from the browser.
-- Private privileged implementation: ownership checked before any data access.
CREATE OR REPLACE FUNCTION private.checkout(p_items jsonb,p_name text,p_address jsonb,p_request uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
 uid uuid := auth.uid(); oid uuid; number text; existing jsonb;
 line record; v record; amount numeric(10,2):=0; shipping numeric(10,2); email text;
BEGIN
 IF uid IS NULL THEN RAISE EXCEPTION 'Connexion requise'; END IF;
 -- Serialize requests per customer, including retries using the same request UUID.
 PERFORM pg_advisory_xact_lock(hashtextextended(uid::text,0));
 SELECT jsonb_build_object('id',id,'order_number',order_number,'total',total) INTO existing
 FROM public.orders WHERE user_id=uid AND request_id=p_request;
 IF existing IS NOT NULL THEN RETURN existing; END IF;
 IF p_request IS NULL OR COALESCE(length(trim(p_name)),0) NOT BETWEEN 2 AND 120
 OR jsonb_typeof(p_address) IS DISTINCT FROM 'object'
 OR COALESCE(length(trim(p_address->>'street')),0) NOT BETWEEN 3 AND 200
 OR COALESCE(length(trim(p_address->>'city')),0) NOT BETWEEN 2 AND 100
 OR COALESCE(length(trim(p_address->>'postalCode')),0) NOT BETWEEN 2 AND 20
 OR COALESCE(p_address->>'country','') <> 'France'
 THEN RAISE EXCEPTION 'Coordonnées de livraison invalides'; END IF;
 IF jsonb_typeof(p_items) IS DISTINCT FROM 'array' OR jsonb_array_length(p_items) NOT BETWEEN 1 AND 50
 THEN RAISE EXCEPTION 'Panier invalide'; END IF;
 IF EXISTS(SELECT 1 FROM jsonb_to_recordset(p_items) AS x(product_id text,size text,quantity numeric,engraving text)
 WHERE quantity IS NULL OR quantity<>trunc(quantity) OR quantity NOT BETWEEN 1 AND 99 OR length(COALESCE(engraving,''))>24)
 THEN RAISE EXCEPTION 'Quantité ou gravure invalide'; END IF;
 SELECT u.email INTO email FROM auth.users u WHERE u.id=uid;
 oid:=gen_random_uuid(); number:='SC-'||to_char(now(),'YYYYMMDD')||'-'||upper(substr(replace(oid::text,'-',''),1,10));
 INSERT INTO public.orders(id,order_number,request_id,user_id,customer_email,customer_name,shipping_address,subtotal,shipping_cost,total,status,payment_status,is_demo)
 VALUES(oid,number,p_request,uid,email,trim(p_name),p_address,0,0,0,'pending','unpaid',true);
 -- Stable locking order prevents competing carts from deadlocking over variants.
 FOR line IN SELECT product_id,size,sum(quantity)::integer AS quantity,COALESCE(engraving,'') AS engraving
 FROM jsonb_to_recordset(p_items) AS x(product_id text,size text,quantity numeric,engraving text)
 GROUP BY product_id,size,COALESCE(engraving,'') ORDER BY product_id,size,COALESCE(engraving,'') LOOP
 IF line.quantity NOT BETWEEN 1 AND 99 THEN RAISE EXCEPTION 'Quantité invalide'; END IF;
 SELECT pv.price,pv.stock,p.name,p.image INTO v FROM public.product_variants pv
 JOIN public.products p ON p.id=pv.product_id WHERE pv.product_id=line.product_id AND pv.size=line.size AND p.is_active AND pv.size='50ml' FOR UPDATE OF pv;
 IF NOT FOUND THEN RAISE EXCEPTION 'Ce format est indisponible'; END IF;
 IF v.stock<line.quantity THEN RAISE EXCEPTION 'Stock insuffisant pour % (%)',v.name,line.size; END IF;
 UPDATE public.product_variants SET stock=stock-line.quantity WHERE product_id=line.product_id AND size=line.size;
 INSERT INTO public.order_items(order_id,product_id,name,size,price,quantity,engraving,image)
 VALUES(oid,line.product_id,v.name,line.size,v.price,line.quantity,line.engraving,v.image);
 amount:=amount+v.price*line.quantity;
 END LOOP;
 shipping:=CASE WHEN amount>=150 THEN 0 ELSE 9.90 END;
 UPDATE public.orders SET subtotal=amount,shipping_cost=shipping,total=amount+shipping WHERE id=oid;
 DELETE FROM public.cart_items WHERE user_id=uid;
 RETURN jsonb_build_object('id',oid,'order_number',number,'total',amount+shipping);
END;
$$;
REVOKE ALL ON FUNCTION private.checkout(jsonb,text,jsonb,uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION private.checkout(jsonb,text,jsonb,uuid) TO authenticated;
CREATE OR REPLACE FUNCTION public.place_order(p_items jsonb,p_name text,p_address jsonb,p_request uuid)
RETURNS jsonb LANGUAGE sql SECURITY INVOKER SET search_path = '' AS $$
 SELECT private.checkout(p_items,p_name,p_address,p_request);
$$;
REVOKE ALL ON FUNCTION public.place_order(jsonb,text,jsonb,uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.place_order(jsonb,text,jsonb,uuid) TO authenticated;

-- SQL aggregation, not made-up dashboard counters. Revenue stays separate from demo volume.
CREATE OR REPLACE FUNCTION public.admin_metrics() RETURNS jsonb
LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE result jsonb;
BEGIN
 IF NOT private.is_admin() THEN RAISE EXCEPTION 'Accès administrateur requis' USING ERRCODE='42501'; END IF;
 SELECT jsonb_build_object(
 'customers',(SELECT count(*) FROM public.profiles WHERE role='customer'),
 'orders',count(*),'demo_total',COALESCE(sum(total) FILTER(WHERE is_demo AND status<>'cancelled'),0),
 'revenue',COALESCE(sum(total) FILTER(WHERE NOT is_demo AND payment_status='paid' AND status<>'cancelled'),0),
 'average',COALESCE(avg(total) FILTER(WHERE status<>'cancelled'),0),
 'daily',COALESCE((SELECT jsonb_agg(d ORDER BY day) FROM (
 SELECT to_char(created_at,'YYYY-MM-DD') AS day,count(*) AS count,sum(total) AS total
 FROM public.orders WHERE created_at>=now()-interval '30 days' GROUP BY 1) d),'[]'::jsonb),
 'top_products',COALESCE((SELECT jsonb_agg(t) FROM (SELECT i.name,sum(i.quantity) AS units,sum(i.price*i.quantity) AS total
 FROM public.order_items i JOIN public.orders o ON o.id=i.order_id WHERE o.status<>'cancelled'
 GROUP BY i.name ORDER BY units DESC LIMIT 5)t),'[]'::jsonb)
 ) INTO result FROM public.orders;
 RETURN result;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_metrics() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.admin_metrics() TO authenticated;

-- Harden the pre-existing platform event trigger helper; event trigger still works.
DO $harden$ BEGIN IF to_regprocedure('public.rls_auto_enable()') IS NOT NULL THEN REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC,anon,authenticated; END IF; END $harden$;

-- Restore the supplied original catalogue without deleting historical products/orders.
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_family_check;
ALTER TABLE public.products ADD CONSTRAINT products_family_check CHECK(family IN ('vanille','florale','boisee','ambree','fraiche','gourmande','fruite'));
UPDATE public.products SET is_active=false;
INSERT INTO public.products(id,slug,name,subtitle,tagline,family,family_label,description,story,destination,price,volume,rating,review_count,is_bestseller,is_new,is_vanilla_collection,image,mood_color,pyramid,profile,ingredients,is_active) VALUES('scent-01','vanille-etoilee','Vanille Étoilée','Eau de parfum · Collection botanique','Sous les étoiles de Madagascar','gourmande','Gourmand','Vanille de Madagascar · Musc blanc','Au crépuscule, une brise chaude traverse les champs de vanille. Les gousses fraîchement ouvertes libèrent leur douceur, tandis qu’un musc aérien dépose sur la peau un souvenir lumineux. Une douceur qui semble ne jamais finir.','Sous les étoiles de Madagascar',125,'50 ml',0,0,true,false,true,'/flacons/vanille-etoilee.svg','#dcb184','{"top": ["Vanille de Madagascar"], "heart": ["Musc blanc"], "base": ["Musc blanc"]}'::jsonb,'{"intensity": 3, "sillage": 3, "longevity": "Composition de démonstration", "season": "Toutes saisons", "occasion": "Votre signature personnelle"}'::jsonb,ARRAY['Composition illustrative — projet pédagogique']::text[],true) ON CONFLICT(id) DO UPDATE SET slug=EXCLUDED.slug,name=EXCLUDED.name,subtitle=EXCLUDED.subtitle,tagline=EXCLUDED.tagline,family=EXCLUDED.family,family_label=EXCLUDED.family_label,description=EXCLUDED.description,story=EXCLUDED.story,destination=EXCLUDED.destination,price=EXCLUDED.price,volume=EXCLUDED.volume,rating=EXCLUDED.rating,review_count=EXCLUDED.review_count,is_bestseller=EXCLUDED.is_bestseller,is_new=EXCLUDED.is_new,is_vanilla_collection=EXCLUDED.is_vanilla_collection,image=EXCLUDED.image,mood_color=EXCLUDED.mood_color,pyramid=EXCLUDED.pyramid,profile=EXCLUDED.profile,ingredients=EXCLUDED.ingredients,is_active=true;
INSERT INTO public.product_variants(product_id,size,price,stock,sku) VALUES('scent-01','50ml',125,30,'SC-VANILLE-ETOILEE-50') ON CONFLICT(product_id,size) DO UPDATE SET price=EXCLUDED.price;
INSERT INTO public.products(id,slug,name,subtitle,tagline,family,family_label,description,story,destination,price,volume,rating,review_count,is_bestseller,is_new,is_vanilla_collection,image,mood_color,pyramid,profile,ingredients,is_active) VALUES('botanique-jardin-de-pivoine','jardin-de-pivoine','Jardin de Pivoine','Eau de parfum · Collection botanique','Un printemps éternel','florale','Floral','Pivoine · Rose tendre · Poire','Traversez un jardin où les pivoines viennent d’éclore. La rose tendre et la poire fraîche accompagnent vos pas dans une lumière douce. Un bouquet vivant sur la peau.','Un printemps éternel',115,'50 ml',0,0,false,true,false,'/flacons/jardin-de-pivoine.svg','#e8a5b1','{"top": ["Pivoine"], "heart": ["Rose tendre"], "base": ["Poire"]}'::jsonb,'{"intensity": 3, "sillage": 3, "longevity": "Composition de démonstration", "season": "Toutes saisons", "occasion": "Votre signature personnelle"}'::jsonb,ARRAY['Composition illustrative — projet pédagogique']::text[],true) ON CONFLICT(id) DO UPDATE SET slug=EXCLUDED.slug,name=EXCLUDED.name,subtitle=EXCLUDED.subtitle,tagline=EXCLUDED.tagline,family=EXCLUDED.family,family_label=EXCLUDED.family_label,description=EXCLUDED.description,story=EXCLUDED.story,destination=EXCLUDED.destination,price=EXCLUDED.price,volume=EXCLUDED.volume,rating=EXCLUDED.rating,review_count=EXCLUDED.review_count,is_bestseller=EXCLUDED.is_bestseller,is_new=EXCLUDED.is_new,is_vanilla_collection=EXCLUDED.is_vanilla_collection,image=EXCLUDED.image,mood_color=EXCLUDED.mood_color,pyramid=EXCLUDED.pyramid,profile=EXCLUDED.profile,ingredients=EXCLUDED.ingredients,is_active=true;
INSERT INTO public.product_variants(product_id,size,price,stock,sku) VALUES('botanique-jardin-de-pivoine','50ml',115,30,'SC-JARDIN-DE-PIVOINE-50') ON CONFLICT(product_id,size) DO UPDATE SET price=EXCLUDED.price;
INSERT INTO public.products(id,slug,name,subtitle,tagline,family,family_label,description,story,destination,price,volume,rating,review_count,is_bestseller,is_new,is_vanilla_collection,image,mood_color,pyramid,profile,ingredients,is_active) VALUES('scent-02','vanille-noire','Vanille Noire','Eau de parfum · Collection botanique','La nuit dans un palais d’ambre','gourmande','Gourmand','Vanille bourbon · Ambre · Tonka','Les portes d’un salon feutré s’ouvrent sur un sillage de vanille bourbon, d’ambre et de fève tonka. Tout ralentit. La nuit devient velours. Un secret chaud, enveloppant et magnétique.','La nuit dans un palais d’ambre',145,'50 ml',0,0,false,false,true,'/flacons/vanille-noire.svg','#ae7d62','{"top": ["Vanille bourbon"], "heart": ["Ambre"], "base": ["Tonka"]}'::jsonb,'{"intensity": 3, "sillage": 3, "longevity": "Composition de démonstration", "season": "Toutes saisons", "occasion": "Votre signature personnelle"}'::jsonb,ARRAY['Composition illustrative — projet pédagogique']::text[],true) ON CONFLICT(id) DO UPDATE SET slug=EXCLUDED.slug,name=EXCLUDED.name,subtitle=EXCLUDED.subtitle,tagline=EXCLUDED.tagline,family=EXCLUDED.family,family_label=EXCLUDED.family_label,description=EXCLUDED.description,story=EXCLUDED.story,destination=EXCLUDED.destination,price=EXCLUDED.price,volume=EXCLUDED.volume,rating=EXCLUDED.rating,review_count=EXCLUDED.review_count,is_bestseller=EXCLUDED.is_bestseller,is_new=EXCLUDED.is_new,is_vanilla_collection=EXCLUDED.is_vanilla_collection,image=EXCLUDED.image,mood_color=EXCLUDED.mood_color,pyramid=EXCLUDED.pyramid,profile=EXCLUDED.profile,ingredients=EXCLUDED.ingredients,is_active=true;
INSERT INTO public.product_variants(product_id,size,price,stock,sku) VALUES('scent-02','50ml',145,30,'SC-VANILLE-NOIRE-50') ON CONFLICT(product_id,size) DO UPDATE SET price=EXCLUDED.price;
INSERT INTO public.products(id,slug,name,subtitle,tagline,family,family_label,description,story,destination,price,volume,rating,review_count,is_bestseller,is_new,is_vanilla_collection,image,mood_color,pyramid,profile,ingredients,is_active) VALUES('botanique-fleur-de-coton','fleur-de-coton','Fleur de Coton','Eau de parfum · Collection botanique','Le jardin des émotions','florale','Floral','Coton · Iris · Musc poudré','Fermez les yeux. Coton, Iris, Musc poudré composent un paysage sensible, une rencontre entre lumière, matière et souvenirs. Chaque note se dévoile lentement, comme une nouvelle destination. Un voyage à porter sur la peau.','Le jardin des émotions',110,'50 ml',0,0,false,false,false,'/flacons/fleur-de-coton.svg','#e5d4c7','{"top": ["Coton"], "heart": ["Iris"], "base": ["Musc poudré"]}'::jsonb,'{"intensity": 3, "sillage": 3, "longevity": "Composition de démonstration", "season": "Toutes saisons", "occasion": "Votre signature personnelle"}'::jsonb,ARRAY['Composition illustrative — projet pédagogique']::text[],true) ON CONFLICT(id) DO UPDATE SET slug=EXCLUDED.slug,name=EXCLUDED.name,subtitle=EXCLUDED.subtitle,tagline=EXCLUDED.tagline,family=EXCLUDED.family,family_label=EXCLUDED.family_label,description=EXCLUDED.description,story=EXCLUDED.story,destination=EXCLUDED.destination,price=EXCLUDED.price,volume=EXCLUDED.volume,rating=EXCLUDED.rating,review_count=EXCLUDED.review_count,is_bestseller=EXCLUDED.is_bestseller,is_new=EXCLUDED.is_new,is_vanilla_collection=EXCLUDED.is_vanilla_collection,image=EXCLUDED.image,mood_color=EXCLUDED.mood_color,pyramid=EXCLUDED.pyramid,profile=EXCLUDED.profile,ingredients=EXCLUDED.ingredients,is_active=true;
INSERT INTO public.product_variants(product_id,size,price,stock,sku) VALUES('botanique-fleur-de-coton','50ml',110,30,'SC-FLEUR-DE-COTON-50') ON CONFLICT(product_id,size) DO UPDATE SET price=EXCLUDED.price;
INSERT INTO public.products(id,slug,name,subtitle,tagline,family,family_label,description,story,destination,price,volume,rating,review_count,is_bestseller,is_new,is_vanilla_collection,image,mood_color,pyramid,profile,ingredients,is_active) VALUES('botanique-rose-de-minuit','rose-de-minuit','Rose de Minuit','Eau de parfum · Collection botanique','Minuit dans un jardin secret','florale','Floral','Rose de Damas · Patchouli','Sous la lune, la rose de Damas dévoile sa profondeur. Le patchouli dessine un chemin mystérieux entre les ombres et les fleurs. L’élégance d’une rose après la tombée du jour.','Minuit dans un jardin secret',155,'50 ml',0,0,false,false,false,'/flacons/rose-de-minuit.svg','#c78696','{"top": ["Rose de Damas"], "heart": ["Patchouli"], "base": ["Patchouli"]}'::jsonb,'{"intensity": 3, "sillage": 3, "longevity": "Composition de démonstration", "season": "Toutes saisons", "occasion": "Votre signature personnelle"}'::jsonb,ARRAY['Composition illustrative — projet pédagogique']::text[],true) ON CONFLICT(id) DO UPDATE SET slug=EXCLUDED.slug,name=EXCLUDED.name,subtitle=EXCLUDED.subtitle,tagline=EXCLUDED.tagline,family=EXCLUDED.family,family_label=EXCLUDED.family_label,description=EXCLUDED.description,story=EXCLUDED.story,destination=EXCLUDED.destination,price=EXCLUDED.price,volume=EXCLUDED.volume,rating=EXCLUDED.rating,review_count=EXCLUDED.review_count,is_bestseller=EXCLUDED.is_bestseller,is_new=EXCLUDED.is_new,is_vanilla_collection=EXCLUDED.is_vanilla_collection,image=EXCLUDED.image,mood_color=EXCLUDED.mood_color,pyramid=EXCLUDED.pyramid,profile=EXCLUDED.profile,ingredients=EXCLUDED.ingredients,is_active=true;
INSERT INTO public.product_variants(product_id,size,price,stock,sku) VALUES('botanique-rose-de-minuit','50ml',155,30,'SC-ROSE-DE-MINUIT-50') ON CONFLICT(product_id,size) DO UPDATE SET price=EXCLUDED.price;
INSERT INTO public.products(id,slug,name,subtitle,tagline,family,family_label,description,story,destination,price,volume,rating,review_count,is_bestseller,is_new,is_vanilla_collection,image,mood_color,pyramid,profile,ingredients,is_active) VALUES('scent-04','creme-brulee','Crème Brûlée','Eau de parfum · Collection botanique','Un après-midi à Paris','gourmande','Gourmand','Caramel · Vanille · Praliné','Dans une pâtisserie cachée, la croûte de caramel craque doucement. La vanille et le praliné dansent dans l’air tiède, comme une promesse délicieuse. Le bonheur a parfois le parfum d’un dessert.','Un après-midi à Paris',129,'50 ml',0,0,false,false,true,'/flacons/creme-brulee.svg','#d7a65c','{"top": ["Caramel"], "heart": ["Vanille"], "base": ["Praliné"]}'::jsonb,'{"intensity": 3, "sillage": 3, "longevity": "Composition de démonstration", "season": "Toutes saisons", "occasion": "Votre signature personnelle"}'::jsonb,ARRAY['Composition illustrative — projet pédagogique']::text[],true) ON CONFLICT(id) DO UPDATE SET slug=EXCLUDED.slug,name=EXCLUDED.name,subtitle=EXCLUDED.subtitle,tagline=EXCLUDED.tagline,family=EXCLUDED.family,family_label=EXCLUDED.family_label,description=EXCLUDED.description,story=EXCLUDED.story,destination=EXCLUDED.destination,price=EXCLUDED.price,volume=EXCLUDED.volume,rating=EXCLUDED.rating,review_count=EXCLUDED.review_count,is_bestseller=EXCLUDED.is_bestseller,is_new=EXCLUDED.is_new,is_vanilla_collection=EXCLUDED.is_vanilla_collection,image=EXCLUDED.image,mood_color=EXCLUDED.mood_color,pyramid=EXCLUDED.pyramid,profile=EXCLUDED.profile,ingredients=EXCLUDED.ingredients,is_active=true;
INSERT INTO public.product_variants(product_id,size,price,stock,sku) VALUES('scent-04','50ml',129,30,'SC-CREME-BRULEE-50') ON CONFLICT(product_id,size) DO UPDATE SET price=EXCLUDED.price;
INSERT INTO public.products(id,slug,name,subtitle,tagline,family,family_label,description,story,destination,price,volume,rating,review_count,is_bestseller,is_new,is_vanilla_collection,image,mood_color,pyramid,profile,ingredients,is_active) VALUES('botanique-neroli-soleil','neroli-soleil','Néroli Soleil','Eau de parfum · Collection botanique','Le jardin des émotions','fraiche','Frais','Néroli · Bergamote · Fleur d’oranger','Fermez les yeux. Néroli, Bergamote, Fleur d’oranger composent un paysage sensible, une rencontre entre lumière, matière et souvenirs. Chaque note se dévoile lentement, comme une nouvelle destination. Un voyage à porter sur la peau.','Le jardin des émotions',119,'50 ml',0,0,false,false,false,'/flacons/neroli-soleil.svg','#e8c579','{"top": ["Néroli"], "heart": ["Bergamote"], "base": ["Fleur d’oranger"]}'::jsonb,'{"intensity": 3, "sillage": 3, "longevity": "Composition de démonstration", "season": "Toutes saisons", "occasion": "Votre signature personnelle"}'::jsonb,ARRAY['Composition illustrative — projet pédagogique']::text[],true) ON CONFLICT(id) DO UPDATE SET slug=EXCLUDED.slug,name=EXCLUDED.name,subtitle=EXCLUDED.subtitle,tagline=EXCLUDED.tagline,family=EXCLUDED.family,family_label=EXCLUDED.family_label,description=EXCLUDED.description,story=EXCLUDED.story,destination=EXCLUDED.destination,price=EXCLUDED.price,volume=EXCLUDED.volume,rating=EXCLUDED.rating,review_count=EXCLUDED.review_count,is_bestseller=EXCLUDED.is_bestseller,is_new=EXCLUDED.is_new,is_vanilla_collection=EXCLUDED.is_vanilla_collection,image=EXCLUDED.image,mood_color=EXCLUDED.mood_color,pyramid=EXCLUDED.pyramid,profile=EXCLUDED.profile,ingredients=EXCLUDED.ingredients,is_active=true;
INSERT INTO public.product_variants(product_id,size,price,stock,sku) VALUES('botanique-neroli-soleil','50ml',119,30,'SC-NEROLI-SOLEIL-50') ON CONFLICT(product_id,size) DO UPDATE SET price=EXCLUDED.price;
INSERT INTO public.products(id,slug,name,subtitle,tagline,family,family_label,description,story,destination,price,volume,rating,review_count,is_bestseller,is_new,is_vanilla_collection,image,mood_color,pyramid,profile,ingredients,is_active) VALUES('botanique-bois-de-santal','bois-de-santal','Bois de Santal','Eau de parfum · Collection botanique','Le jardin des émotions','boisee','Boisé','Santal · Cèdre · Musc','Fermez les yeux. Santal, Cèdre, Musc composent un paysage sensible, une rencontre entre lumière, matière et souvenirs. Chaque note se dévoile lentement, comme une nouvelle destination. Un voyage à porter sur la peau.','Le jardin des émotions',149,'50 ml',0,0,false,false,false,'/flacons/bois-de-santal.svg','#c8ab88','{"top": ["Santal"], "heart": ["Cèdre"], "base": ["Musc"]}'::jsonb,'{"intensity": 3, "sillage": 3, "longevity": "Composition de démonstration", "season": "Toutes saisons", "occasion": "Votre signature personnelle"}'::jsonb,ARRAY['Composition illustrative — projet pédagogique']::text[],true) ON CONFLICT(id) DO UPDATE SET slug=EXCLUDED.slug,name=EXCLUDED.name,subtitle=EXCLUDED.subtitle,tagline=EXCLUDED.tagline,family=EXCLUDED.family,family_label=EXCLUDED.family_label,description=EXCLUDED.description,story=EXCLUDED.story,destination=EXCLUDED.destination,price=EXCLUDED.price,volume=EXCLUDED.volume,rating=EXCLUDED.rating,review_count=EXCLUDED.review_count,is_bestseller=EXCLUDED.is_bestseller,is_new=EXCLUDED.is_new,is_vanilla_collection=EXCLUDED.is_vanilla_collection,image=EXCLUDED.image,mood_color=EXCLUDED.mood_color,pyramid=EXCLUDED.pyramid,profile=EXCLUDED.profile,ingredients=EXCLUDED.ingredients,is_active=true;
INSERT INTO public.product_variants(product_id,size,price,stock,sku) VALUES('botanique-bois-de-santal','50ml',149,30,'SC-BOIS-DE-SANTAL-50') ON CONFLICT(product_id,size) DO UPDATE SET price=EXCLUDED.price;
INSERT INTO public.products(id,slug,name,subtitle,tagline,family,family_label,description,story,destination,price,volume,rating,review_count,is_bestseller,is_new,is_vanilla_collection,image,mood_color,pyramid,profile,ingredients,is_active) VALUES('scent-05','vanille-jasmin','Vanille & Jasmin','Eau de parfum · Collection botanique','Une nuit blanche à Marrakech','gourmande','Gourmand','Jasmin sambac · Vanille · Ambre','Le jasmin s’épanouit dans les ruelles silencieuses. Plus loin, la vanille et l’ambre réchauffent l’air du soir. Chaque pas devient un souvenir. Le charme des nuits qui ne finissent pas.','Une nuit blanche à Marrakech',135,'50 ml',0,0,false,true,true,'/flacons/vanille-jasmin.svg','#e5bd93','{"top": ["Jasmin sambac"], "heart": ["Vanille"], "base": ["Ambre"]}'::jsonb,'{"intensity": 3, "sillage": 3, "longevity": "Composition de démonstration", "season": "Toutes saisons", "occasion": "Votre signature personnelle"}'::jsonb,ARRAY['Composition illustrative — projet pédagogique']::text[],true) ON CONFLICT(id) DO UPDATE SET slug=EXCLUDED.slug,name=EXCLUDED.name,subtitle=EXCLUDED.subtitle,tagline=EXCLUDED.tagline,family=EXCLUDED.family,family_label=EXCLUDED.family_label,description=EXCLUDED.description,story=EXCLUDED.story,destination=EXCLUDED.destination,price=EXCLUDED.price,volume=EXCLUDED.volume,rating=EXCLUDED.rating,review_count=EXCLUDED.review_count,is_bestseller=EXCLUDED.is_bestseller,is_new=EXCLUDED.is_new,is_vanilla_collection=EXCLUDED.is_vanilla_collection,image=EXCLUDED.image,mood_color=EXCLUDED.mood_color,pyramid=EXCLUDED.pyramid,profile=EXCLUDED.profile,ingredients=EXCLUDED.ingredients,is_active=true;
INSERT INTO public.product_variants(product_id,size,price,stock,sku) VALUES('scent-05','50ml',135,30,'SC-VANILLE-JASMIN-50') ON CONFLICT(product_id,size) DO UPDATE SET price=EXCLUDED.price;
INSERT INTO public.products(id,slug,name,subtitle,tagline,family,family_label,description,story,destination,price,volume,rating,review_count,is_bestseller,is_new,is_vanilla_collection,image,mood_color,pyramid,profile,ingredients,is_active) VALUES('botanique-lait-damande','lait-damande','Lait d’Amande','Eau de parfum · Collection botanique','Le jardin des émotions','gourmande','Gourmand','Amande douce · Lait · Vanille','Fermez les yeux. Amande douce, Lait, Vanille composent un paysage sensible, une rencontre entre lumière, matière et souvenirs. Chaque note se dévoile lentement, comme une nouvelle destination. Un voyage à porter sur la peau.','Le jardin des émotions',118,'50 ml',0,0,false,false,true,'/flacons/lait-damande.svg','#d9c0a2','{"top": ["Amande douce"], "heart": ["Lait"], "base": ["Vanille"]}'::jsonb,'{"intensity": 3, "sillage": 3, "longevity": "Composition de démonstration", "season": "Toutes saisons", "occasion": "Votre signature personnelle"}'::jsonb,ARRAY['Composition illustrative — projet pédagogique']::text[],true) ON CONFLICT(id) DO UPDATE SET slug=EXCLUDED.slug,name=EXCLUDED.name,subtitle=EXCLUDED.subtitle,tagline=EXCLUDED.tagline,family=EXCLUDED.family,family_label=EXCLUDED.family_label,description=EXCLUDED.description,story=EXCLUDED.story,destination=EXCLUDED.destination,price=EXCLUDED.price,volume=EXCLUDED.volume,rating=EXCLUDED.rating,review_count=EXCLUDED.review_count,is_bestseller=EXCLUDED.is_bestseller,is_new=EXCLUDED.is_new,is_vanilla_collection=EXCLUDED.is_vanilla_collection,image=EXCLUDED.image,mood_color=EXCLUDED.mood_color,pyramid=EXCLUDED.pyramid,profile=EXCLUDED.profile,ingredients=EXCLUDED.ingredients,is_active=true;
INSERT INTO public.product_variants(product_id,size,price,stock,sku) VALUES('botanique-lait-damande','50ml',118,30,'SC-LAIT-DAMANDE-50') ON CONFLICT(product_id,size) DO UPDATE SET price=EXCLUDED.price;
INSERT INTO public.products(id,slug,name,subtitle,tagline,family,family_label,description,story,destination,price,volume,rating,review_count,is_bestseller,is_new,is_vanilla_collection,image,mood_color,pyramid,profile,ingredients,is_active) VALUES('botanique-figue-blanche','figue-blanche','Figue Blanche','Eau de parfum · Collection botanique','Le jardin des émotions','fraiche','Frais','Figue · Thé blanc · Feuilles vertes','Fermez les yeux. Figue, Thé blanc, Feuilles vertes composent un paysage sensible, une rencontre entre lumière, matière et souvenirs. Chaque note se dévoile lentement, comme une nouvelle destination. Un voyage à porter sur la peau.','Le jardin des émotions',125,'50 ml',0,0,false,false,false,'/flacons/figue-blanche.svg','#b4bf95','{"top": ["Figue"], "heart": ["Thé blanc"], "base": ["Feuilles vertes"]}'::jsonb,'{"intensity": 3, "sillage": 3, "longevity": "Composition de démonstration", "season": "Toutes saisons", "occasion": "Votre signature personnelle"}'::jsonb,ARRAY['Composition illustrative — projet pédagogique']::text[],true) ON CONFLICT(id) DO UPDATE SET slug=EXCLUDED.slug,name=EXCLUDED.name,subtitle=EXCLUDED.subtitle,tagline=EXCLUDED.tagline,family=EXCLUDED.family,family_label=EXCLUDED.family_label,description=EXCLUDED.description,story=EXCLUDED.story,destination=EXCLUDED.destination,price=EXCLUDED.price,volume=EXCLUDED.volume,rating=EXCLUDED.rating,review_count=EXCLUDED.review_count,is_bestseller=EXCLUDED.is_bestseller,is_new=EXCLUDED.is_new,is_vanilla_collection=EXCLUDED.is_vanilla_collection,image=EXCLUDED.image,mood_color=EXCLUDED.mood_color,pyramid=EXCLUDED.pyramid,profile=EXCLUDED.profile,ingredients=EXCLUDED.ingredients,is_active=true;
INSERT INTO public.product_variants(product_id,size,price,stock,sku) VALUES('botanique-figue-blanche','50ml',125,30,'SC-FIGUE-BLANCHE-50') ON CONFLICT(product_id,size) DO UPDATE SET price=EXCLUDED.price;
INSERT INTO public.products(id,slug,name,subtitle,tagline,family,family_label,description,story,destination,price,volume,rating,review_count,is_bestseller,is_new,is_vanilla_collection,image,mood_color,pyramid,profile,ingredients,is_active) VALUES('botanique-orchidee-velours','orchidee-velours','Orchidée Velours','Eau de parfum · Collection botanique','Le jardin des émotions','florale','Floral','Orchidée · Prune · Musc','Fermez les yeux. Orchidée, Prune, Musc composent un paysage sensible, une rencontre entre lumière, matière et souvenirs. Chaque note se dévoile lentement, comme une nouvelle destination. Un voyage à porter sur la peau.','Le jardin des émotions',159,'50 ml',0,0,false,false,false,'/flacons/orchidee-velours.svg','#b99cbe','{"top": ["Orchidée"], "heart": ["Prune"], "base": ["Musc"]}'::jsonb,'{"intensity": 3, "sillage": 3, "longevity": "Composition de démonstration", "season": "Toutes saisons", "occasion": "Votre signature personnelle"}'::jsonb,ARRAY['Composition illustrative — projet pédagogique']::text[],true) ON CONFLICT(id) DO UPDATE SET slug=EXCLUDED.slug,name=EXCLUDED.name,subtitle=EXCLUDED.subtitle,tagline=EXCLUDED.tagline,family=EXCLUDED.family,family_label=EXCLUDED.family_label,description=EXCLUDED.description,story=EXCLUDED.story,destination=EXCLUDED.destination,price=EXCLUDED.price,volume=EXCLUDED.volume,rating=EXCLUDED.rating,review_count=EXCLUDED.review_count,is_bestseller=EXCLUDED.is_bestseller,is_new=EXCLUDED.is_new,is_vanilla_collection=EXCLUDED.is_vanilla_collection,image=EXCLUDED.image,mood_color=EXCLUDED.mood_color,pyramid=EXCLUDED.pyramid,profile=EXCLUDED.profile,ingredients=EXCLUDED.ingredients,is_active=true;
INSERT INTO public.product_variants(product_id,size,price,stock,sku) VALUES('botanique-orchidee-velours','50ml',159,30,'SC-ORCHIDEE-VELOURS-50') ON CONFLICT(product_id,size) DO UPDATE SET price=EXCLUDED.price;
INSERT INTO public.products(id,slug,name,subtitle,tagline,family,family_label,description,story,destination,price,volume,rating,review_count,is_bestseller,is_new,is_vanilla_collection,image,mood_color,pyramid,profile,ingredients,is_active) VALUES('botanique-miel-de-provence','miel-de-provence','Miel de Provence','Eau de parfum · Collection botanique','Le jardin des émotions','gourmande','Gourmand','Miel · Fleur d’oranger · Vanille','Fermez les yeux. Miel, Fleur d’oranger, Vanille composent un paysage sensible, une rencontre entre lumière, matière et souvenirs. Chaque note se dévoile lentement, comme une nouvelle destination. Un voyage à porter sur la peau.','Le jardin des émotions',132,'50 ml',0,0,false,false,true,'/flacons/miel-de-provence.svg','#dfb976','{"top": ["Miel"], "heart": ["Fleur d’oranger"], "base": ["Vanille"]}'::jsonb,'{"intensity": 3, "sillage": 3, "longevity": "Composition de démonstration", "season": "Toutes saisons", "occasion": "Votre signature personnelle"}'::jsonb,ARRAY['Composition illustrative — projet pédagogique']::text[],true) ON CONFLICT(id) DO UPDATE SET slug=EXCLUDED.slug,name=EXCLUDED.name,subtitle=EXCLUDED.subtitle,tagline=EXCLUDED.tagline,family=EXCLUDED.family,family_label=EXCLUDED.family_label,description=EXCLUDED.description,story=EXCLUDED.story,destination=EXCLUDED.destination,price=EXCLUDED.price,volume=EXCLUDED.volume,rating=EXCLUDED.rating,review_count=EXCLUDED.review_count,is_bestseller=EXCLUDED.is_bestseller,is_new=EXCLUDED.is_new,is_vanilla_collection=EXCLUDED.is_vanilla_collection,image=EXCLUDED.image,mood_color=EXCLUDED.mood_color,pyramid=EXCLUDED.pyramid,profile=EXCLUDED.profile,ingredients=EXCLUDED.ingredients,is_active=true;
INSERT INTO public.product_variants(product_id,size,price,stock,sku) VALUES('botanique-miel-de-provence','50ml',132,30,'SC-MIEL-DE-PROVENCE-50') ON CONFLICT(product_id,size) DO UPDATE SET price=EXCLUDED.price;
INSERT INTO public.products(id,slug,name,subtitle,tagline,family,family_label,description,story,destination,price,volume,rating,review_count,is_bestseller,is_new,is_vanilla_collection,image,mood_color,pyramid,profile,ingredients,is_active) VALUES('botanique-petales-de-soie','petales-de-soie','Pétales de Soie','Eau de parfum · Collection botanique','Le jardin des émotions','florale','Floral','Magnolia · Freesia · Musc','Fermez les yeux. Magnolia, Freesia, Musc composent un paysage sensible, une rencontre entre lumière, matière et souvenirs. Chaque note se dévoile lentement, comme une nouvelle destination. Un voyage à porter sur la peau.','Le jardin des émotions',122,'50 ml',0,0,false,false,false,'/flacons/petales-de-soie.svg','#dfb5c0','{"top": ["Magnolia"], "heart": ["Freesia"], "base": ["Musc"]}'::jsonb,'{"intensity": 3, "sillage": 3, "longevity": "Composition de démonstration", "season": "Toutes saisons", "occasion": "Votre signature personnelle"}'::jsonb,ARRAY['Composition illustrative — projet pédagogique']::text[],true) ON CONFLICT(id) DO UPDATE SET slug=EXCLUDED.slug,name=EXCLUDED.name,subtitle=EXCLUDED.subtitle,tagline=EXCLUDED.tagline,family=EXCLUDED.family,family_label=EXCLUDED.family_label,description=EXCLUDED.description,story=EXCLUDED.story,destination=EXCLUDED.destination,price=EXCLUDED.price,volume=EXCLUDED.volume,rating=EXCLUDED.rating,review_count=EXCLUDED.review_count,is_bestseller=EXCLUDED.is_bestseller,is_new=EXCLUDED.is_new,is_vanilla_collection=EXCLUDED.is_vanilla_collection,image=EXCLUDED.image,mood_color=EXCLUDED.mood_color,pyramid=EXCLUDED.pyramid,profile=EXCLUDED.profile,ingredients=EXCLUDED.ingredients,is_active=true;
INSERT INTO public.product_variants(product_id,size,price,stock,sku) VALUES('botanique-petales-de-soie','50ml',122,30,'SC-PETALES-DE-SOIE-50') ON CONFLICT(product_id,size) DO UPDATE SET price=EXCLUDED.price;
INSERT INTO public.products(id,slug,name,subtitle,tagline,family,family_label,description,story,destination,price,volume,rating,review_count,is_bestseller,is_new,is_vanilla_collection,image,mood_color,pyramid,profile,ingredients,is_active) VALUES('botanique-the-de-lune','the-de-lune','Thé de Lune','Eau de parfum · Collection botanique','Le jardin des émotions','fraiche','Frais','Thé vert · Citron · Musc','Fermez les yeux. Thé vert, Citron, Musc composent un paysage sensible, une rencontre entre lumière, matière et souvenirs. Chaque note se dévoile lentement, comme une nouvelle destination. Un voyage à porter sur la peau.','Le jardin des émotions',112,'50 ml',0,0,false,false,false,'/flacons/the-de-lune.svg','#bcc8a9','{"top": ["Thé vert"], "heart": ["Citron"], "base": ["Musc"]}'::jsonb,'{"intensity": 3, "sillage": 3, "longevity": "Composition de démonstration", "season": "Toutes saisons", "occasion": "Votre signature personnelle"}'::jsonb,ARRAY['Composition illustrative — projet pédagogique']::text[],true) ON CONFLICT(id) DO UPDATE SET slug=EXCLUDED.slug,name=EXCLUDED.name,subtitle=EXCLUDED.subtitle,tagline=EXCLUDED.tagline,family=EXCLUDED.family,family_label=EXCLUDED.family_label,description=EXCLUDED.description,story=EXCLUDED.story,destination=EXCLUDED.destination,price=EXCLUDED.price,volume=EXCLUDED.volume,rating=EXCLUDED.rating,review_count=EXCLUDED.review_count,is_bestseller=EXCLUDED.is_bestseller,is_new=EXCLUDED.is_new,is_vanilla_collection=EXCLUDED.is_vanilla_collection,image=EXCLUDED.image,mood_color=EXCLUDED.mood_color,pyramid=EXCLUDED.pyramid,profile=EXCLUDED.profile,ingredients=EXCLUDED.ingredients,is_active=true;
INSERT INTO public.product_variants(product_id,size,price,stock,sku) VALUES('botanique-the-de-lune','50ml',112,30,'SC-THE-DE-LUNE-50') ON CONFLICT(product_id,size) DO UPDATE SET price=EXCLUDED.price;
INSERT INTO public.products(id,slug,name,subtitle,tagline,family,family_label,description,story,destination,price,volume,rating,review_count,is_bestseller,is_new,is_vanilla_collection,image,mood_color,pyramid,profile,ingredients,is_active) VALUES('botanique-ambre-precieux','ambre-precieux','Ambre Précieux','Eau de parfum · Collection botanique','Le jardin des émotions','boisee','Boisé','Ambre · Résine · Bois doux','Fermez les yeux. Ambre, Résine, Bois doux composent un paysage sensible, une rencontre entre lumière, matière et souvenirs. Chaque note se dévoile lentement, comme une nouvelle destination. Un voyage à porter sur la peau.','Le jardin des émotions',165,'50 ml',0,0,false,false,false,'/flacons/ambre-precieux.svg','#bd8d69','{"top": ["Ambre"], "heart": ["Résine"], "base": ["Bois doux"]}'::jsonb,'{"intensity": 3, "sillage": 3, "longevity": "Composition de démonstration", "season": "Toutes saisons", "occasion": "Votre signature personnelle"}'::jsonb,ARRAY['Composition illustrative — projet pédagogique']::text[],true) ON CONFLICT(id) DO UPDATE SET slug=EXCLUDED.slug,name=EXCLUDED.name,subtitle=EXCLUDED.subtitle,tagline=EXCLUDED.tagline,family=EXCLUDED.family,family_label=EXCLUDED.family_label,description=EXCLUDED.description,story=EXCLUDED.story,destination=EXCLUDED.destination,price=EXCLUDED.price,volume=EXCLUDED.volume,rating=EXCLUDED.rating,review_count=EXCLUDED.review_count,is_bestseller=EXCLUDED.is_bestseller,is_new=EXCLUDED.is_new,is_vanilla_collection=EXCLUDED.is_vanilla_collection,image=EXCLUDED.image,mood_color=EXCLUDED.mood_color,pyramid=EXCLUDED.pyramid,profile=EXCLUDED.profile,ingredients=EXCLUDED.ingredients,is_active=true;
INSERT INTO public.product_variants(product_id,size,price,stock,sku) VALUES('botanique-ambre-precieux','50ml',165,30,'SC-AMBRE-PRECIEUX-50') ON CONFLICT(product_id,size) DO UPDATE SET price=EXCLUDED.price;
INSERT INTO public.products(id,slug,name,subtitle,tagline,family,family_label,description,story,destination,price,volume,rating,review_count,is_bestseller,is_new,is_vanilla_collection,image,mood_color,pyramid,profile,ingredients,is_active) VALUES('botanique-vanille-rosee','vanille-rosee','Vanille Rosée','Eau de parfum · Collection botanique','L’aube dans une roseraie','gourmande','Gourmand','Vanille · Rose · Framboise','Les pétales perlés de rosée s’éveillent. Une framboise délicate illumine la vanille, et le jardin devient un rêve tendre. La gourmandise rencontre la poésie.','L’aube dans une roseraie',139,'50 ml',0,0,true,false,true,'/flacons/vanille-rosee.svg','#e1a3ad','{"top": ["Vanille"], "heart": ["Rose"], "base": ["Framboise"]}'::jsonb,'{"intensity": 3, "sillage": 3, "longevity": "Composition de démonstration", "season": "Toutes saisons", "occasion": "Votre signature personnelle"}'::jsonb,ARRAY['Composition illustrative — projet pédagogique']::text[],true) ON CONFLICT(id) DO UPDATE SET slug=EXCLUDED.slug,name=EXCLUDED.name,subtitle=EXCLUDED.subtitle,tagline=EXCLUDED.tagline,family=EXCLUDED.family,family_label=EXCLUDED.family_label,description=EXCLUDED.description,story=EXCLUDED.story,destination=EXCLUDED.destination,price=EXCLUDED.price,volume=EXCLUDED.volume,rating=EXCLUDED.rating,review_count=EXCLUDED.review_count,is_bestseller=EXCLUDED.is_bestseller,is_new=EXCLUDED.is_new,is_vanilla_collection=EXCLUDED.is_vanilla_collection,image=EXCLUDED.image,mood_color=EXCLUDED.mood_color,pyramid=EXCLUDED.pyramid,profile=EXCLUDED.profile,ingredients=EXCLUDED.ingredients,is_active=true;
INSERT INTO public.product_variants(product_id,size,price,stock,sku) VALUES('botanique-vanille-rosee','50ml',139,30,'SC-VANILLE-ROSEE-50') ON CONFLICT(product_id,size) DO UPDATE SET price=EXCLUDED.price;
INSERT INTO public.products(id,slug,name,subtitle,tagline,family,family_label,description,story,destination,price,volume,rating,review_count,is_bestseller,is_new,is_vanilla_collection,image,mood_color,pyramid,profile,ingredients,is_active) VALUES('botanique-nuit-de-cachemire','nuit-de-cachemire','Nuit de Cachemire','Eau de parfum · Collection botanique','Le jardin des émotions','boisee','Boisé','Cachemire · Iris · Bois ambrés','Fermez les yeux. Cachemire, Iris, Bois ambrés composent un paysage sensible, une rencontre entre lumière, matière et souvenirs. Chaque note se dévoile lentement, comme une nouvelle destination. Un voyage à porter sur la peau.','Le jardin des émotions',169,'50 ml',0,0,false,false,false,'/flacons/nuit-de-cachemire.svg','#a99a9b','{"top": ["Cachemire"], "heart": ["Iris"], "base": ["Bois ambrés"]}'::jsonb,'{"intensity": 3, "sillage": 3, "longevity": "Composition de démonstration", "season": "Toutes saisons", "occasion": "Votre signature personnelle"}'::jsonb,ARRAY['Composition illustrative — projet pédagogique']::text[],true) ON CONFLICT(id) DO UPDATE SET slug=EXCLUDED.slug,name=EXCLUDED.name,subtitle=EXCLUDED.subtitle,tagline=EXCLUDED.tagline,family=EXCLUDED.family,family_label=EXCLUDED.family_label,description=EXCLUDED.description,story=EXCLUDED.story,destination=EXCLUDED.destination,price=EXCLUDED.price,volume=EXCLUDED.volume,rating=EXCLUDED.rating,review_count=EXCLUDED.review_count,is_bestseller=EXCLUDED.is_bestseller,is_new=EXCLUDED.is_new,is_vanilla_collection=EXCLUDED.is_vanilla_collection,image=EXCLUDED.image,mood_color=EXCLUDED.mood_color,pyramid=EXCLUDED.pyramid,profile=EXCLUDED.profile,ingredients=EXCLUDED.ingredients,is_active=true;
INSERT INTO public.product_variants(product_id,size,price,stock,sku) VALUES('botanique-nuit-de-cachemire','50ml',169,30,'SC-NUIT-DE-CACHEMIRE-50') ON CONFLICT(product_id,size) DO UPDATE SET price=EXCLUDED.price;
INSERT INTO public.products(id,slug,name,subtitle,tagline,family,family_label,description,story,destination,price,volume,rating,review_count,is_bestseller,is_new,is_vanilla_collection,image,mood_color,pyramid,profile,ingredients,is_active) VALUES('scent-03','fleur-de-vanille','Fleur de Vanille','Eau de parfum · Collection botanique','Un jardin tropical au lever du jour','gourmande','Gourmand','Vanille · Ylang-ylang · Orchidée','Les premiers rayons caressent les orchidées. La vanille se mêle à l’ylang-ylang dans une lumière dorée, entre fleurs exotiques et peau chauffée par le soleil. Une escapade florale et solaire.','Un jardin tropical au lever du jour',142,'50 ml',0,0,false,true,true,'/flacons/fleur-de-vanille.svg','#d9b18d','{"top": ["Vanille"], "heart": ["Ylang-ylang"], "base": ["Orchidée"]}'::jsonb,'{"intensity": 3, "sillage": 3, "longevity": "Composition de démonstration", "season": "Toutes saisons", "occasion": "Votre signature personnelle"}'::jsonb,ARRAY['Composition illustrative — projet pédagogique']::text[],true) ON CONFLICT(id) DO UPDATE SET slug=EXCLUDED.slug,name=EXCLUDED.name,subtitle=EXCLUDED.subtitle,tagline=EXCLUDED.tagline,family=EXCLUDED.family,family_label=EXCLUDED.family_label,description=EXCLUDED.description,story=EXCLUDED.story,destination=EXCLUDED.destination,price=EXCLUDED.price,volume=EXCLUDED.volume,rating=EXCLUDED.rating,review_count=EXCLUDED.review_count,is_bestseller=EXCLUDED.is_bestseller,is_new=EXCLUDED.is_new,is_vanilla_collection=EXCLUDED.is_vanilla_collection,image=EXCLUDED.image,mood_color=EXCLUDED.mood_color,pyramid=EXCLUDED.pyramid,profile=EXCLUDED.profile,ingredients=EXCLUDED.ingredients,is_active=true;
INSERT INTO public.product_variants(product_id,size,price,stock,sku) VALUES('scent-03','50ml',142,30,'SC-FLEUR-DE-VANILLE-50') ON CONFLICT(product_id,size) DO UPDATE SET price=EXCLUDED.price;
INSERT INTO public.products(id,slug,name,subtitle,tagline,family,family_label,description,story,destination,price,volume,rating,review_count,is_bestseller,is_new,is_vanilla_collection,image,mood_color,pyramid,profile,ingredients,is_active) VALUES('botanique-cerise-blanche','cerise-blanche','Cerise Blanche','Eau de parfum · Collection botanique','Le jardin des émotions','fruite','Fruité','Cerise · Amande · Musc','Fermez les yeux. Cerise, Amande, Musc composent un paysage sensible, une rencontre entre lumière, matière et souvenirs. Chaque note se dévoile lentement, comme une nouvelle destination. Un voyage à porter sur la peau.','Le jardin des émotions',128,'50 ml',0,0,false,false,false,'/flacons/cerise-blanche.svg','#d99ba6','{"top": ["Cerise"], "heart": ["Amande"], "base": ["Musc"]}'::jsonb,'{"intensity": 3, "sillage": 3, "longevity": "Composition de démonstration", "season": "Toutes saisons", "occasion": "Votre signature personnelle"}'::jsonb,ARRAY['Composition illustrative — projet pédagogique']::text[],true) ON CONFLICT(id) DO UPDATE SET slug=EXCLUDED.slug,name=EXCLUDED.name,subtitle=EXCLUDED.subtitle,tagline=EXCLUDED.tagline,family=EXCLUDED.family,family_label=EXCLUDED.family_label,description=EXCLUDED.description,story=EXCLUDED.story,destination=EXCLUDED.destination,price=EXCLUDED.price,volume=EXCLUDED.volume,rating=EXCLUDED.rating,review_count=EXCLUDED.review_count,is_bestseller=EXCLUDED.is_bestseller,is_new=EXCLUDED.is_new,is_vanilla_collection=EXCLUDED.is_vanilla_collection,image=EXCLUDED.image,mood_color=EXCLUDED.mood_color,pyramid=EXCLUDED.pyramid,profile=EXCLUDED.profile,ingredients=EXCLUDED.ingredients,is_active=true;
INSERT INTO public.product_variants(product_id,size,price,stock,sku) VALUES('botanique-cerise-blanche','50ml',128,30,'SC-CERISE-BLANCHE-50') ON CONFLICT(product_id,size) DO UPDATE SET price=EXCLUDED.price;
DROP POLICY IF EXISTS products_read ON public.products;
CREATE POLICY products_read ON public.products FOR SELECT TO anon,authenticated USING(is_active OR (SELECT auth.uid()) IS NOT NULL);

