import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://mmdlhqurzrqowpxijgcp.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tZGxocXVyenJxb3dweGlqZ2NwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyMzA4NzIsImV4cCI6MjA4OTgwNjg3Mn0.knQeNM6zmv-QBTHGuASm-WbZM7DO3l4rHugG1y7qQqs";

export const supabase = createClient(supabaseUrl, supabaseKey);