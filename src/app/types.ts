import { ZenWord } from '../data/zen'
import { PersonalityColor } from '../data/colors'
import { BeanResult } from '../data/beans'

export type MoodChoice = 'calm' | 'expectant' | 'nostalgic' | 'hopeful'

export interface Score {
  selectBean: number
  grind: number
  brew: number
  total: number
}

export interface ColorSystem {
  background: string
  zenColor: string
  personalityColor: PersonalityColor
  goldEdge: boolean
}

export interface Blessing {
  main: string
  sub: string
}

export interface GameState {
  step: number
  moodChoice: MoodChoice | null
  score: Score
  zen: ZenWord | null
  blessing: Blessing | null
  personalitySentence: string | null
  beanResult: BeanResult | null
  colorSystem: ColorSystem | null
  signatureImage: string | null
  serialNumber: string | null
  finalCardDataUrl: string | null
}

export type Action =
  | { type: 'RESET_ALL' }
  | { type: 'SET_STEP'; payload: number }
  | { type: 'SET_MOOD'; payload: MoodChoice }
  | { type: 'SET_SCORE_PART'; payload: { part: 'selectBean' | 'grind' | 'brew'; value: number } }
  | { type: 'FINALIZE_TOTAL_SCORE' }
  | { type: 'SET_ZEN'; payload: ZenWord }
  | { type: 'SET_BLESSING'; payload: Blessing }
  | { type: 'SET_PERSONALITY_SENTENCE'; payload: string }
  | { type: 'SET_BEAN_RESULT'; payload: BeanResult }
  | { type: 'SET_COLORS'; payload: ColorSystem }
  | { type: 'SET_SIGNATURE_IMAGE'; payload: string }
  | { type: 'SET_SERIAL_NUMBER'; payload: string }
  | { type: 'SET_FINAL_CARD'; payload: string }
