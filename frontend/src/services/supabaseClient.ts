import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rmboupnrtcspsnqldysv.supabase.co';
const supabaseKey = 'sb_publishable_gLe8BJQYUgOywe11HjRkQQ_iwPQOw2b';

export const supabase = createClient(supabaseUrl, supabaseKey);
