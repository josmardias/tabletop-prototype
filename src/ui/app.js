import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { runAction } from '../sheet/run-action'
import { parseSheet } from '../sheet/parse-sheet.js'
import { BattleLog } from './battle-log.js'
import { Help } from './help.js'
import { Character } from './character.js'
import {
  SHEET_EXAMPLE_GURPS,
  SHEET_EXAMPLE_DND5E,
} from '../sheet/example-sheet'

const initialLog = []

const emptyCharacter = {
  attributes: {},
  actions: {},
}

export const App = () => {
  const inputCharacterSheet1 = useRef(null)
  const inputCharacterSheet2 = useRef(null)
  const { log: battleLog, push, reset } = useLog(initialLog)
  const [character1, setCharacter1] = useState(emptyCharacter)
  const [character2, setCharacter2] = useState(emptyCharacter)

  const handleAction = useCallback(
    (characterName, actionName) => {
      const characterMap = {
        P1: character1,
        P2: character2,
      }

      const actor = characterMap[characterName]
      const target = Object.values(characterMap).find((o) => o !== actor)

      try {
        const result = runAction(actor, target, actionName)
        push(result)
      } catch (e) {
        console.error(e)
      }
    },
    [character1, character2],
  )

  const handleCalculate = useCallback(() => {
    try {
      const sheetText = inputCharacterSheet1.current.value
      const sheet = parseSheet(sheetText)
      setCharacter1(sheet)
    } catch (e) {
      console.error(e)
      return
    }

    try {
      const sheetText = inputCharacterSheet2.current.value
      const sheet = parseSheet(sheetText)
      setCharacter2(sheet)
    } catch (e) {
      console.error(e)
      return
    }
  }, [])

  const handleLoadSheet = useCallback((event) => {
    const loadConfirmMessage = `Loading ${event.target.dataset.label}. Current changes will be lost. Proceed?`
    if (!confirm(loadConfirmMessage)) {
      return
    }

    const sheetMap = {
      gurps: SHEET_EXAMPLE_GURPS,
      dnd: SHEET_EXAMPLE_DND5E,
    }

    const sheetId = event.target.dataset.sheet

    const sheet = sheetMap[sheetId]

    inputCharacterSheet1.current.value = sheet
    inputCharacterSheet2.current.value = sheet

    handleCalculate()
  }, [])

  useEffect(() => {
    handleCalculate()
  }, [])

  return (
    <div>
      <Help />
      <p>
        Load example:
        <button data-sheet="gurps" data-label="GURPS" onClick={handleLoadSheet}>
          GURPS
        </button>
        <button data-sheet="dnd" data-label="D&D 5e" onClick={handleLoadSheet}>
          D&D 5e
        </button>
      </p>
      <div style={styles.panels}>
        <div style={styles.leftPanel}>
          <textarea
            ref={inputCharacterSheet1}
            style={styles.sheetInput}
            defaultValue=""
          />
          <textarea
            ref={inputCharacterSheet2}
            style={styles.sheetInput}
            defaultValue=""
          />
        </div>
        <div style={styles.middlePanel}>
          <Character
            name="P1"
            attributes={character1.attributes}
            actions={character1.actions}
            onAction={(actionName) => handleAction('P1', actionName)}
          ></Character>
          <br />
          <Character
            name="P2"
            attributes={character2.attributes}
            actions={character2.actions}
            onAction={(actionName) => handleAction('P2', actionName)}
          ></Character>
        </div>
        <div style={styles.rightPanel}>
          <BattleLog logs={battleLog} />
        </div>
      </div>
      <button onClick={handleCalculate}>Calculate</button>
    </div>
  )
}

const styles = {
  panels: {
    display: 'flex',
    maxHeight: 600,
  },
  leftPanel: {
    flexGrow: 1,
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
    flexGrow: 4,
    border: '1px solid',
    boxSizing: 'border-box',
    padding: 5,
  },
  sheetInput: {
    minWidth: 250,
    minHeight: 250,
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
