import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jtslxtioczsfmtlovpuv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0c2x4dGlvY3pzZm10bG92cHV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkzOTQ0NTcsImV4cCI6MjEwNDk3MDQ1N30.Lv_WsqO7lZ3HQDbNfOWRqhce4KM_QVFeclFz874yL4s';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);