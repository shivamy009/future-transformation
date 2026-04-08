import { create } from 'zustand'

import {
  adminUpdateTaskApi,
  analyticsApi,
  createTaskApi,
  listTasksApi,
  listUsersApi,
  searchApi,
  updateTaskStatusApi,
  uploadDocumentApi,
} from '../lib/api'

export const useAppStore = create((set, get) => ({
  tasks: [],
  tasksMeta: { page: 1, page_size: 10, total: 0 },
  tasksLoading: false,
  searchLoading: false,
  uploadLoading: false,
  analyticsLoading: false,
  usersLoading: false,
  latestSearch: null,
  analytics: null,
  users: [],

  fetchTasks: async (token, filters = {}) => {
    set({ tasksLoading: true })
    try {
      const data = await listTasksApi(token, filters)
      set({ tasks: data.items, tasksMeta: data, tasksLoading: false })
      return data
    } catch (error) {
      set({ tasksLoading: false })
      throw error
    }
  },

  createTask: async (token, payload) => {
    const created = await createTaskApi(token, payload)
    return created
  },

  updateTaskStatus: async (token, taskId, status) => {
    const updated = await updateTaskStatusApi(token, taskId, status)
    set((state) => ({
      tasks: state.tasks.map((task) => (task.id === updated.id ? updated : task)),
    }))
    return updated
  },

  adminUpdateTask: async (token, taskId, payload) => {
    const updated = await adminUpdateTaskApi(token, taskId, payload)
    set((state) => ({
      tasks: state.tasks.map((task) => (task.id === updated.id ? updated : task)),
    }))
    return updated
  },

  uploadDocument: async (token, payload) => {
    set({ uploadLoading: true })
    try {
      const data = await uploadDocumentApi(token, payload)
      set({ uploadLoading: false })
      return data
    } catch (error) {
      set({ uploadLoading: false })
      throw error
    }
  },

  runSearch: async (token, payload) => {
    set({ searchLoading: true })
    try {
      const data = await searchApi(token, payload)
      set({ latestSearch: data, searchLoading: false })
      return data
    } catch (error) {
      set({ searchLoading: false })
      throw error
    }
  },

  fetchAnalytics: async (token) => {
    set({ analyticsLoading: true })
    try {
      const data = await analyticsApi(token)
      set({ analytics: data, analyticsLoading: false })
      return data
    } catch (error) {
      set({ analyticsLoading: false })
      throw error
    }
  },

  fetchUsers: async (token) => {
    set({ usersLoading: true })
    try {
      const data = await listUsersApi(token)
      set({ users: data, usersLoading: false })
      return data
    } catch (error) {
      set({ usersLoading: false })
      throw error
    }
  },

  resetAppState: () =>
    set({
      tasks: [],
      tasksMeta: { page: 1, page_size: 10, total: 0 },
      latestSearch: null,
      analytics: null,
      users: [],
    }),
}))
