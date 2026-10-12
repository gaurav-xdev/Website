// ─── OSMOO CINEMATIC AUDIO ENGINE (WEB AUDIO API) ────────────────────────────
// Opt-in, zero external audio asset dependency, zero network delay.
// Disabled by default to respect visitor preference and browser autoplay restrictions.

class SoundEngine {
  private ctx: AudioContext | null = null
  private enabled: boolean = false
  private listeners: Set<(enabled: boolean) => void> = new Set()

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('osmoo_sound_enabled')
        this.enabled = stored === 'true'
      } catch {
        this.enabled = false
      }
    }
  }

  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {})
    }
    return this.ctx
  }

  public isEnabled(): boolean {
    return this.enabled
  }

  public setEnabled(val: boolean) {
    this.enabled = val
    try {
      localStorage.setItem('osmoo_sound_enabled', String(val))
    } catch {
      // ignore storage access errors
    }
    if (val) {
      this.initContext()
      this.playToggle(true)
    } else {
      this.playToggle(false)
    }
    this.listeners.forEach((cb) => cb(this.enabled))
  }

  public toggle(): boolean {
    this.setEnabled(!this.enabled)
    return this.enabled
  }

  public subscribe(cb: (enabled: boolean) => void): () => void {
    this.listeners.add(cb)
    return () => {
      this.listeners.delete(cb)
    }
  }

  /**
   * Subtle interface click / button tap
   */
  public playClick() {
    if (!this.enabled) return
    const ctx = this.initContext()
    if (!ctx) return

    try {
      const now = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const filter = ctx.createBiquadFilter()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(800, now)
      osc.frequency.exponentialRampToValueAtTime(260, now + 0.04)

      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(1400, now)

      gain.gain.setValueAtTime(0.04, now)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045)

      osc.connect(filter)
      filter.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.05)
    } catch {
      // Audio execution gracefully bypassed
    }
  }

  /**
   * Sound toggle feedback chime
   */
  public playToggle(on: boolean) {
    if (!this.enabled && on) return
    const ctx = this.initContext()
    if (!ctx) return

    try {
      const now = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      if (on) {
        osc.frequency.setValueAtTime(520, now)
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.08)
      } else {
        osc.frequency.setValueAtTime(660, now)
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.08)
      }

      gain.gain.setValueAtTime(0.05, now)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.13)
    } catch {
      // Graceful error bypass
    }
  }

  /**
   * Plan-specific companion acoustic response
   */
  public playPlanReaction(plan: 'free' | 'pro' | 'max' | 'enterprise') {
    if (!this.enabled) return
    const ctx = this.initContext()
    if (!ctx) return

    try {
      const now = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const filter = ctx.createBiquadFilter()

      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(2200, now)

      if (plan === 'free') {
        // Subtle melancholic gentle tone
        osc.type = 'sine'
        osc.frequency.setValueAtTime(370, now)
        osc.frequency.exponentialRampToValueAtTime(293.66, now + 0.18) // D4
        gain.gain.setValueAtTime(0.035, now)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22)
      } else if (plan === 'pro') {
        // Warm positive major fifth
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(440, now) // A4
        osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.14) // E5
        gain.gain.setValueAtTime(0.045, now)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.20)
      } else if (plan === 'max') {
        // Radiant crystalline octave gleam
        osc.type = 'sine'
        osc.frequency.setValueAtTime(554.37, now) // C#5
        osc.frequency.exponentialRampToValueAtTime(1108.73, now + 0.16) // C#6
        gain.gain.setValueAtTime(0.05, now)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.24)
      } else if (plan === 'enterprise') {
        // Joyful cosmic flight resonance
        osc.type = 'sine'
        osc.frequency.setValueAtTime(440, now)
        osc.frequency.linearRampToValueAtTime(880, now + 0.12)
        osc.frequency.linearRampToValueAtTime(1320, now + 0.25)
        gain.gain.setValueAtTime(0.04, now)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32)
      }

      osc.connect(filter)
      filter.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.35)
    } catch {
      // Graceful error bypass
    }
  }

  /**
   * Action confirmation / success chime
   */
  public playSuccess() {
    if (!this.enabled) return
    const ctx = this.initContext()
    if (!ctx) return

    try {
      const now = ctx.currentTime
      const notes = [523.25, 659.25, 783.99] // C5, E5, G5 major triad

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        const noteStart = now + idx * 0.05

        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, noteStart)

        gain.gain.setValueAtTime(0.035, noteStart)
        gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.22)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(noteStart)
        osc.stop(noteStart + 0.24)
      })
    } catch {
      // Graceful error bypass
    }
  }
}

export const soundEngine = new SoundEngine()
