import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { evaluate } from 'mathjs'

const initialLog = []

// const initialSheet = 'ST: 10\nDX: 10\nSword: DX + 1\n_Sword: 3d6 <= Sword'
const initialSheet = `\
ST: 10
DX: 10
Broadsword: DX + 1
_SwordAttack: 3d6 <= Broadsword
`

const rollDice = (dice) => {
  const [count, sides] = dice.split('d').map((str) => Number.parseInt(str))

  return new Array(count)
    .fill(0)
    .map(() => Math.floor(Math.random() * sides) + 1)
    .reduce((acc, n) => acc + n, 0)
}

const calculateAction = (actor, target, action) => {
  const dices = action.match(/(\dd\d)/g) || []
  const rolledDices = dices.map((dice) => rollDice(dice))

  const actionComputedDices = dices.reduce((acc, dice, i) => {
    return acc.replace(dice, rolledDices[i])
  }, action)

  const comparators = actionComputedDices.match(/(<=|>=|<|>)/g)

  if (!comparators)
    return { margin: evaluate(actionComputedDices, actor.attributes) }

  const comparator = comparators[0]

  const [leftSide, rightSide] = actionComputedDices
    .split(comparator)
    .map((str) => evaluate(str, actor.attributes))

  let success, margin

  switch (comparator) {
    case '>':
      success = leftSide > rightSide
      margin = leftSide - rightSide
      break
    case '>=':
      success = leftSide >= rightSide
      margin = leftSide - rightSide
      break
    case '<':
      success = leftSide < rightSide
      margin = rightSide - leftSide
      break
    case '<=':
      success = leftSide <= rightSide
      margin = rightSide - leftSide
      break
  }

  return { success, margin, dices: rolledDices }
}

const attributeReducer = (acc, row) => {
  if (!row || !row.trim()) return acc

  const [attr, formula] = row.split(':')

  acc[attr.trim()] = evaluate(formula, acc)
  return acc
}

const actionReducer = (acc, formula) => {
  const [key, value] = formula.split(':')
  acc[key] = value
  return acc
}

const parseSheet = (sheet) => {
  const lines = sheet.split('\n').map((row) => row.trim())

  const attributes = lines
    .filter((row) => row[0] !== '_')
    .reduce(attributeReducer, {})

  const actions = lines
    .filter((row) => row[0] === '_')
    .map((str) => str.slice(1))
    .reduce(actionReducer, {})

  return { attributes, actions }
}

const emptyCharacter = {
  attributes: {},
  actions: {},
}

const emptyCharacter1 = { name: 'P1', ...emptyCharacter }
const emptyCharacter2 = { name: 'P2', ...emptyCharacter }

export const App = () => {
  const textareaRef = useRef(null)
  const { log: battleLog, push, reset } = useLog(initialLog)
  const [character1, setCharacter1] = useState(emptyCharacter1)
  const [character2, setCharacter2] = useState(emptyCharacter2)

  const characterMap = useMemo(
    () => ({
      [character1.name]: character1,
      [character2.name]: character2,
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

    setCharacter1({ name: character1.name, ...character })
  }, [character1])

  useEffect(() => {
    handleCalculate()
  }, [])

  return (
    <div>
      <HelpText />
      <button onClick={handleCalculate}>Calculate</button>
      <div style={styles.panels}>
        <div style={styles.leftPanel}>
          <textarea
            ref={textareaRef}
            style={characterStyles.textarea}
            defaultValue={initialSheet}
          />
        </div>
        <div style={styles.middlePanel}>
          <Character
            name={character1.name}
            attributes={character1.attributes}
            actions={character1.actions}
            onAction={(action) => handleAction(character1.name, action)}
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
    border: '1px solid',
    boxSizing: 'border-box',
    padding: 5,
  },
  middlePanel: {
    border: '1px solid',
    boxSizing: 'border-box',
    padding: 5,
  },
  rightPanel: {
    border: '1px solid',
    boxSizing: 'border-box',
    padding: 5,
    overflowY: 'scroll',
  },
}

const HelpText = () => {
  return (
    <div>
      <details>
        <summary>Click here for help</summary>
        <p>
          Define an attribute <br />
          DX: 12
        </p>
        <p>
          Define an attribute based on another attribute (that is anywhere above
          it) <br />
          <em>Sword: DX+1</em>
        </p>
        <p>
          Action (must start with "_") displays a button on action panel <br />
          <em>_SwordDamage: ST - 10</em>
        </p>
        <p>
          Dice rolls can be called inside actions <br />
          <em>_SwordDamage: 2d6 + ST - 10</em>
        </p>
        <p>
          Use equality/inequality operators to display success on logs <br />
          <em>_Sword: 3d6 {'<='} Sword </em>
        </p>
        <p>
          Use "{'&'}" to reference enermy target attribute/action <br />
          <em>
            _Sword: 1d20 + ST {'>'} {'&'}CA
          </em>
        </p>
        <p>
          Use "{'>>'}" to chain actions <br />
          <em>
            _Sword: 3d6 {'<='} Sword {'>>'} {'&'}_Dodge
          </em>
        </p>
        <p>
          Use "{'$N'}" where N is a number (example {'$0'}, {'$1'}, {'$2'}...)
          to reuse previous steps of chained actions <br />
          <em>
            _Sword: 1d20 {'>'} {'&'}CA {'>>'} _SwordDamage + {'$0'}
          </em>
        </p>
        <p>
          An attribute starting with "{'@'}" defines a "critical success" for an
          action of same name <br />
          <em>
            @DiceRoll: 3 <br />
            _DiceRoll: 3d6 <br />
            _Sword: !_DiceRoll {'<='} Sword
          </em>
        </p>
        <p>
          Multiple "{'@'}" can be used in this case. Use {'?'} to reference the
          margin of success <br />
          <em>
            @DiceRoll: 3 <br />
            @DiceRoll: 4 <br />
            @DiceRoll: {'?'} {'>'} 10 <br />
            _DiceRoll: 3d6 <br />
            _Sword: !_DiceRoll {'<='} Sword
          </em>
        </p>
        <p>
          Disable a line by prepend it with # <br />
          <em># Sword: 3d6 {'<='} 12</em>
        </p>
        <p>
          DnD 5e attack example <br />
          <em>
            @DiceRoll: 20 <br />
            _DiceRoll: 1d20 <br />
            STR: 3 <br />
            Proficiency: 3 <br />
            DamageBonus: 2 <br />
            Sword: STR + Proficiency <br />
            SwordDamage: STR + DamageBonus <br />
            _Sword: Sword + _DiceRoll {'>='} {'&'}CA {'>>'} _SwordDamage <br />
          </em>
        </p>
        <p>
          GURPS 4e attack example <br />
          <em>
            @DiceRoll: 3 <br />
            @DiceRoll: 4 <br />
            @DiceRoll: {'?'} {'>'} 10 <br />
            _DiceRoll: 3d6 <br />
            DX: 12 <br />
            Sword: STR + Proficiency <br />
            _SwingDamage: 2d6 - 1 <br />
            _SwordDamage: !_SwingDamage + 1 <br />
            _Sword: !_DiceRoll {'<='} Sword {'>>'} {'&'}_Dodge|{'&'}_Parry|{'&'}
            _Block {'>>'} _SwordDamage
          </em>
        </p>
      </details>
    </div>
  )
}

const BattleLog = ({ logs }) => {
  if (!logs.length) {
    return <div style={battleLogStyles.container}>No logs yet.</div>
  }

  return (
    <div style={battleLogStyles.container}>
      {logs.map((log, index) => (
        <div key={index}>
          <p>{JSON.stringify(log)}</p>
        </div>
      ))}
    </div>
  )
}

const battleLogStyles = {
  container: {
    minWidth: 200,
  },
}

const Character = ({ name, attributes, actions, onAction }) => {
  return (
    <div>
      <p>{name}</p>
      <div style={characterStyles.panels}>
        <div>
          <h4>Stats</h4>
          {Object.entries(attributes).map(([key, value], i) => (
            <p key={key}>
              {key}: {value}
            </p>
          ))}
          <h4>Actions</h4>
          {Object.entries(actions).map(([key, value], i) => (
            <button key={key} title={value} onClick={() => onAction(value)}>
              {key}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

const characterStyles = {
  panels: {
    display: 'flex',
    gap: 10,
    minWidth: 400,
  },
  textarea: {
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
