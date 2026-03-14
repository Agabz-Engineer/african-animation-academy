// Test script
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function test() {
  const { data, error } = await supabase
    .from("direct_messages")
    .select(`
      *,
      sender:profiles!direct_messages_sender_id_fkey(full_name, user_name, avatar_url),
      receiver:profiles!direct_messages_receiver_id_fkey(full_name, user_name, avatar_url)
    `)
    .limit(1);

  console.log("Data:", data);
  console.log("Error:", error);
}

test();
