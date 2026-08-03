export const SYSTEM_ID_TO_NAME: Record<string, string> = {
  i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV: 'VRSC',
  iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq: 'VRSCTEST',
};

export const getSystemNameFromSystemId = (systemId: string): string => {
  const systemName = SYSTEM_ID_TO_NAME[systemId];
  if (!systemName) {
    throw new Error(`Could not find coin for system id ${systemId}`);
  }
  return systemName;
};
