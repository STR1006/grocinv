import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://uzpwzmwbdvvdclailvce.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6cHd6bXdiZHZ2ZGNsYWlsdmNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1MzQ1NTEsImV4cCI6MjA3MDExMDU1MX0.1sBwx7mTkIhVJ1ccfR_-wN1PALi5gC2HEnpLWqPyEOE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
