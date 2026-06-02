-- Extend entitlement statuses to model failed payments and disputes
ALTER TYPE public.entitlement_status ADD VALUE IF NOT EXISTS 'failed';
ALTER TYPE public.entitlement_status ADD VALUE IF NOT EXISTS 'disputed';