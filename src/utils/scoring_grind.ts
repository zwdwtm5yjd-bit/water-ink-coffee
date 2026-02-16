export interface GrindSample {
  timestamp: number
  rps: number // rotations per second
}

/**
 * Calculate grind score based on speed samples
 * Ideal range: 1.2 - 1.6 RPS
 * Score: ratio of time in ideal range * 30 (max 30)
 */
export function calculateGrindScore(samples: GrindSample[], duration: number): number {
  if (samples.length === 0) return 0

  let idealTime = 0
  const idealMin = 1.2
  const idealMax = 1.6

  for (let i = 1; i < samples.length; i++) {
    const rps = samples[i].rps
    if (rps >= idealMin && rps <= idealMax) {
      const timeDelta = samples[i].timestamp - samples[i - 1].timestamp
      idealTime += timeDelta
    }
  }

  const idealTimeRatio = idealTime / duration
  const score = Math.floor(idealTimeRatio * 30)

  return Math.max(0, Math.min(30, score))
}

/**
 * Get feedback message based on current speed
 */
export function getGrindFeedback(rps: number): string {
  if (rps < 0.8) return '轻轻转...'
  if (rps < 1.0) return '再快一点点'
  if (rps < 1.2) return '节奏不错'
  if (rps <= 1.6) return '颗粒均匀'
  if (rps <= 2.0) return '转速略急'
  return '慢一点，香更久'
}

/**
 * Calculate RPS from rotation delta
 */
export function calculateRps(rotationDelta: number, timeDelta: number): number {
  if (timeDelta === 0) return 0
  // rotationDelta is in radians, convert to rotations per second
  const rotations = rotationDelta / (2 * Math.PI)
  return Math.abs(rotations / (timeDelta / 1000))
}
