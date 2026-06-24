import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'

export const useTaskStore = create(
  persist(
    (set, get) => ({
      tasks: [],
      loading: false,
      error: null,

      setError: (error) => set({ error }),

      fetchTasks: async (userId, dateStr) => {
        set({ loading: true })
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', userId)
          .eq('scheduled_date', dateStr)
          .order('start_time', { ascending: true })
        if (!error) set({ tasks: data || [] })
        set({ loading: false })
      },

      fetchTasksRange: async (userId, fromDate, toDate) => {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', userId)
          .gte('scheduled_date', fromDate)
          .lte('scheduled_date', toDate)
        if (!error) set({ tasks: data || [] })
      },

      addTask: async (userId, taskData) => {
        const tempId = 'temp-' + Date.now()
        const tempTask = { id: tempId, user_id: userId, completed: false, created_at: new Date().toISOString(), ...taskData }
        set((state) => ({ tasks: [...state.tasks, tempTask] }))

        const { data, error } = await supabase
          .from('tasks')
          .insert({ user_id: userId, ...taskData })
          .select()
          .single()

        if (error) {
          set((state) => ({ tasks: state.tasks.filter(t => t.id !== tempId), error: error.message }))
          return { error }
        }

        set((state) => ({ tasks: state.tasks.map(t => t.id === tempId ? data : t) }))
        return { data }
      },

      toggleTask: async (taskId) => {
        const task = get().tasks.find(t => t.id === taskId)
        if (!task) return

        const newCompleted = !task.completed
        set((state) => ({
          tasks: state.tasks.map(t => t.id === taskId ? { ...t, completed: newCompleted } : t)
        }))

        const { error } = await supabase
          .from('tasks')
          .update({ completed: newCompleted })
          .eq('id', taskId)

        if (error) {
          set((state) => ({
            tasks: state.tasks.map(t => t.id === taskId ? { ...t, completed: !newCompleted } : t),
            error: error.message
          }))
        }
      },

      deleteTask: async (taskId) => {
        const task = get().tasks.find(t => t.id === taskId)
        set((state) => ({ tasks: state.tasks.filter(t => t.id !== taskId) }))
        const { error } = await supabase.from('tasks').delete().eq('id', taskId)
        if (error) {
          set((state) => ({ tasks: [...state.tasks, task], error: error.message }))
        }
      },

      getTasksForDate: (dateStr) => {
        return get().tasks.filter(t => t.scheduled_date === dateStr)
      },

      getTodayStats: (dateStr) => {
        const tasks = get().tasks.filter(t => t.scheduled_date === dateStr)
        return {
          total: tasks.length,
          completed: tasks.filter(t => t.completed).length,
        }
      },
    }),
    {
      name: 'task-store',
      partialize: (state) => ({ tasks: state.tasks }),
    }
  )
)
