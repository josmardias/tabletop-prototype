import { evaluate } from 'mathjs'

export const parseSheet = (sheet) => {
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
