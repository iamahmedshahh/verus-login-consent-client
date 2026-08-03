import BN from 'bn.js';
import {GenericRequest, VERUSPAY_INVOICE_DETAILS_VDXF_ORDINAL} from 'verus-typescript-primitives';

import {RootState} from '#/redux/store';
import {verifyGenericRequest} from '#/rpc/calls/verifyGenericRequest';
import {Identity} from '#/types/identity';

import {checkGenericRequest} from './genericRequest';

// TODO: Create a better structure for testing and redo these test cases to
// thoroughly test the verifyGenericRequest function.
const UNKNOWN_DETAIL_TYPE = new BN(0);

jest.mock('#/rpc/calls/verifyGenericRequest');

const mockedVerifyGenericRequest = jest.mocked(verifyGenericRequest);

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

interface MockRequestOverrides {
  isValidVersion?: boolean;
  version?: BN;
  details?: Array<{type: BN; eq?: (other: BN) => boolean}>;
  isSigned?: boolean;
  hasMultiDetails?: boolean;
  hasAppOrDelegatedID?: boolean;
  signature?: {
    identityID: {
      toIAddress: () => string;
    };
  };
}

function createMockRequest(overrides: MockRequestOverrides = {}): GenericRequest {
  const details = (overrides.details ?? [{type: UNKNOWN_DETAIL_TYPE}]).map(d => ({
    ...d,
    type: {
      ...d.type,
      eq: d.eq ?? ((other: BN) => d.type.eq(other)),
    },
  }));

  return {
    isValidVersion: jest.fn().mockReturnValue(overrides.isValidVersion ?? true),
    version: overrides.version ?? new BN(1),
    details,
    isSigned: jest.fn().mockReturnValue(overrides.isSigned ?? false),
    hasMultiDetails: jest.fn().mockReturnValue(overrides.hasMultiDetails ?? false),
    hasAppOrDelegatedID: jest.fn().mockReturnValue(overrides.hasAppOrDelegatedID ?? false),
    signature: overrides.signature,
  } as unknown as GenericRequest;
}

function createMockGetState(stateOverrides: DeepPartial<RootState> = {}): () => RootState {
  const state: DeepPartial<RootState> = {
    identity: {identities: [], ...stateOverrides.identity},
    ...stateOverrides,
  };
  return jest.fn().mockReturnValue(state);
}

describe('genericRequest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkGenericRequest', () => {
    const chainId = 'VRSCTEST';

    it('should throw error for invalid version', async () => {
      const mockRequest = createMockRequest({
        isValidVersion: false,
        version: new BN(999),
      });

      await expect(checkGenericRequest(chainId, mockRequest, createMockGetState())).rejects.toThrow(
        'The request version 999 is unsupported.'
      );
    });

    it('should throw error for request with no details', async () => {
      const mockRequest = createMockRequest({details: []});

      await expect(checkGenericRequest(chainId, mockRequest, createMockGetState())).rejects.toThrow(
        'The request contains no details.'
      );
    });

    it('should throw error for unsigned multi-detail request', async () => {
      const mockRequest = createMockRequest({
        isSigned: false,
        hasMultiDetails: true,
      });

      await expect(checkGenericRequest(chainId, mockRequest, createMockGetState())).rejects.toThrow(
        'The request is not signed.'
      );
    });

    it('should throw error for unsigned request that is not a VerusPay invoice', async () => {
      const mockRequest = createMockRequest({
        isSigned: false,
        hasMultiDetails: false,
        details: [{type: UNKNOWN_DETAIL_TYPE}],
      });

      await expect(checkGenericRequest(chainId, mockRequest, createMockGetState())).rejects.toThrow(
        'The request is not signed.'
      );
    });

    it('should allow unsigned VerusPay invoice', async () => {
      const mockRequest = createMockRequest({
        isSigned: false,
        hasMultiDetails: false,
        details: [{type: VERUSPAY_INVOICE_DETAILS_VDXF_ORDINAL}],
      });

      await expect(
        checkGenericRequest(chainId, mockRequest, createMockGetState())
      ).resolves.not.toThrow();
    });

    it('should verify signature for signed request', async () => {
      const mockRequest = createMockRequest({isSigned: true});
      mockedVerifyGenericRequest.mockResolvedValue({
        verified: true,
        message: 'Signature is valid',
      });

      await checkGenericRequest(chainId, mockRequest, createMockGetState());

      expect(mockedVerifyGenericRequest).toHaveBeenCalledWith(chainId, mockRequest);
    });

    it('should throw error if signature verification fails', async () => {
      const mockRequest = createMockRequest({isSigned: true});
      mockedVerifyGenericRequest.mockResolvedValue({
        verified: false,
        message: 'Invalid signature',
      });

      await expect(checkGenericRequest(chainId, mockRequest, createMockGetState())).rejects.toThrow(
        'Invalid signature'
      );
    });

    it('should verify signing identity exists for request with appOrDelegatedID', async () => {
      const signingIdentityAddress = 'iTestIdentity123@';
      const toIAddress = jest.fn().mockReturnValue(signingIdentityAddress);

      const mockRequest = createMockRequest({
        isSigned: true,
        hasAppOrDelegatedID: true,
        signature: {identityID: {toIAddress}},
      });

      mockedVerifyGenericRequest.mockResolvedValue({verified: true});

      const mockIdentity: Partial<Identity> = {
        identity: {identityaddress: signingIdentityAddress} as Identity['identity'],
      };

      const mockGetState = createMockGetState({
        identity: {identities: [mockIdentity as Identity]},
      });

      await checkGenericRequest(chainId, mockRequest, mockGetState);

      expect(mockGetState).toHaveBeenCalled();
      expect(toIAddress).toHaveBeenCalled();
    });

    it('should throw error if signing identity not in wallet for appOrDelegatedID', async () => {
      const signingIdentityAddress = 'iTestIdentity123@';
      const differentIdentityAddress = 'iDifferentIdentity456@';

      const mockRequest = createMockRequest({
        isSigned: true,
        hasAppOrDelegatedID: true,
        signature: {
          identityID: {toIAddress: jest.fn().mockReturnValue(signingIdentityAddress)},
        },
      });

      mockedVerifyGenericRequest.mockResolvedValue({verified: true});

      const mockIdentity: Partial<Identity> = {
        identity: {identityaddress: differentIdentityAddress} as Identity['identity'],
      };

      const mockGetState = createMockGetState({
        identity: {identities: [mockIdentity as Identity]},
      });

      await expect(checkGenericRequest(chainId, mockRequest, mockGetState)).rejects.toThrow(
        'The signing identity is not in the wallet, so having an app or delegated ID is not allowed.'
      );
    });

    it('should pass for signed request without appOrDelegatedID', async () => {
      const mockRequest = createMockRequest({
        isSigned: true,
        hasAppOrDelegatedID: false,
      });

      mockedVerifyGenericRequest.mockResolvedValue({verified: true});

      const mockGetState = createMockGetState();

      await checkGenericRequest(chainId, mockRequest, mockGetState);

      expect(mockedVerifyGenericRequest).toHaveBeenCalledWith(chainId, mockRequest);
      expect(mockGetState).not.toHaveBeenCalled();
    });
  });
});
