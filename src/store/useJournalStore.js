import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'

export const useJournalStore = create(
  persist(
    (set, get) => ({
      entries: [],
      loading: false,
      error: null,

      fetchEntries: async (userId) => {
        set({ loading: true })
        const { data, error } = await supabase
          .from('journal_entries')
          .select('*')
          .eq('user_id', userId)
          .order('entry_date', { ascending: false })
        if (!error) set({ entries: data || [] })
        set({ loading: false })
      },

      saveEntry: async (userId, entryData) => {
        // Upsert by entry_date
        const existing = get().entries.find(e => e.entry_date === entryData.entry_date)

        if (existing) {
          set((state) => ({
            entries: state.entries.map(e => e.entry_date === entryData.entry_date ? { ...e, ...entryData } : e)
          }))
        } else {
          set((state) => ({
            entries: [{ id: 'temp-' + Date.now(), user_id: userId, ...entryData }, ...state.entries]
          }))
        }

        const { data, error } = await supabase
          .from('journal_entries')
          .upsert({ user_id: userId, ...entryData }, { onConflict: 'user_id,entry_date' })
          .select()
          .single()

        if (error) {
          set({ error: error.message })
          return { error }
        }

        set((state) => ({
          entries: state.entries.map(e =>
            e.entry_date === entryData.entry_date ? data : e
          )
        }))
        return { data }
      },

      getEntryForDate: (dateStr) => {
        return get().entries.find(e => e.entry_date === dateStr) || null
      },

      getMoodHistory: (days = 30) => {
        const from = new Date()
        from.setDate(from.getDate() - days)
        return get().entries
          .filter(e => new Date(e.entry_date) >= from)
          .map(e => ({ date: e.entry_date, mood: e.mood }))
          .sort((a, b) => new Date(a.date) - new Date(b.date))
      },
    }),
    {
      name: 'journal-store',
      partialize: (state) => ({ entries: state.entries }),
    }
  )
)
