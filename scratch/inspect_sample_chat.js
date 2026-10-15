import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://alkyktnfhjtaxisykxfp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsa3lrdG5maGp0YXhpc3lreGZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYzNjk4NzMsImV4cCI6MjEwMTk0NTg3M30.sIHQoxZBrSWKfJfrAmGeq-3oka912yu-Q82qt00ZZgg';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function inspectSample() {
    const { data: chats } = await supabase.from('chats').select('*').limit(2);
    console.log('Sample chat row:', chats);

    const { data: msgs } = await supabase.from('messages').select('*').limit(2);
    console.log('Sample message row:', msgs);
}

inspectSample();
