/*
  ═══════════════════════════════════════════════════════════════════
  🚗 AMÉLIORATION BRANDS - SUPPORT SOUS-CATÉGORIES VÉHICULES
  ═══════════════════════════════════════════════════════════════════

  Problème: Actuellement, toutes les marques 'vehicles' sont affichées
  pour TOUTES les sous-catégories (voitures, motos, camions).
  
  Solution: Ajouter une colonne `vehicle_types` (array) pour permettre
  à une marque d'être associée à une ou plusieurs sous-catégories.

  Exemples:
  - Peugeot: ['voitures']
  - Yamaha: ['motos']
  - Mercedes: ['voitures', 'camions']
  - Honda: ['voitures', 'motos']
*/

-- ═══════════════════════════════════════════════════════════════════
-- ÉTAPE 1 : AJOUTER COLONNE vehicle_types
-- ═══════════════════════════════════════════════════════════════════

ALTER TABLE brands 
ADD COLUMN vehicle_types TEXT[];

-- Commentaire pour documenter
COMMENT ON COLUMN brands.vehicle_types IS 
  'Types de véhicules pour lesquels cette marque est applicable (voitures, motos, camions, etc.)';

-- ═══════════════════════════════════════════════════════════════════
-- ÉTAPE 2 : MISE À JOUR DES MARQUES EXISTANTES
-- ═══════════════════════════════════════════════════════════════════

-- Marques de VOITURES uniquement
UPDATE brands SET vehicle_types = ARRAY['voitures'] 
WHERE category_type = 'vehicles' AND name IN (
  'Volkswagen', 'Peugeot', 'Renault', 'Hyundai', 'Kia', 
  'Toyota', 'Nissan', 'Dacia', 'Fiat', 'Ford',
  'Mercedes-Benz', 'BMW', 'Audi', 'Citroën', 'Opel',
  'Seat', 'Skoda', 'Mazda', 'Chevrolet', 'Jeep',
  'Land Rover', 'Volvo'
);

-- Marques de MOTOS uniquement
-- D'abord, mettre à jour les existantes (si déjà présentes)
UPDATE brands SET vehicle_types = ARRAY['motos']
WHERE category_type = 'vehicles' AND name IN ('Yamaha', 'Kawasaki', 'Ducati', 'Harley-Davidson', 'KTM', 'Aprilia', 'Triumph', 'Vespa');

-- Ensuite, insérer UNIQUEMENT les nouvelles marques
INSERT INTO brands (name, slug, category_type, country_origin, is_popular, display_order, vehicle_types) 
SELECT * FROM (VALUES
  ('Yamaha', 'yamaha', 'vehicles', 'Japon', TRUE, 30, ARRAY['motos']),
  ('Kawasaki', 'kawasaki', 'vehicles', 'Japon', TRUE, 31, ARRAY['motos']),
  ('Ducati', 'ducati', 'vehicles', 'Italie', TRUE, 32, ARRAY['motos']),
  ('Harley-Davidson', 'harley-davidson', 'vehicles', 'États-Unis', TRUE, 33, ARRAY['motos']),
  ('KTM', 'ktm', 'vehicles', 'Autriche', TRUE, 34, ARRAY['motos']),
  ('Aprilia', 'aprilia', 'vehicles', 'Italie', FALSE, 35, ARRAY['motos']),
  ('Triumph', 'triumph', 'vehicles', 'Royaume-Uni', FALSE, 36, ARRAY['motos']),
  ('Vespa', 'vespa', 'vehicles', 'Italie', TRUE, 37, ARRAY['motos'])
) AS new_brands(name, slug, category_type, country_origin, is_popular, display_order, vehicle_types)
WHERE NOT EXISTS (
  SELECT 1 FROM brands WHERE brands.name = new_brands.name AND brands.category_type = new_brands.category_type
);

-- Marques de CAMIONS uniquement
-- D'abord, mettre à jour les existantes (si déjà présentes)
UPDATE brands SET vehicle_types = ARRAY['camions']
WHERE category_type = 'vehicles' AND name IN ('Scania', 'MAN', 'Iveco', 'DAF', 'Renault Trucks');

-- Ensuite, insérer UNIQUEMENT les nouvelles marques
INSERT INTO brands (name, slug, category_type, country_origin, is_popular, display_order, vehicle_types) 
SELECT * FROM (VALUES
  ('Scania', 'scania', 'vehicles', 'Suède', TRUE, 40, ARRAY['camions']),
  ('MAN', 'man', 'vehicles', 'Allemagne', TRUE, 41, ARRAY['camions']),
  ('Iveco', 'iveco', 'vehicles', 'Italie', TRUE, 42, ARRAY['camions']),
  ('DAF', 'daf', 'vehicles', 'Pays-Bas', TRUE, 43, ARRAY['camions']),
  ('Renault Trucks', 'renault-trucks', 'vehicles', 'France', TRUE, 44, ARRAY['camions'])
) AS new_brands(name, slug, category_type, country_origin, is_popular, display_order, vehicle_types)
WHERE NOT EXISTS (
  SELECT 1 FROM brands WHERE brands.name = new_brands.name AND brands.category_type = new_brands.category_type
);

-- Marques MIXTES (voitures ET motos)
UPDATE brands SET vehicle_types = ARRAY['voitures', 'motos'] 
WHERE category_type = 'vehicles' AND name IN ('Honda', 'Suzuki');

-- Marques MIXTES (voitures ET camions)
UPDATE brands SET vehicle_types = ARRAY['voitures', 'camions'] 
WHERE category_type = 'vehicles' AND name IN ('Mercedes-Benz', 'Volvo', 'Ford');

-- ═══════════════════════════════════════════════════════════════════
-- ÉTAPE 3 : CRÉER INDEX POUR OPTIMISER LES RECHERCHES
-- ═══════════════════════════════════════════════════════════════════

CREATE INDEX idx_brands_vehicle_types ON brands USING GIN (vehicle_types);

-- ═══════════════════════════════════════════════════════════════════
-- ÉTAPE 4 : FONCTION POUR OBTENIR MARQUES PAR SOUS-CATÉGORIE
-- ═══════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION get_brands_by_subcategory(
  p_category_type TEXT DEFAULT NULL,
  p_vehicle_type TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  category_type TEXT,
  vehicle_types TEXT[],
  country_origin TEXT,
  is_popular BOOLEAN,
  logo_url TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    b.id,
    b.name,
    b.slug,
    b.category_type,
    b.vehicle_types,
    b.country_origin,
    b.is_popular,
    b.logo_url
  FROM brands b
  WHERE
    (p_category_type IS NULL OR b.category_type = p_category_type)
    AND (
      p_vehicle_type IS NULL 
      OR b.vehicle_types IS NULL  -- Pour compatibilité avec anciennes données
      OR p_vehicle_type = ANY(b.vehicle_types)
    )
  ORDER BY
    b.display_order ASC,
    b.is_popular DESC,
    b.name ASC;
END;
$$;

-- ═══════════════════════════════════════════════════════════════════
-- ÉTAPE 5 : OPTIMISER LES STATISTIQUES
-- ═══════════════════════════════════════════════════════════════════

-- Mettre à jour les statistiques pour optimiser le query planner
ANALYZE brands;

-- ═══════════════════════════════════════════════════════════════════
-- ✅ TERMINÉ !
-- ═══════════════════════════════════════════════════════════════════

DO $$
DECLARE
  cars_count INTEGER;
  motos_count INTEGER;
  trucks_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO cars_count FROM brands WHERE 'voitures' = ANY(vehicle_types);
  SELECT COUNT(*) INTO motos_count FROM brands WHERE 'motos' = ANY(vehicle_types);
  SELECT COUNT(*) INTO trucks_count FROM brands WHERE 'camions' = ANY(vehicle_types);

  RAISE NOTICE '═══════════════════════════════════════════';
  RAISE NOTICE '✅ MIGRATION BRANDS - SOUS-CATÉGORIES VÉHICULES';
  RAISE NOTICE '═══════════════════════════════════════════';
  RAISE NOTICE 'Marques Voitures: %', cars_count;
  RAISE NOTICE 'Marques Motos: %', motos_count;
  RAISE NOTICE 'Marques Camions: %', trucks_count;
  RAISE NOTICE '';
  RAISE NOTICE 'Utilisation:';
  RAISE NOTICE '  SELECT * FROM get_brands_by_subcategory(''vehicles'', ''voitures'');';
  RAISE NOTICE '  SELECT * FROM get_brands_by_subcategory(''vehicles'', ''motos'');';
  RAISE NOTICE '  SELECT * FROM get_brands_by_subcategory(''vehicles'', ''camions'');';
  RAISE NOTICE '═══════════════════════════════════════════';
END $$;
