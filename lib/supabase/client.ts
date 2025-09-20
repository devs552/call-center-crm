interface MockSupabaseClient {
  auth: {
    signInWithPassword: (credentials: { email: string; password: string }) => Promise<any>
    signUp: (credentials: { email: string; password: string; options?: any }) => Promise<any>
    signOut: () => Promise<any>
    getUser: () => Promise<any>
  }
  from: (table: string) => any
}

export function createClient(): MockSupabaseClient {
  return {
    auth: {
      signInWithPassword: async ({ email, password }) => {
        // Mock authentication - redirect to actual auth system
        const { signInWithPassword } = await import("@/lib/auth")
        return signInWithPassword(email, password)
      },
      signUp: async ({ email, password }) => {
        return { data: null, error: new Error("Sign up not implemented in demo") }
      },
      signOut: async () => {
        const { signOut } = await import("@/lib/auth")
        signOut()
        return { error: null }
      },
      getUser: async () => {
        const { getCurrentUser } = await import("@/lib/auth")
        const current = getCurrentUser()
        return { data: { user: current?.user || null }, error: null }
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
