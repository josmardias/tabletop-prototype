export const rollDice = (dice) => {
  const [count, sides] = dice.split('d').map((str) => Number.parseInt(str))

  return new Array(count)
    .fill(0)
    .map(() => Math.floor(Math.random() * sides) + 1)
    .reduce((acc, n) => acc + n, 0)
}
