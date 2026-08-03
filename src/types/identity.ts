import {IdentityDefinition} from 'verus-typescript-primitives';

export interface Identity {
  fullyqualifiedname: string;
  identity: IdentityDefinition;
  [key: string]: unknown;
}
