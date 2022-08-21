import { evaluate } from 'mathjs'
import { rollDice as _rollDice } from './roll-dice.js'

export const runAction = (actor, target, actionName, rollDice = _rollDice) => {
  const action = actor.actions[actionName]

  const rolledDices = []

  const actionComputed = action.replace(/(\dd\d+)/g, (dice) => {
    const roll = rollDice(dice)
    rolledDices.push(roll)
    return roll
  })

  const comparators = actionComputed.match(/(<=|>=|<|>)/g)

  if (!comparators)
    return {
      margin: evaluate(actionComputed, actor.attributes),
      dices: rolledDices,
    }

  const comparator = comparators[0]

  const [leftSide, rightSide] = actionComputed
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
