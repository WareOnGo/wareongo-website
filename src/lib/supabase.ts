import { createClient } from '@supabase/supabase-js';
import { supabase as integrationSupabase } from '@/integrations/supabase/client';

// We're using the already configured Supabase client from the integration
export const supabase = integrationSupabase;

// Define types for our database tables - keep these in sync with Supabase
export type FormSubmission = {
  id?: number;
  created_at?: string;
  name: string;
  email?: string | null;
  phone: string;
  source: string;
};

export type WarehouseRequest = {
  id?: number;
  created_at?: string;
  name: string;
  email?: string | null;
  phone: string;
  company: string;
  location: string;
  requirements?: string | null;
};

// SQL queries kept for reference
/*
-- Create form_submissions table
CREATE TABLE form_submissions (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('Asia/Kolkata'::text, now()),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50) NOT NULL,
  source VARCHAR(100) NOT NULL
);

-- Create warehouse_requests table
CREATE TABLE warehouse_requests (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('Asia/Kolkata'::text, now()),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50) NOT NULL,
  company VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  requirements TEXT
);
*/
