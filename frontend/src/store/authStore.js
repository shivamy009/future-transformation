import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { adminCheckApi, loginApi, meApi, registerUserApi, signupApi } from '../lib/api'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      role: null,
      loading: false,
      hydrated: false,

      setHydrated: (hydrated) => set({ hydrated }),

      login: async (email, password) => {
        set({ loading: true })
        try {
          const loginData = await loginApi(email, password)
          const token = loginData.access_token
          const me = loginData.user || await meApi(token)

          set({
            token,
            user: me,
            role: me.role,
            loading: false,
          })

          return me
        } catch (error) {
          set({ loading: false })
          throw error
        }
      },

      signup: async (payload) => {
        set({ loading: true })
        try {
          const created = await signupApi(payload)
          set({ loading: false })
          return created
        } catch (error) {
          set({ loading: false })
          throw error
        }
      },

      loadCurrentUser: async () => {
        const { token } = get()
        if (!token) {
          return null
        }

        try {
          const me = await meApi(token)
          set({ user: me, role: me.role })
          return me
        } catch {
          set({ token: null, user: null, role: null })
          return null
        }
      },

      logout: () => set({ token: null, user: null, role: null }),

      createUser: async (payload) => {
        const { token } = get()
        if (!token) {
          throw new Error('You are not authenticated')
        }
        return registerUserApi(token, payload)
      },

      checkAdminAccess: async () => {
        const { token } = get()
        if (!token) {
          throw new Error('No access token found')
        }
        return adminCheckApi(token)
      },
    }),
    {
      name: 'ft-auth-store',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        role: state.role,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true)
      },
    },
  ),
)
