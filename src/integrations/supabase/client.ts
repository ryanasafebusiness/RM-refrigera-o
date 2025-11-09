// Temporary stub file - Supabase is no longer used
// This file exists only to prevent build errors while migrating components to the backend API
// TODO: Remove this file and all Supabase imports after migration is complete

export const supabase = {
  auth: {
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    getSession: async () => ({ data: { session: null } }),
    signOut: async () => {},
  },
  from: () => ({
    select: () => ({
      order: () => ({
        then: (callback: any) => callback({ data: [], error: null }),
      }),
    }),
    insert: () => ({
      then: (callback: any) => callback({ data: null, error: null }),
    }),
    update: () => ({
      eq: () => ({
        then: (callback: any) => callback({ data: null, error: null }),
      }),
    }),
    delete: () => ({
      eq: () => ({
        then: (callback: any) => callback({ data: null, error: null }),
      }),
    }),
  }),
};

export const handleSupabaseError = (error: any, context: string) => {
  console.warn(`[${context}] Supabase stub called - migration to backend API in progress`);
  return error;
};

