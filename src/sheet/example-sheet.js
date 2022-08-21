// DR: 3
// Dodge: 9
// DX: 12
// Sword: DX+2
// @Roll: 3
// @Roll: 4
// @Roll: ? > 10
// _Roll: 3d6
// _Dodge: Dodge >= _Roll
// _SwingDamage: 2d6 - 1
// _SwordDamage: _SwingDamage + 1
// _SwordAttack: Sword >= _Roll >> &_Dodge >> _SwordDamage - &DR
export const SHEET_EXAMPLE_GURPS = `\
DR: 3
Dodge: 9
DX: 12
Sword: DX+2
_Dodge: Dodge >= 3d6
_SwordDamage: 2d6 - 1 + 1 - &DR
_SwordAttack: Sword >= 3d6
`

// @Roll: 20
// _Roll: 1d20
// CA: 15
// STR: 3
// Proficiency: 3
// DamageBonus: 1
// Sword: STR + Proficiency
// _SwordDamage: STR + DamageBonus + 1d8
// _SwordAttack: Sword + _Roll >= &CA >> _SwordDamage
export const SHEET_EXAMPLE_DND5E = `\
CA: 15
STR: 3
Proficiency: 3
DamageBonus: 1
Sword: STR + Proficiency
_SwordDamage: STR + DamageBonus + 1d8
_SwordAttack: Sword + 1d20 > &CA
`
