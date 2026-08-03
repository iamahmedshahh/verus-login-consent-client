import BN from 'bn.js';
import { Buffer } from 'buffer';

// Polyfill for BN.toBuffer() method for browser compatibility
if (typeof BN.prototype.toBuffer === 'undefined') {
  BN.prototype.toBuffer = function(endian = 'be', length) {
    return this.toArrayLike(Buffer, endian, length);
  };
}

export default BN; 