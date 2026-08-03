import '@testing-library/jest-dom';

import {TextEncoder} from 'util';

// @noble/hashes (from @bitgo/utxo-lib) needs TextEncoder at module load.
// However, jsdom doesn't have it so we use Node's implementation.
Object.assign(globalThis, {TextEncoder});
