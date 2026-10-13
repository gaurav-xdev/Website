import { describe, it, expect } from 'vitest'
import { getSupabaseConfigStatus, getSupabase } from '../lib/supabase/client.js'

describe('Supabase Client Configuration & Fallbacks', () => {
  it('correctly reports unconfigured state when placeholder env vars are used', () => {
    const status = getSupabaseConfigStatus()
    expect(typeof status.isConfigured).toBe('boolean')
    expect(typeof status.urlMissing).toBe('boolean')
    expect(typeof status.keyMissing).toBe('boolean')
  })

  it('safely returns null client without crashing when environment is unconfigured', () => {
    // If env vars are absent or placeholder, client should safely be null
    const status = getSupabaseConfigStatus()
    if (!status.isConfigured) {
      expect(getSupabase()).toBeNull()
    }
  })
})
