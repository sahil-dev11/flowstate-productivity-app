import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'

export const useGoalStore = create(
  persist(
    (set, get) => ({
      goals: [],
      loading: false,
      error: null,

      fetchGoals: async (userId) => {
        set({ loading: true })
        const { data, error } = await supabase
          .from('goals')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
        if (!error) set({ goals: data || [] })
        set({ loading: false })
      },

      addGoal: async (userId, goalData) => {
        const tempId = 'temp-' + Date.now()
        const tempGoal = { id: tempId, user_id: userId, completed: false, current_value: 0, created_at: new Date().toISOString(), ...goalData }
        set((state) => ({ goals: [...state.goals, tempGoal] }))

        const { data, error } = await supabase
          .from('goals')
          .insert({ user_id: userId, ...goalData })
          .select()
          .single()

        if (error) {
          set((state) => ({ goals: state.goals.filter(g => g.id !== tempId), error: error.message }))
          return { error }
        }

        set((state) => ({ goals: state.goals.map(g => g.id === tempId ? data : g) }))
        return { data }
      },

      incrementGoal: async (goalId, amount = 1) => {
        const goal = get().goals.find(g => g.id === goalId)
        if (!goal) return

        const newValue = Math.min(goal.current_value + amount, goal.target_value)
        const isCompleted = newValue >= goal.target_value

        set((state) => ({
          goals: state.goals.map(g => g.id === goalId
            ? { ...g, current_value: newValue, completed: isCompleted }
            : g)
        }))

        const { error } = await supabase
          .from('goals')
          .update({ current_value: newValue, completed: isCompleted })
          .eq('id', goalId)

        if (error) {
          set((state) => ({
            goals: state.goals.map(g => g.id === goalId ? goal : g),
            error: error.message
          }))
        }
      },

      deleteGoal: async (goalId) => {
        const goal = get().goals.find(g => g.id === goalId)
        set((state) => ({ goals: state.goals.filter(g => g.id !== goalId) }))
        const { error } = await supabase.from('goals').delete().eq('id', goalId)
        if (error) {
          set((state) => ({ goals: [...state.goals, goal], error: error.message }))
        }
      },

      getActiveGoals: () => get().goals.filter(g => !g.completed),
      getCompletedGoals: () => get().goals.filter(g => g.completed),
    }),
    {
      name: 'goal-store',
      partialize: (state) => ({ goals: state.goals }),
    }
  )
)
