import { useEffect, useState } from 'react'

type KeysState = Record<string, 'trigger' | 'sustain' | 'release'>

const deleteKey = <T extends Record<string, unknown>>(obj: T, key: string): T => {
  const newObj = { ...obj }
  delete newObj[key]
  return newObj
}

export const validKeys = "qwertyuiop[]asdfghjkl;'\\`zxcvbnm,./ ".split('')
export const validKeySet = new Set(validKeys)

export const useKeys = (): KeysState => {
  const [state, setState] = useState<KeysState>({})

  useEffect(() => {
    const keydownHandler = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey) return
      if (!validKeySet.has(e.key)) return

      e.stopPropagation()
      e.preventDefault()

      setState(state => (e.key in state ? state : { ...state, [e.key]: 'trigger' }))
      setTimeout(() => {
        setState(state => ({ ...state, [e.key]: 'sustain' }))
      })
    }

    const keyupHandler = (e: KeyboardEvent) => {
      if (!validKeySet.has(e.key)) return

      e.stopPropagation()
      e.preventDefault()

      setState(state => ({ ...state, [e.key]: 'release' }))
      setTimeout(() => {
        setState(state => deleteKey(state, e.key))
      })
    }

    window.addEventListener('keydown', keydownHandler)
    window.addEventListener('keyup', keyupHandler)

    return () => {
      window.removeEventListener('keydown', keydownHandler)
      window.removeEventListener('keyup', keyupHandler)
    }
  }, [state])

  return state
}
