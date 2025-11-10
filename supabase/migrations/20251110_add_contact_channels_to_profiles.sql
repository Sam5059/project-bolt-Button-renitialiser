-- Migration: Add optional contact channels to profiles
-- Date: 2025-11-10
-- Description: Add WhatsApp number and Messenger username fields for multi-channel seller contact

-- Add WhatsApp number column (optional, can be different from phone_number)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS whatsapp_number text;

-- Add Messenger username column (optional, for Facebook Messenger integration)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS messenger_username text;

-- Add comments to document the new columns
COMMENT ON COLUMN profiles.whatsapp_number IS 'Optional WhatsApp phone number (international format +213XXXXXXXXX) for direct messaging. Can differ from phone_number.';
COMMENT ON COLUMN profiles.messenger_username IS 'Optional Facebook Messenger username or ID for direct messaging (m.me/{username}).';
