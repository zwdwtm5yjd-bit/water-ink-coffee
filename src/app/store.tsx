import { createContext, useContext, useReducer, ReactNode, Dispatch } from 'react'
import { GameState, Action, MoodChoice } from './types'

const initialState: GameState = {
  step: 1,
  moodChoice: null,
  score: {
    selectBean: 0,
    grind: 0,
    brew: 0,
    total: 0
  },
  zen: null,
  blessing: null,
  personalitySentence: null,
  beanResult: null,
  colorSystem: null,
  signatureImage: null,
  serialNumber: null,
  finalCardDataUrl: null
}

function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'RESET_ALL':
      return { ...initialState, step: 1 }

    case 'SET_STEP':
      return { ...state, step: action.payload }

    case 'SET_MOOD':
      return { ...state, moodChoice: action.payload }

    case 'SET_SCORE_PART':
      return {
        ...state,
        score: {
          ...state.score,
          [action.payload.part]: action.payload.value
        }
      }

    case 'FINALIZE_TOTAL_SCORE':
      const total = state.score.selectBean + state.score.grind + state.score.brew
      return {
        ...state,
        score: {
          ...state.score,
          total: Math.min(total, 100)
        }
      }

    case 'SET_ZEN':
      return { ...state, zen: action.payload }

    case 'SET_BLESSING':
      return { ...state, blessing: action.payload }

    case 'SET_PERSONALITY_SENTENCE':
      return { ...state, personalitySentence: action.payload }

    case 'SET_BEAN_RESULT':
      return { ...state, beanResult: action.payload }

    case 'SET_COLORS':
      return { ...state, colorSystem: action.payload }

    case 'SET_SIGNATURE_IMAGE':
      return { ...state, signatureImage: action.payload }

    case 'SET_SERIAL_NUMBER':
      return { ...state, serialNumber: action.payload }

    case 'SET_FINAL_CARD':
      return { ...state, finalCardDataUrl: action.payload }

    default:
      return state
  }
}

const GameContext = createContext<{
  state: GameState
  dispatch: Dispatch<Action>
} | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState)

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}

// Helper action creators
export const gameActions = {
  resetAll: (): Action => ({ type: 'RESET_ALL' }),
  setStep: (step: number): Action => ({ type: 'SET_STEP', payload: step }),
  setMood: (choice: MoodChoice): Action => ({ type: 'SET_MOOD', payload: choice }),
  setScorePart: (part: 'selectBean' | 'grind' | 'brew', value: number): Action => ({
    type: 'SET_SCORE_PART',
    payload: { part, value }
  }),
  finalizeTotalScore: (): Action => ({ type: 'FINALIZE_TOTAL_SCORE' }),
  setZen: (zen: typeof initialState.zen): Action => ({ type: 'SET_ZEN', payload: zen as NonNullable<typeof initialState.zen> }),
  setBlessing: (blessing: typeof initialState.blessing): Action => ({
    type: 'SET_BLESSING',
    payload: blessing as NonNullable<typeof initialState.blessing>
  }),
  setPersonalitySentence: (sentence: string): Action => ({
    type: 'SET_PERSONALITY_SENTENCE',
    payload: sentence
  }),
  setBeanResult: (result: typeof initialState.beanResult): Action => ({
    type: 'SET_BEAN_RESULT',
    payload: result as NonNullable<typeof initialState.beanResult>
  }),
  setColors: (colors: typeof initialState.colorSystem): Action => ({
    type: 'SET_COLORS',
    payload: colors as NonNullable<typeof initialState.colorSystem>
  }),
  setSignatureImage: (image: string): Action => ({ type: 'SET_SIGNATURE_IMAGE', payload: image }),
  setSerialNumber: (serial: string): Action => ({ type: 'SET_SERIAL_NUMBER', payload: serial }),
  setFinalCard: (dataUrl: string): Action => ({ type: 'SET_FINAL_CARD', payload: dataUrl })
}
