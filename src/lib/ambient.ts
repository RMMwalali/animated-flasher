'use client'
/**
 * Ambient sound for the site. Plays the owner's uploaded loop if there is
 * one, otherwise a gentle surf generated with Web Audio (filtered noise with
 * a slow swell), so no audio file is needed. Nothing plays until a visitor
 * chooses sound; the choice is remembered for the session.
 */
const KEY = 'ngina-sound'
type Listener = (on: boolean) => void

let ctx: AudioContext | null = null
let master: GainNode | null = null
let el: HTMLAudioElement | null = null
let src: string | undefined
let on = false
const listeners = new Set<Listener>()

function emit() {
  listeners.forEach((l) => l(on))
}

function surf(ac: AudioContext, out: AudioNode) {
  // brown noise: deep, wave-like rumble
  const len = ac.sampleRate * 4
  const buf = ac.createBuffer(2, len, ac.sampleRate)
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c)
    let last = 0
    for (let i = 0; i < len; i++) {
      last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02
      d[i] = last * 3.2
    }
  }
  const noise = ac.createBufferSource()
  noise.buffer = buf
  noise.loop = true
  const lp = ac.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 700
  // the swell: gain rises and falls like waves arriving (~9 s)
  const swell = ac.createGain()
  swell.gain.value = 0.55
  const lfo = ac.createOscillator()
  lfo.frequency.value = 0.11
  const lfoGain = ac.createGain()
  lfoGain.gain.value = 0.4
  lfo.connect(lfoGain).connect(swell.gain)
  // filter opens as each wave breaks
  const lfo2Gain = ac.createGain()
  lfo2Gain.gain.value = 450
  lfo.connect(lfo2Gain).connect(lp.frequency)
  noise.connect(lp).connect(swell).connect(out)
  noise.start()
  lfo.start()
}

function fadeTo(value: number, seconds: number) {
  if (master && ctx) {
    const t = ctx.currentTime
    master.gain.cancelScheduledValues(t)
    master.gain.setValueAtTime(master.gain.value, t)
    master.gain.linearRampToValueAtTime(value, t + seconds)
  }
  if (el) {
    const start = el.volume
    const t0 = performance.now()
    const step = () => {
      const k = Math.min(1, (performance.now() - t0) / (seconds * 1000))
      if (el) el.volume = start + (value - start) * k
      if (k < 1) requestAnimationFrame(step)
      else if (value === 0) el?.pause()
    }
    requestAnimationFrame(step)
  }
}

export const ambient = {
  /** Owner-uploaded loop (optional). Call before start(). */
  setSource(url?: string | null) {
    src = url || undefined
  },
  /** Must be called from a user gesture (click / key). */
  async start() {
    on = true
    try {
      sessionStorage.setItem(KEY, 'on')
    } catch {}
    if (src) {
      el ??= Object.assign(new Audio(src), { loop: true, volume: 0, preload: 'auto' })
      await el.play().catch(() => undefined)
      fadeTo(0.5, 2)
    } else {
      if (!ctx) {
        const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        if (!AC) return
        ctx = new AC()
        master = ctx.createGain()
        master.gain.value = 0
        master.connect(ctx.destination)
        surf(ctx, master)
      }
      await ctx.resume()
      fadeTo(0.22, 2.5)
    }
    emit()
  },
  stop() {
    on = false
    try {
      sessionStorage.setItem(KEY, 'off')
    } catch {}
    fadeTo(0, 0.8)
    emit()
  },
  toggle() {
    return on ? this.stop() : this.start()
  },
  isOn: () => on,
  /** Visitor chose sound earlier this session (still needs a gesture to resume). */
  wanted: () => {
    try {
      return sessionStorage.getItem(KEY) === 'on'
    } catch {
      return false
    }
  },
  subscribe(l: Listener): () => void {
    listeners.add(l)
    return () => {
      listeners.delete(l)
    }
  },
}
