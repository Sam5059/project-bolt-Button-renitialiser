-- Migration: Fusionner 'loisirs-divertissement' dans 'loisirs-hobbies'
-- Date: 2025-11-10
-- Description: Consolide les deux catégories en une seule pour éviter la duplication

DO $$
DECLARE
  loisirs_hobbies_id UUID;
  loisirs_divertissement_id UUID;
BEGIN
  -- Récupérer les IDs des deux catégories
  SELECT id INTO loisirs_hobbies_id FROM categories WHERE slug = 'loisirs-hobbies' AND parent_id IS NULL LIMIT 1;
  SELECT id INTO loisirs_divertissement_id FROM categories WHERE slug = 'loisirs-divertissement' AND parent_id IS NULL LIMIT 1;

  -- Si les deux existent, fusionner
  IF loisirs_hobbies_id IS NOT NULL AND loisirs_divertissement_id IS NOT NULL THEN
    RAISE NOTICE 'Fusion des catégories loisirs...';
    
    -- 1. Mettre à jour toutes les sous-catégories de 'loisirs-divertissement' vers 'loisirs-hobbies'
    UPDATE categories 
    SET parent_id = loisirs_hobbies_id 
    WHERE parent_id = loisirs_divertissement_id;
    
    RAISE NOTICE 'Sous-catégories mises à jour';
    
    -- 2. Mettre à jour tous les listings qui utilisent 'loisirs-divertissement' comme category_id
    UPDATE listings 
    SET category_id = loisirs_hobbies_id 
    WHERE category_id = loisirs_divertissement_id;
    
    RAISE NOTICE 'Listings mis à jour';
    
    -- 3. Supprimer la catégorie 'loisirs-divertissement'
    DELETE FROM categories WHERE id = loisirs_divertissement_id;
    
    RAISE NOTICE 'Catégorie loisirs-divertissement supprimée';
    
  ELSIF loisirs_divertissement_id IS NOT NULL AND loisirs_hobbies_id IS NULL THEN
    -- Si seul 'loisirs-divertissement' existe, le renommer en 'loisirs-hobbies'
    UPDATE categories 
    SET slug = 'loisirs-hobbies',
        name_fr = 'Loisirs & Hobbies',
        name_en = 'Leisure & Hobbies',
        name_ar = 'ترفيه وهوايات'
    WHERE slug = 'loisirs-divertissement';
    
    RAISE NOTICE 'Catégorie loisirs-divertissement renommée en loisirs-hobbies';
    
  ELSE
    RAISE NOTICE 'Aucune fusion nécessaire - vérifier la structure des catégories';
  END IF;
  
END $$;

-- Vérification finale
DO $$
BEGIN
  RAISE NOTICE 'Vérification post-migration:';
  RAISE NOTICE '  - Catégorie loisirs-hobbies existe: %', 
    EXISTS(SELECT 1 FROM categories WHERE slug = 'loisirs-hobbies');
  RAISE NOTICE '  - Catégorie loisirs-divertissement existe: %', 
    EXISTS(SELECT 1 FROM categories WHERE slug = 'loisirs-divertissement');
END $$;
