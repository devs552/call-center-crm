interface MockSupabaseClient {
  auth: {
    getUser: () => Promise<any>
  }
  from: (table: string) => any
}

export function createClient(): MockSupabaseClient {
  return {
    auth: {
      getUser: async () => {
        return { data: { user: null }, error: null }
      },
    },
    from: (table: string) => ({
      select: () => ({ data: [], error: null }),
      insert: () => ({ data: null, error: null }),
      update: () => ({ data: null, error: null }),
      delete: () => ({ data: null, error: null }),
      eq: () => ({ data: [], error: null }),
      order: () => ({ data: [], error: null }),
    }),
  }
}
