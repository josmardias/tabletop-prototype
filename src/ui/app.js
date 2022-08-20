import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { calculateAction } from '../sheet/calculate-action'
import { parseSheet } from '../sheet/parse-sheet.js'
import { BattleLog } from './battle-log.js'
import { Help } from './help.js'
import { Character } from './character.js'

const initialLog = []

// const initialSheet = 'ST: 10\nDX: 10\nSword: DX + 1\n_Sword: 3d6 <= Sword'
const initialSheet = `\
ST: 10
DX: 10
Broadsword: DX + 1
_SwordAttack: 3d6 <= Broadsword
`

const emptyCharacter = {
  attributes: {},
  actions: {},
}

export const App = () => {
  const textareaRef = useRef(null)
  const { log: battleLog, push, reset } = useLog(initialLog)
  const [character1, setCharacter1] = useState(emptyCharacter)
  const [character2, setCharacter2] = useState(emptyCharacter)

  const characterMap = useMemo(
    () => ({
      P1: character1,
      P2: character2,
    }),
    [character1, character2],
  )

  const handleAction = useCallback(
    (characterName, action) => {
      const actor = characterMap[characterName]
      const target = Object.values(characterMap).find((o) => o !== actor)

      const result = calculateAction(actor, target, action)
      push(result)
    },
    [characterMap],
  )

  const handleCalculate = useCallback(() => {
    const sheet = textareaRef.current.value

    let character
    try {
      character = parseSheet(sheet)
    } catch (e) {
      console.error(e)
      return
    }

    setCharacter1(character)
  }, [character1])

  useEffect(() => {
    handleCalculate()
  }, [])

  return (
    <div>
      <Help />
      <button onClick={handleCalculate}>Calculate</button>
      <div style={styles.panels}>
        <div style={styles.leftPanel}>
          <textarea
            ref={textareaRef}
            style={styles.sheetInput}
            defaultValue={initialSheet}
          />
        </div>
        <div style={styles.middlePanel}>
          <Character
            name="P1"
            attributes={character1.attributes}
            actions={character1.actions}
            onAction={(action) => handleAction('P1', action)}
          ></Character>
          <br />
          {/* <Character
            name="P2"
            attributes={c2.attributes}
            actions={c2.actions}
            onAction={handleAction}
          ></Character> */}
        </div>
        <div style={styles.rightPanel}>
          <BattleLog logs={battleLog} />
        </div>
      </div>
    </div>
  )
}

const styles = {
  panels: {
    display: 'flex',
    maxHeight: 600,
  },
  leftPanel: {
    flexGrow: 6,
    border: '1px solid',
    boxSizing: 'border-box',
    padding: 5,
  },
  middlePanel: {
    flexGrow: 1,
    border: '1px solid',
    boxSizing: 'border-box',
    padding: 5,
  },
  rightPanel: {
    flexGrow: 1,
    border: '1px solid',
    boxSizing: 'border-box',
    padding: 5,
    overflowY: 'scroll',
  },
  sheetInput: {
    minWidth: 200,
    minHeight: 200,
  },
}

const emptyLog = []
const useLog = (initialLog = emptyLog) => {
  const [state, setState] = useState(initialLog)

  const reset = () => setState(emptyLog)

  const push = (log) => {
    delete log.id
    setState((state) => [...state, { id: state.length, ...log }])
  }

  return { log: state, push, reset }
}
