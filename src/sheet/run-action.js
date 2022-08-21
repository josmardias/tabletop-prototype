import { evaluate } from 'mathjs'
import { rollDice } from './roll-dice.js'

export const runAction = (actor, target, action) => {
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
