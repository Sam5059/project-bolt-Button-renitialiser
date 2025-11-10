/*
  MIGRATION: Ajout des options de livraison aux listings
  Date: 2025-11-10
  Description: Permet aux vendeurs de configurer les méthodes de livraison
               disponibles pour leurs annonces (remise en main propre, livraison, etc.)
*/

-- Ajouter les colonnes de livraison à la table listings
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS delivery_methods TEXT[] DEFAULT ARRAY['hand_delivery'],
ADD COLUMN IF NOT EXISTS shipping_price DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS other_delivery_info TEXT;

-- Ajouter un commentaire pour expliquer les colonnes
COMMENT ON COLUMN listings.delivery_methods IS 'Méthodes de livraison disponibles: hand_delivery, shipping, pickup, other';
COMMENT ON COLUMN listings.shipping_price IS 'Prix de la livraison si applicable (optionnel)';
COMMENT ON COLUMN listings.other_delivery_info IS 'Informations supplémentaires sur les méthodes de livraison personnalisées';

-- Créer une table pour stocker les sélections de livraison dans le panier
CREATE TABLE IF NOT EXISTS cart_delivery_selections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_item_id UUID REFERENCES cart_items(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  selected_delivery_method TEXT NOT NULL,
  delivery_address TEXT,
  delivery_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  
  -- Un seul choix de livraison par article de panier
  UNIQUE(cart_item_id)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_cart_delivery_selections_cart_item 
ON cart_delivery_selections(cart_item_id);

CREATE INDEX IF NOT EXISTS idx_cart_delivery_selections_user 
ON cart_delivery_selections(user_id);

-- RLS Policies pour cart_delivery_selections
ALTER TABLE cart_delivery_selections ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs peuvent voir leurs propres sélections de livraison (vérification via cart_items)
CREATE POLICY "Users can view their own delivery selections"
ON cart_delivery_selections
FOR SELECT
USING (
  auth.uid() = user_id 
  AND EXISTS (
    SELECT 1 FROM cart_items 
    WHERE cart_items.id = cart_delivery_selections.cart_item_id 
    AND cart_items.user_id = auth.uid()
  )
);

-- Les utilisateurs peuvent insérer leurs propres sélections de livraison (vérification via cart_items)
CREATE POLICY "Users can insert their own delivery selections"
ON cart_delivery_selections
FOR INSERT
WITH CHECK (
  auth.uid() = user_id 
  AND EXISTS (
    SELECT 1 FROM cart_items 
    WHERE cart_items.id = cart_item_id 
    AND cart_items.user_id = auth.uid()
  )
);

-- Les utilisateurs peuvent mettre à jour leurs propres sélections de livraison (vérification via cart_items)
CREATE POLICY "Users can update their own delivery selections"
ON cart_delivery_selections
FOR UPDATE
USING (
  auth.uid() = user_id 
  AND EXISTS (
    SELECT 1 FROM cart_items 
    WHERE cart_items.id = cart_delivery_selections.cart_item_id 
    AND cart_items.user_id = auth.uid()
  )
);

-- Les utilisateurs peuvent supprimer leurs propres sélections de livraison (vérification via cart_items)
CREATE POLICY "Users can delete their own delivery selections"
ON cart_delivery_selections
FOR DELETE
USING (
  auth.uid() = user_id 
  AND EXISTS (
    SELECT 1 FROM cart_items 
    WHERE cart_items.id = cart_delivery_selections.cart_item_id 
    AND cart_items.user_id = auth.uid()
  )
);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_cart_delivery_selections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_cart_delivery_selections_updated_at_trigger
BEFORE UPDATE ON cart_delivery_selections
FOR EACH ROW
EXECUTE FUNCTION update_cart_delivery_selections_updated_at();
