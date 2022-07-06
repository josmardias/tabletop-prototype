import { useState, useCallback, useMemo, useRef } from 'react'
import { evaluate } from 'mathjs'

const initialLog = [
  // {
  //   id: 1,
  //   actorName: 'Alice',
  //   actionName: 'attacks',
  //   actionTarget: 'Bob',
  //   actionResult: '5 damage',
  // },
  // {
  //   id: 2,
  //   actorName: 'Alice',
  //   actionName: 'attacks',
  //   actionTarget: 'Bob',
  //   actionResult: '5 damage',
  // },
  // {
  //   id: 3,
  //   actorName: 'Alice',
  //   actionName: 'attacks',
  //   actionTarget: 'Bob',
  //   actionResult: '5 damage',
  // },
  // {
  //   id: 4,
  //   actorName: 'Alice',
  //   actionName: 'attacks',
  //   actionTarget: 'Bob',
  //   actionResult: '5 damage',
  // },
]

export const App = () => {
  const { log: battleLog, push, reset } = useLog(initialLog)

  const handleAction = useCallback((actionResult) => {
    push(actionResult)
  }, [])

  return (
    <div>
      <HelpText />
      <div style={styles.panels}>
        <div style={styles.leftPanel}>
          <Character name="P1" onAction={handleAction}></Character>
          <br />
          {/* <Character name="P2" onAction={handleAction}></Character> */}
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
          it): <br />
          <em>Sword: DX+1</em>
        </p>
        <p>
          Action (must start with "_") displays a button on action panel: <br />
          <em>_SwordDamage: 1d6 + ST - 10</em>
        </p>
        <p>
          Use equality/inequality operators to display success on logs <br />
          <em>_Sword: 3d6 {'<='} Sword </em>
        </p>
        <p>
          Use "{'&'}" to reference target attribute/action <br />
          <em>
            _Sword: 1d20 + ST {'>'} {'&'}CA
          </em>
        </p>
        <p>
          Use "{'>>'}" to display chained action on log <br />
          <em>
            _Sword: 3d6 {'<='} Sword {'>>'} {'&'}_Dodge
          </em>
        </p>
        <p>
          Use "{'|'}" to display multiple options of chained actions on log{' '}
          <br />
          <em>
            _Sword: 3d6 {'<='} Sword {'>>'} {'&'}_Dodge|{'&'}_Parry|{'&'}_Block
          </em>
        </p>
        <p>
          Action chaining for the win <br />
          <em>
            _Sword: 3d6 {'<='} Sword {'>>'} {'&'}_Dodge|{'&'}_Parry|{'&'}_Block{' '}
            {'>>'} _SwordDamage
          </em>
        </p>
        <p>
          Use "{'?'}" as margin of success on chained action <br />
          <em>
            _Sword: 1d20 {'>'} {'&'}CA {'>>'} _SwordDamage + {'?'}
          </em>
        </p>
        <p>
          Use "{'!'}" to force roll the action <br />
          <em>
            _DiceRoll: 3d6 <br />
            _Sword: !_DiceRoll {'<='} Sword
          </em>
        </p>
        <p>
          An attribute starting with "{'@'}" defines a "critical" for an action
          of same name (can be value or start..end) <br />
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
            _Sword: Sword + !_DiceRoll {'>='} {'&'}CA {'>>'} _SwordDamage <br />
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

const attrReducer = (acc, row) => {
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

const rollDice = (dice) => {
  const [count, sides] = dice.split('d').map((str) => Number.parseInt(str))

  return new Array(count)
    .fill(0)
    .map(() => Math.floor(Math.random() * sides) + 1)
    .reduce((acc, n) => acc + n, 0)
}

// const initialSheet = 'ST: 10\nDX: 10\nSword: DX + 1\n_Sword: 3d6 <= Sword'
const initialSheet = `\
ST: 10
DX: 10
Sword: DX + 1
_Sword: 3d6 <= Sword
`

const Character = ({ name, onAction }) => {
  const [sheet, setSheet] = useState(initialSheet)
  const textareaRef = useRef(null)

  // console.log({ sheet })

  const attributes = useMemo(
    () =>
      sheet
        .split('\n')
        .map((row) => row.trim())
        .filter((row) => row[0] !== '_')
        .reduce(attrReducer, {}),
    [sheet],
  )

  // console.log({ attributes })

  const actions = useMemo(
    () =>
      sheet
        .split('\n')
        .map((row) => row.trim())
        .filter((row) => row[0] === '_')
        .reduce(actionReducer, {}),
    [sheet],
  )

  const handleSave = useCallback(() => setSheet(textareaRef.current.value), [])

  const calculateAction = (formula, attributes) => {
    const dices = formula.match(/(\dd\d)/g)
    const rolledDices = dices.map((dice) => rollDice(dice))

    const formula2 = dices.reduce((acc, dice, i) => {
      return acc.replace(dice, rolledDices[i])
    }, formula)

    const comparators = formula2.match(/(<=|>=|<|>)/g)

    if (!comparators) return { margin: evaluate(formula2, attributes) }

    const comparator = comparators[0]

    const [leftSide, rightSide] = formula2
      .split(comparator)
      .map((str) => evaluate(str, attributes))

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

  return (
    <div>
      <p>{name}</p>
      <button onClick={handleSave}>Calculate</button>
      <div style={characterStyles.panels}>
        <textarea
          ref={textareaRef}
          style={characterStyles.textarea}
          defaultValue={sheet}
        />
        <div>
          <h4>Stats</h4>
          {Object.entries(attributes).map(([key, value], i) => (
            <p key={key}>
              {key}: {value}
            </p>
          ))}
          <h4>Actions</h4>
          {Object.entries(actions).map(([key, value], i) => (
            <button
              key={key}
              title={value}
              onClick={() => {
                const actionResult = calculateAction(value, attributes)
                onAction({ actor: name, ...actionResult })
              }}
            >
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
