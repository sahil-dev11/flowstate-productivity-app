import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'

// Calculate streak from sorted array of date strings (YYYY-MM-DD)
export function calculateStreak(completedDates) {
  if (!completedDates || completedDates.length === 0) return 0

  const sorted = [...new Set(completedDates)].sort((a, b) => new Date(b) - new Date(a))
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let streak = 0
  let checkDate = new Date(today)

  for (const dateStr of sorted) {
    const d = new Date(dateStr)
    d.setHours(0, 0, 0, 0)
    const diffDays = Math.round((checkDate - d) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      streak++
      checkDate.setDate(checkDate.getDate() - 1)
    } else if (diffDays === 1) {
      streak++
      checkDate.setDate(checkDate.getDate() - 1)
    } else {
      break
    }
  }

  return streak
}

export const useHabitStore = create(
  persist(
    (set, get) => ({
      habits: [],
      habitLogs: [], // { habit_id, completed_on }[]
      loading: false,
      error: null,

      setError: (error) => set({ error }),

      fetchHabits: async (userId) => {
        set({ loading: true })
        const { data, error } = await supabase
          .from('habits')
          .select('*')
          .eq('user_id', userId)
          .eq('archived', false)
          .order('created_at', { ascending: true })
        if (!error) set({ habits: data || [] })
        set({ loading: false })
      },

      fetchHabitLogs: async (userId) => {
        // Fetch last 365 days of logs
        const from = new Date()
        from.setDate(from.getDate() - 365)
        const { data, error } = await supabase
          .from('habit_logs')
          .select('*')
          .eq('user_id', userId)
          .gte('completed_on', from.toISOString().split('T')[0])
        if (!error) set({ habitLogs: data || [] })
      },

      addHabit: async (userId, habitData) => {
        // Optimistic update
        const tempId = 'temp-' + Date.now()
        const tempHabit = { id: tempId, user_id: userId, archived: false, created_at: new Date().toISOString(), ...habitData }
        set((state) => ({ habits: [...state.habits, tempHabit] }))

        const { data, error } = await supabase
          .from('habits')
          .insert({ user_id: userId, ...habitData })
          .select()
          .single()

        if (error) {
          set((state) => ({ habits: state.habits.filter(h => h.id !== tempId), error: error.message }))
          return { error }
        }

        set((state) => ({
          habits: state.habits.map(h => h.id === tempId ? data : h)
        }))
        return { data }
      },

      toggleHabitLog: async (userId, habitId, dateStr) => {
        const { habitLogs } = get()
        const existing = habitLogs.find(l => l.habit_id === habitId && l.completed_on === dateStr)

        if (existing) {
          // Optimistic remove
          set((state) => ({ habitLogs: state.habitLogs.filter(l => !(l.habit_id === habitId && l.completed_on === dateStr)) }))
          const { error } = await supabase
            .from('habit_logs')
            .delete()
            .eq('habit_id', habitId)
            .eq('completed_on', dateStr)
          if (error) {
            set((state) => ({ habitLogs: [...state.habitLogs, existing], error: error.message }))
          }
        } else {
          const newLog = { id: 'temp-' + Date.now(), habit_id: habitId, user_id: userId, completed_on: dateStr }
          set((state) => ({ habitLogs: [...state.habitLogs, newLog] }))
          const { data, error } = await supabase
            .from('habit_logs')
            .insert({ habit_id: habitId, user_id: userId, completed_on: dateStr })
            .select()
            .single()
          if (error) {
            set((state) => ({ habitLogs: state.habitLogs.filter(l => l.id !== newLog.id), error: error.message }))
          } else {
            set((state) => ({ habitLogs: state.habitLogs.map(l => l.id === newLog.id ? data : l) }))
          }
        }
      },

      archiveHabit: async (habitId) => {
        set((state) => ({ habits: state.habits.filter(h => h.id !== habitId) }))
        const { error } = await supabase
          .from('habits')
          .update({ archived: true })
          .eq('id', habitId)
        if (error) set({ error: error.message })
      },

      getHabitStreak: (habitId) => {
        const { habitLogs } = get()
        const dates = habitLogs
          .filter(l => l.habit_id === habitId)
          .map(l => l.completed_on)
        return calculateStreak(dates)
      },

      isCompletedToday: (habitId) => {
        const today = new Date().toISOString().split('T')[0]
        const { habitLogs } = get()
        return habitLogs.some(l => l.habit_id === habitId && l.completed_on === today)
      },
    }),
    {
      name: 'habit-store',
      partialize: (state) => ({ habits: state.habits, habitLogs: state.habitLogs }),
    }
  )
)
