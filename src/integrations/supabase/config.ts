// Configuration for Supabase
export const supabaseConfig = {
  // These should be set in your .env file
  url: import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co',
  anonKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'your-anon-key',
  
  // Debug mode
  debug: import.meta.env.DEV || false,
};

// Helper function to check if Supabase is configured
export const isSupabaseConfigured = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  
  return !!(url && key && url !== 'your_supabase_project_url' && key !== 'your_supabase_anon_key');
};

// Helper function to log Supabase configuration status
export const logSupabaseConfig = () => {
  console.log('Supabase Configuration:');
  console.log('URL:', import.meta.env.VITE_SUPABASE_URL ? 'Set' : 'Not set');
  console.log('Key:', import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ? 'Set' : 'Not set');
  console.log('Configured:', isSupabaseConfigured());
};
