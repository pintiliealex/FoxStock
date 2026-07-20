import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fxutpprhcnhqsdgwgmdh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4dXRwcHJoY25ocXNkZ3dnbWRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ1MzEyMjksImV4cCI6MjEwMDEwNzIyOX0.G9JkW4uxGAc5-r-4W1UZhkfDpE1uAGf0JZMJaEdzZJw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
