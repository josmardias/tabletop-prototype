export const Help = () => {
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
