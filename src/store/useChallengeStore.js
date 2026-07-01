import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Given a challenge start_date string, compute what "day number" today is
 * (1-indexed). Returns 0 if not started yet, 22+ if beyond 21 days.
 */
export function getCurrentDay(startDate) {
  if (!startDate) return 0
  const start = new Date(startDate)
  start.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = Math.floor((today - start) / (1000 * 60 * 60 * 24))
  return diff + 1  // day 1 = start date
}

/**
 * Given completed day numbers (array of ints), compute the current streak.
 */
export function computeStreak(completedDays) {
  if (!completedDays || completedDays.length === 0) return 0
  const sorted = [...new Set(completedDays)].sort((a, b) => b - a)
  let streak = 0
  let expected = sorted[0]
  for (const d of sorted) {
    if (d === expected) {
      streak++
      expected--
    } else break
  }
  return streak
}

/**
 * Add N days to a date string, return YYYY-MM-DD.
 */
function addDays(dateStr, n) {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}

function genId() {
  return 'ch-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7)
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useChallengeStore = create(
  persist(
    (set, get) => ({
      challenges: [],  // { id, name, description, icon, start_date, end_date, status, created_at }
      days: [],        // { id, challenge_id, day_number, completed_on }

      // ── Read ──────────────────────────────────────────────────────────────

      getChallengeById: (id) => get().challenges.find(c => c.id === id),

      getCompletedDays: (challengeId) =>
        get().days.filter(d => d.challenge_id === challengeId).map(d => d.day_number),

      getStats: () => {
        const { challenges, days } = get()
        const active    = challenges.filter(c => c.status === 'active').length
        const completed = challenges.filter(c => c.status === 'completed').length

        let longestStreak = 0
        let totalPossible = 0
        let totalDone = 0

        for (const c of challenges) {
          if (c.status === 'archived') continue
          const done = days.filter(d => d.challenge_id === c.id).map(d => d.day_number)
          const streak = computeStreak(done)
          if (streak > longestStreak) longestStreak = streak
          totalPossible += 21
          totalDone += done.length
        }

        const overallPct = totalPossible > 0 ? Math.round((totalDone / totalPossible) * 100) : 0
        return { active, completed, longestStreak, overallPct, totalDone, totalPossible }
      },

      // ── Write ─────────────────────────────────────────────────────────────

      addChallenge: (data) => {
        const id = genId()
        const start_date = data.start_date || new Date().toISOString().split('T')[0]
        const end_date   = addDays(start_date, 20)   // day 1 + 20 more = 21 days total
        const challenge  = {
          id,
          name:        data.name,
          description: data.description || '',
          icon:        data.icon || '🏆',
          start_date,
          end_date,
          status:      'active',
          created_at:  new Date().toISOString(),
        }
        set(s => ({ challenges: [...s.challenges, challenge] }))
        return challenge
      },

      updateChallenge: (id, updates) => {
        set(s => ({
          challenges: s.challenges.map(c => c.id === id ? { ...c, ...updates } : c)
        }))
      },

      deleteChallenge: (id) => {
        set(s => ({
          challenges: s.challenges.filter(c => c.id !== id),
          days:       s.days.filter(d => d.challenge_id !== id),
        }))
      },

      archiveChallenge: (id) => {
        set(s => ({
          challenges: s.challenges.map(c => c.id === id ? { ...c, status: 'archived' } : c)
        }))
      },

      restartChallenge: (id) => {
        const start_date = new Date().toISOString().split('T')[0]
        const end_date   = addDays(start_date, 20)
        set(s => ({
          challenges: s.challenges.map(c =>
            c.id === id ? { ...c, start_date, end_date, status: 'active', completed_at: null } : c
          ),
          days: s.days.filter(d => d.challenge_id !== id),
        }))
      },

      toggleDay: (challengeId, dayNumber) => {
        const { days, challenges } = get()
        const existing = days.find(d => d.challenge_id === challengeId && d.day_number === dayNumber)

        let newDays
        if (existing) {
          newDays = days.filter(d => !(d.challenge_id === challengeId && d.day_number === dayNumber))
        } else {
          newDays = [
            ...days,
            { id: genId(), challenge_id: challengeId, day_number: dayNumber, completed_on: new Date().toISOString().split('T')[0] }
          ]
        }

        // Check if all 21 days are now complete
        const completedForChallenge = newDays.filter(d => d.challenge_id === challengeId).length
        let newChallenges = challenges
        if (completedForChallenge === 21) {
          newChallenges = challenges.map(c =>
            c.id === challengeId
              ? { ...c, status: 'completed', completed_at: new Date().toISOString() }
              : c
          )
        } else {
          // Revert to active if a day was un-checked
          newChallenges = challenges.map(c =>
            c.id === challengeId && c.status === 'completed'
              ? { ...c, status: 'active', completed_at: null }
              : c
          )
        }

        set({ days: newDays, challenges: newChallenges })
        return completedForChallenge === 21 && !existing  // returns true if just completed
      },
    }),
    {
      name: 'challenge-store-v1',
      partialize: (state) => ({ challenges: state.challenges, days: state.days }),
    }
  )
)
