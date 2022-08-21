import test from 'ava'
import { parseSheet } from './parse-sheet.js'
import { runAction } from './run-action.js'

test('parse empty sheet', (t) => {
  const sheet = parseSheet('')
  t.deepEqual(sheet, { attributes: {}, actions: {} })
})

test('simple attributes', (t) => {
  const text = 'ST:13\nDX:12'
  const sheet = parseSheet(text)

  t.deepEqual(sheet, { attributes: { ST: 13, DX: 12 }, actions: {} })
})

test('simple attributes with spacing', (t) => {
  const text = 'ST: 13\nDX: 12'
  const sheet = parseSheet(text)
  const targetSheet = parseSheet('')

  t.deepEqual(sheet, { attributes: { ST: 13, DX: 12 }, actions: {} })
})

test('simple attributes with a lot of spacing', (t) => {
  const text = '    ST:    13   \n   DX:   12   '
  const sheet = parseSheet(text)

  t.deepEqual(sheet, { attributes: { ST: 13, DX: 12 }, actions: {} })
})

test('attribute chain', (t) => {
  const text = `
    DX: 12
    Sword: DX+2
    Knife: Sword-4
  `
  const sheet = parseSheet(text)

  t.deepEqual(sheet, {
    attributes: { DX: 12, Sword: 14, Knife: 10 },
    actions: {},
  })
})

test('simple action', (t) => {
  const text = `
    _SwordDamage: 17
  `
  const sheet = parseSheet(text)
  const targetSheet = parseSheet('')

  const result = runAction(sheet, targetSheet, 'SwordDamage')

  t.deepEqual(result, { dices: [], margin: 17 })
})

test('action using attributes', (t) => {
  const text = `
    DX: 12
    _SwordDamage: DX+2
  `
  const sheet = parseSheet(text)
  const targetSheet = parseSheet('')

  const result = runAction(sheet, targetSheet, 'SwordDamage')

  t.deepEqual(result, { dices: [], margin: 14 })
})

test('action with dices', (t) => {
  const text = `
    _Roll: 3d6
  `
  const sheet = parseSheet(text)
  const targetSheet = parseSheet('')

  const fakeRoll = () => 11

  const result = runAction(sheet, targetSheet, 'Roll', fakeRoll)

  t.deepEqual(result, { dices: [11], margin: 11 })
})

test('action inequality operators', (t) => {
  const text = `
    _GT_1: 12 > 10
    _GT_2: 12 > 12
    _GT_3: 10 > 12

    _GTE_1: 12 >= 10
    _GTE_2: 12 >= 12
    _GTE_3: 10 >= 12

    _LT_1: 12 < 10
    _LT_2: 12 < 12
    _LT_3: 10 < 12

    _LTE_1: 12 <= 10
    _LTE_2: 12 <= 12
    _LTE_3: 10 <= 12
  `
  const sheet = parseSheet(text)
  const targetSheet = parseSheet('')

  t.deepEqual(runAction(sheet, targetSheet, 'GT_1'), {
    dices: [],
    margin: 2,
    success: true,
  })
  t.deepEqual(runAction(sheet, targetSheet, 'GT_2'), {
    dices: [],
    margin: 0,
    success: false,
  })
  t.deepEqual(runAction(sheet, targetSheet, 'GT_3'), {
    dices: [],
    margin: -2,
    success: false,
  })

  t.deepEqual(runAction(sheet, targetSheet, 'GTE_1'), {
    dices: [],
    margin: 2,
    success: true,
  })
  t.deepEqual(runAction(sheet, targetSheet, 'GTE_2'), {
    dices: [],
    margin: 0,
    success: true,
  })
  t.deepEqual(runAction(sheet, targetSheet, 'GTE_3'), {
    dices: [],
    margin: -2,
    success: false,
  })

  t.deepEqual(runAction(sheet, targetSheet, 'LT_1'), {
    dices: [],
    margin: -2,
    success: false,
  })
  t.deepEqual(runAction(sheet, targetSheet, 'LT_2'), {
    dices: [],
    margin: 0,
    success: false,
  })
  t.deepEqual(runAction(sheet, targetSheet, 'LT_3'), {
    dices: [],
    margin: 2,
    success: true,
  })

  t.deepEqual(runAction(sheet, targetSheet, 'LTE_1'), {
    dices: [],
    margin: -2,
    success: false,
  })
  t.deepEqual(runAction(sheet, targetSheet, 'LTE_2'), {
    dices: [],
    margin: 0,
    success: true,
  })
  t.deepEqual(runAction(sheet, targetSheet, 'LTE_3'), {
    dices: [],
    margin: 2,
    success: true,
  })
})

test('action inequality with dices', (t) => {
  const text = `
    _Roll: 3d6
    DX: 12
    _SwordAttack: DX + 2 >= 3d6
  `
  const sheet = parseSheet(text)
  const targetSheet = parseSheet('')

  const fakeRoll = () => 11

  const result = runAction(sheet, targetSheet, 'SwordAttack', fakeRoll)

  t.deepEqual(result, { dices: [11], margin: 3, success: true })
})

test('action using target sheet', (t) => {
  const text = `
    ST: 3
    Aura: 1
    _SwordAttack: 1d20 + ST >= &CA + &Bonus - Aura
  `
  const sheet = parseSheet(text)
  const targetSheet = parseSheet('CA: 16 \n Bonus: 3')

  const fakeRoll = () => 13

  const result = runAction(sheet, targetSheet, 'SwordAttack', fakeRoll)

  t.deepEqual(result, { dices: [13], margin: -2, success: false })
})
