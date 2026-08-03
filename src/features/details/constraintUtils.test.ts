import {CompactIAddressObject, RecipientConstraint} from 'verus-typescript-primitives';

import {SYSTEM_ID_TO_NAME} from '#/utils/systems';

import {
  getConstraintAddress,
  getConstraintDisplayName,
  getConstraintLabel,
} from './constraintUtils';

describe('getConstraintAddress', () => {
  it('returns the i-address when toIAddress() succeeds', () => {
    const constraint = new RecipientConstraint({
      type: RecipientConstraint.REQUIRED_ID,
      identity: new CompactIAddressObject({
        type: CompactIAddressObject.TYPE_I_ADDRESS,
        address: 'iNtjYwzzo1NLjdjtn1KrnXnKJoK9cbhYPd',
      }),
    });

    expect(getConstraintAddress(constraint)).toBe('iNtjYwzzo1NLjdjtn1KrnXnKJoK9cbhYPd');
  });

  it('falls back to identity.address when toIAddress() throws', () => {
    const xAddress = 'xA91QPpBrHZto92NCU5KEjCqRveS4dAPrf';

    const constraint = new RecipientConstraint({
      type: RecipientConstraint.REQUIRED_ID,
      identity: new CompactIAddressObject({
        type: CompactIAddressObject.TYPE_X_ADDRESS,
        address: xAddress,
      }),
    });

    expect(getConstraintAddress(constraint)).toBe(xAddress);
  });
});

describe('getConstraintDisplayName', () => {
  it('returns the friendly name for a known identity address', () => {
    const friendlyNames = {
      ...SYSTEM_ID_TO_NAME,
      iNtjYwzzo1NLjdjtn1KrnXnKJoK9cbhYPd: 'Mbnv.VRSCTEST@',
    };

    expect(
      getConstraintDisplayName(
        RecipientConstraint.REQUIRED_ID,
        'iNtjYwzzo1NLjdjtn1KrnXnKJoK9cbhYPd',
        friendlyNames
      )
    ).toBe('Mbnv.VRSCTEST@');
  });

  it('returns the system name for a known system address', () => {
    expect(
      getConstraintDisplayName(
        RecipientConstraint.REQUIRED_SYSTEM,
        'iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq',
        SYSTEM_ID_TO_NAME
      )
    ).toBe('VRSCTEST');
  });

  it('returns "Unknown system" for an unrecognized system address', () => {
    expect(
      getConstraintDisplayName(
        RecipientConstraint.REQUIRED_SYSTEM,
        'i54gndSepHaukPgQoWAS6xgj1hxB25g5TB',
        SYSTEM_ID_TO_NAME
      )
    ).toBe('Unknown system');
  });

  it('returns the address as-is when it already ends with @', () => {
    expect(getConstraintDisplayName(RecipientConstraint.REQUIRED_ID, 'User1.VRSCTEST@', {})).toBe(
      'User1.VRSCTEST@'
    );
  });

  it('returns "Unknown identity" for an unrecognized id address', () => {
    expect(
      getConstraintDisplayName(
        RecipientConstraint.REQUIRED_ID,
        'i97UuDoPGDtFiC5y32az9fHY8bJRbe7XHb',
        SYSTEM_ID_TO_NAME
      )
    ).toBe('Unknown identity');
  });
});

describe('getConstraintLabel', () => {
  const friendlyNames: Record<string, string> = {
    ...SYSTEM_ID_TO_NAME,
    iNtjYwzzo1NLjdjtn1KrnXnKJoK9cbhYPd: 'Mbnv.VRSCTEST@',
    iLvocymhpjbsQUaeXaJyn1MVQKxyCpEV8T: 'MJS.VRSCTEST@',
  };

  it('returns a "Required identity" label for REQUIRED_ID constraints', () => {
    const constraint = new RecipientConstraint({
      type: RecipientConstraint.REQUIRED_ID,
      identity: new CompactIAddressObject({
        type: CompactIAddressObject.TYPE_I_ADDRESS,
        address: 'iNtjYwzzo1NLjdjtn1KrnXnKJoK9cbhYPd',
      }),
    });

    expect(getConstraintLabel(constraint, friendlyNames)).toBe('Required identity: Mbnv.VRSCTEST@');
  });

  it('returns a "Required system" label for REQUIRED_SYSTEM constraints', () => {
    const constraint = new RecipientConstraint({
      type: RecipientConstraint.REQUIRED_SYSTEM,
      identity: new CompactIAddressObject({
        type: CompactIAddressObject.TYPE_I_ADDRESS,
        address: 'iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq',
      }),
    });

    expect(getConstraintLabel(constraint, friendlyNames)).toBe('Required system: VRSCTEST');
  });

  it('returns a "Required parent" label for REQUIRED_PARENT constraints', () => {
    const constraint = new RecipientConstraint({
      type: RecipientConstraint.REQUIRED_PARENT,
      identity: new CompactIAddressObject({
        type: CompactIAddressObject.TYPE_I_ADDRESS,
        address: 'iLvocymhpjbsQUaeXaJyn1MVQKxyCpEV8T',
      }),
    });

    expect(getConstraintLabel(constraint, friendlyNames)).toBe('Required parent: MJS.VRSCTEST@');
  });

  it('returns a generic "Constraint" label for unknown constraint types', () => {
    const constraint = new RecipientConstraint({
      type: 99,
      identity: new CompactIAddressObject({
        type: CompactIAddressObject.TYPE_I_ADDRESS,
        address: 'iNtjYwzzo1NLjdjtn1KrnXnKJoK9cbhYPd',
      }),
    });

    expect(getConstraintLabel(constraint, friendlyNames)).toBe('Constraint: Mbnv.VRSCTEST@');
  });

  it('falls back to "Unknown identity" when the address is not in friendly names', () => {
    const constraint = new RecipientConstraint({
      type: RecipientConstraint.REQUIRED_ID,
      identity: new CompactIAddressObject({
        type: CompactIAddressObject.TYPE_I_ADDRESS,
        address: 'i97UuDoPGDtFiC5y32az9fHY8bJRbe7XHb',
      }),
    });

    expect(getConstraintLabel(constraint, friendlyNames)).toBe(
      'Required identity: Unknown identity'
    );
  });
});
