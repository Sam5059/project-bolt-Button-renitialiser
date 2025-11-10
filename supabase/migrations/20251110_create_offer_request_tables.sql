-- Create purchase_requests table
CREATE TABLE IF NOT EXISTS public.purchase_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    quantity integer NOT NULL CHECK (quantity > 0),
    unit_price numeric NOT NULL CHECK (unit_price >= 0),
    total_amount numeric NOT NULL CHECK (total_amount >= 0),
    delivery_address text NOT NULL,
    wilaya text NOT NULL,
    commune text NOT NULL,
    payment_method text NOT NULL CHECK (payment_method IN ('ccp', 'baridimob', 'bank_transfer', 'cash_on_delivery')),
    notes text,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed', 'cancelled')),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create free_item_requests table
CREATE TABLE IF NOT EXISTS public.free_item_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    pickup_date date NOT NULL,
    pickup_location text NOT NULL,
    wilaya text NOT NULL,
    commune text NOT NULL,
    notes text,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed', 'cancelled')),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create exchange_requests table
CREATE TABLE IF NOT EXISTS public.exchange_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    offered_item_description text NOT NULL,
    estimated_value numeric,
    meeting_location text NOT NULL,
    wilaya text NOT NULL,
    commune text NOT NULL,
    preferred_meeting_time text,
    notes text,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed', 'cancelled')),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_purchase_requests_user_id ON public.purchase_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_purchase_requests_listing_id ON public.purchase_requests(listing_id);
CREATE INDEX IF NOT EXISTS idx_purchase_requests_status ON public.purchase_requests(status);
CREATE INDEX IF NOT EXISTS idx_purchase_requests_created_at ON public.purchase_requests(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_free_item_requests_user_id ON public.free_item_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_free_item_requests_listing_id ON public.free_item_requests(listing_id);
CREATE INDEX IF NOT EXISTS idx_free_item_requests_status ON public.free_item_requests(status);
CREATE INDEX IF NOT EXISTS idx_free_item_requests_created_at ON public.free_item_requests(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_exchange_requests_user_id ON public.exchange_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_exchange_requests_listing_id ON public.exchange_requests(listing_id);
CREATE INDEX IF NOT EXISTS idx_exchange_requests_status ON public.exchange_requests(status);
CREATE INDEX IF NOT EXISTS idx_exchange_requests_created_at ON public.exchange_requests(created_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE public.purchase_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.free_item_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for purchase_requests
CREATE POLICY "Users can view their own purchase requests"
    ON public.purchase_requests FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view purchase requests for their listings"
    ON public.purchase_requests FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.listings
            WHERE listings.id = purchase_requests.listing_id
            AND listings.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create purchase requests"
    ON public.purchase_requests FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own purchase requests"
    ON public.purchase_requests FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Listing owners can update status of purchase requests"
    ON public.purchase_requests FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.listings
            WHERE listings.id = purchase_requests.listing_id
            AND listings.user_id = auth.uid()
        )
    );

-- RLS Policies for free_item_requests
CREATE POLICY "Users can view their own free item requests"
    ON public.free_item_requests FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view free item requests for their listings"
    ON public.free_item_requests FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.listings
            WHERE listings.id = free_item_requests.listing_id
            AND listings.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create free item requests"
    ON public.free_item_requests FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own free item requests"
    ON public.free_item_requests FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Listing owners can update status of free item requests"
    ON public.free_item_requests FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.listings
            WHERE listings.id = free_item_requests.listing_id
            AND listings.user_id = auth.uid()
        )
    );

-- RLS Policies for exchange_requests
CREATE POLICY "Users can view their own exchange requests"
    ON public.exchange_requests FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view exchange requests for their listings"
    ON public.exchange_requests FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.listings
            WHERE listings.id = exchange_requests.listing_id
            AND listings.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create exchange requests"
    ON public.exchange_requests FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own exchange requests"
    ON public.exchange_requests FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Listing owners can update status of exchange requests"
    ON public.exchange_requests FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.listings
            WHERE listings.id = exchange_requests.listing_id
            AND listings.user_id = auth.uid()
        )
    );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for auto-updating updated_at
CREATE TRIGGER update_purchase_requests_updated_at
    BEFORE UPDATE ON public.purchase_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_free_item_requests_updated_at
    BEFORE UPDATE ON public.free_item_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exchange_requests_updated_at
    BEFORE UPDATE ON public.exchange_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.purchase_requests TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.free_item_requests TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.exchange_requests TO authenticated;
