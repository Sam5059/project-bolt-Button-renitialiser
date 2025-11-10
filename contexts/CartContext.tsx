import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';

type DeliveryMethod = 'hand_delivery' | 'shipping' | 'pickup' | 'other';

interface CartItem {
  id: string;
  listing_id: string;
  quantity: number;
  listing: {
    id: string;
    title: string;
    price: number;
    images: string[];
    user_id: string;
    listing_type: string;
    wilaya: string;
    category_id: string;
    delivery_methods?: DeliveryMethod[] | null;
    shipping_price?: number | null;
    other_delivery_info?: string | null;
  };
  deliverySelection?: {
    method: DeliveryMethod;
    selectionId: string;
  } | null;
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  cartTotal: number;
  deliveryTotal: number;
  grandTotal: number;
  loading: boolean;
  addToCart: (listingId: string, quantity?: number) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  selectDeliveryMethod: (cartItemId: string, method: DeliveryMethod) => Promise<void>;
  getDeliverySelection: (cartItemId: string) => DeliveryMethod | null;
  clearDeliverySelection: (cartItemId: string) => Promise<void>;
  hasUnselectedDeliveryMethods: () => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  
  const cartTotal = cartItems.reduce((sum, item) => {
    if (!item.listing || item.listing.price == null) return sum;
    return sum + (item.listing.price * item.quantity);
  }, 0);

  const deliveryTotal = cartItems.reduce((sum, item) => {
    if (!item.deliverySelection || item.deliverySelection.method !== 'shipping') return sum;
    if (!item.listing || item.listing.shipping_price == null) return sum;
    return sum + item.listing.shipping_price;
  }, 0);

  const grandTotal = cartTotal + deliveryTotal;

  const refreshCart = async () => {
    if (!user) {
      console.log('[CART v2] No user, clearing cart');
      setCartItems([]);
      return;
    }

    console.log('[CART v2] ===== REFRESHING CART =====');
    console.log('[CART v2] User ID:', user.id);
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          id,
          listing_id,
          quantity,
          listing:listings!cart_items_listing_id_fkey(
            id,
            title,
            price,
            images,
            user_id,
            listing_type,
            wilaya,
            category_id,
            delivery_methods,
            shipping_price,
            other_delivery_info
          )
        `)
        .eq('user_id', user.id)
        .order('added_at', { ascending: false});

      if (error) {
        console.error('[CART v2] Error fetching cart:', error);
        throw error;
      }
      console.log('[CART v2] ===== CART DATA LOADED =====');
      console.log('[CART v2] Items count:', data?.length || 0);
      
      const normalizedData = (data || [])
        .map((item: any) => ({
          ...item,
          listing: Array.isArray(item.listing) ? item.listing[0] : item.listing
        }))
        .filter((item: any) => item.listing !== null) as CartItem[];
      
      const { data: selections } = await supabase
        .from('cart_delivery_selections')
        .select('id, cart_item_id, selected_delivery_method')
        .eq('user_id', user.id);

      const selectionsMap = new Map(
        (selections || []).map((s: any) => [
          s.cart_item_id,
          { method: s.selected_delivery_method, selectionId: s.id }
        ])
      );

      const itemsWithSelections = normalizedData.map(item => ({
        ...item,
        deliverySelection: selectionsMap.get(item.id) || null
      }));

      for (const item of itemsWithSelections) {
        const methods = item.listing?.delivery_methods;
        if (methods && methods.length === 1 && !item.deliverySelection) {
          const singleMethod = methods[0];
          try {
            let { data: selection } = await supabase
              .from('cart_delivery_selections')
              .upsert({
                cart_item_id: item.id,
                user_id: user.id,
                selected_delivery_method: singleMethod
              }, {
                onConflict: 'cart_item_id'
              })
              .select()
              .single();

            if (!selection) {
              const { data: existingSelection } = await supabase
                .from('cart_delivery_selections')
                .select('id, selected_delivery_method')
                .eq('cart_item_id', item.id)
                .eq('user_id', user.id)
                .single();
              selection = existingSelection;
            }

            if (selection) {
              item.deliverySelection = {
                method: selection.selected_delivery_method,
                selectionId: selection.id
              };
            }
          } catch (error) {
            console.error('[CART v2] Error auto-selecting single delivery method:', error);
          }
        }
      }
      
      console.log('[CART v2] Valid items after filtering:', itemsWithSelections.length);
      setCartItems(itemsWithSelections);
    } catch (error) {
      console.error('[CART v2] Error fetching cart:', error);
    } finally {
      setLoading(false);
      console.log('[CART v2] Loading finished');
    }
  };

  const addToCart = async (listingId: string, quantity: number = 1) => {
    if (!user) {
      throw new Error('Must be logged in to add items to cart');
    }

    try {
      const existingItem = cartItems.find(item => item.listing_id === listingId);

      if (existingItem) {
        await updateQuantity(existingItem.id, existingItem.quantity + quantity);
      } else {
        const { error } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            listing_id: listingId,
            quantity
          });

        if (error) throw error;
        await refreshCart();
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', cartItemId);

      if (error) throw error;
      await refreshCart();
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    if (quantity < 1) {
      await removeFromCart(cartItemId);
      return;
    }

    // IMPORTANT: Bloquer la quantité à 1 pour tous les produits (articles uniques)
    const finalQuantity = 1;

    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: finalQuantity })
        .eq('id', cartItemId);

      if (error) throw error;
      await refreshCart();
    } catch (error) {
      console.error('Error updating quantity:', error);
      throw error;
    }
  };

  const clearCart = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
      setCartItems([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  };

  const selectDeliveryMethod = async (cartItemId: string, method: DeliveryMethod) => {
    if (!user) {
      throw new Error('Must be logged in to select delivery method');
    }

    try {
      let { data, error } = await supabase
        .from('cart_delivery_selections')
        .upsert({
          cart_item_id: cartItemId,
          user_id: user.id,
          selected_delivery_method: method
        }, {
          onConflict: 'cart_item_id'
        })
        .select()
        .single();

      if (error) throw error;

      if (!data) {
        const { data: existingSelection } = await supabase
          .from('cart_delivery_selections')
          .select('id, selected_delivery_method')
          .eq('cart_item_id', cartItemId)
          .eq('user_id', user.id)
          .single();
        data = existingSelection;
      }

      if (!data) {
        throw new Error('Failed to persist delivery selection');
      }

      setCartItems(prev => prev.map(item => 
        item.id === cartItemId
          ? {
              ...item,
              deliverySelection: {
                method: data.selected_delivery_method,
                selectionId: data.id
              }
            }
          : item
      ));
    } catch (error) {
      console.error('Error selecting delivery method:', error);
      throw error;
    }
  };

  const getDeliverySelection = (cartItemId: string): DeliveryMethod | null => {
    const item = cartItems.find(i => i.id === cartItemId);
    return item?.deliverySelection?.method || null;
  };

  const clearDeliverySelection = async (cartItemId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('cart_delivery_selections')
        .delete()
        .eq('cart_item_id', cartItemId)
        .eq('user_id', user.id);

      if (error) throw error;

      setCartItems(prev => prev.map(item =>
        item.id === cartItemId
          ? { ...item, deliverySelection: null }
          : item
      ));
    } catch (error) {
      console.error('Error clearing delivery selection:', error);
      throw error;
    }
  };

  const hasUnselectedDeliveryMethods = (): boolean => {
    return cartItems.some(item => {
      const methods = item.listing?.delivery_methods;
      if (!methods || methods.length === 0) return false;
      return !item.deliverySelection;
    });
  };

  useEffect(() => {
    refreshCart();
  }, [user]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartTotal,
        deliveryTotal,
        grandTotal,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        refreshCart,
        selectDeliveryMethod,
        getDeliverySelection,
        clearDeliverySelection,
        hasUnselectedDeliveryMethods,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
