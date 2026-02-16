import { Bean, BeanType } from '../data/beans'

export interface SelectBeansScoreResult {
  score: number
  correct: number
  missed: number
  wrong: number
}

/**
 * Calculate score for bean selection game
 * - correct: problem beans removed
 * - missed: problem beans left
 * - wrong: good beans removed
 *
 * Scoring: correct*5 - missed*5 - wrong*3
 * Bonus: +5 if all 4 problem beans removed and no wrong removals
 * Range: 0-25
 */
export function calculateSelectBeansScore(
  initialBeans: Bean[],
  removedBeans: Bean[],
  remainingBeans: Bean[]
): SelectBeansScoreResult {
  const problemTypes: BeanType[] = ['green', 'broken', 'worm']

  // Count initial problem beans
  const initialProblemCount = initialBeans.filter(b => problemTypes.includes(b.type)).length

  // Count removed beans by type
  const removedProblem = removedBeans.filter(b => problemTypes.includes(b.type)).length
  const removedGood = removedBeans.filter(b => b.type === 'good').length

  // Count remaining problem beans (missed)
  const remainingProblem = remainingBeans.filter(b => problemTypes.includes(b.type)).length

  const correct = removedProblem
  const missed = remainingProblem
  const wrong = removedGood

  // Base score
  let score = correct * 5 - missed * 5 - wrong * 3

  // Bonus: perfect clear
  if (correct === initialProblemCount && wrong === 0) {
    score += 5
  }

  // Clamp to 0-25
  score = Math.max(0, Math.min(25, score))

  return {
    score,
    correct,
    missed,
    wrong
  }
}
