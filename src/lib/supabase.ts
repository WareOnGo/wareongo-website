
import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and anon key from environment variables
// These will be available after connecting to Supabase from Lovable
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Define types for our database tables
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

// SQL queries for creating tables (to be run in Supabase SQL editor)
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
