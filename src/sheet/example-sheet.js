export const SHEET_EXAMPLE_GURPS = `\
@DiceRoll: 3
@DiceRoll: 4
@DiceRoll: ? > 10
_DiceRoll: 3d6
DX: 12
Sword: STR + Proficiency
_SwingDamage: 2d6 - 1
_SwordDamage: !_SwingDamage + 1
_Sword: !_DiceRoll <= Sword >> &_Dodge|&_Parry|&_Block >> _SwordDamage
`

export const SHEET_EXAMPLE_DND5E = `\
@DiceRoll: 20
_DiceRoll: 1d20
STR: 3
Proficiency: 3
DamageBonus: 2
Sword: STR + Proficiency
SwordDamage: STR + DamageBonus
_Sword: Sword + _DiceRoll >= &CA >> _SwordDamage
`
