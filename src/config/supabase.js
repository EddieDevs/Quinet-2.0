import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://alkyktnfhjtaxisykxfp.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsa3lrdG5maGp0YXhpc3lreGZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYzNjk4NzMsImV4cCI6MjEwMTk0NTg3M30.sIHQoxZBrSWKfJfrAmGeq-3oka912yu-Q82qt00ZZgg';

export const ADMIN_UID = 'f088bf2c-c96a-45f5-a300-c5f0fb7e1a7b';
export const ADMIN_WHATSAPP = '584228328706';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
