import BN from 'bn.js';
import {
  AuthenticationRequestDetails,
  AuthenticationRequestOrdinalVDXFObject,
  CompactIAddressObject,
  GenericRequest,
  LoginConsentRequest,
  RecipientConstraint,
} from 'verus-typescript-primitives';

import {Identity} from '#/types/identity';

import {extractConsentDataV1, extractConsentDataV2} from './consentDataExtractors';

describe('consentDataExtractors', () => {
  describe('extractConsentDataV1', () => {
    it('should extract consent data from LoginConsentRequest', () => {
      const mockRequest = {
        system_id: 'iJhCezBExJHvtyH3fSUwhzybVMVcCL9Gjf',
        challenge: {
          requested_access: [{vdxfkey: 'iCVH2MqhgvFiGu3NqcRK9FgDjfRtpQQkCy'}],
          redirect_uris: [{uri: 'https://example.com/callback'}],
        },
      } as unknown as LoginConsentRequest;

      const mockSignedBy = {
        fullyqualifiedname: 'testuser@',
      } as unknown as Identity;

      const result = extractConsentDataV1(mockRequest, mockSignedBy);

      expect(result).toHaveProperty('signerFqn');
      expect(result).toHaveProperty('permissionsLabels');
      expect(result).toHaveProperty('systemId');
      expect(result).toHaveProperty('responseURIsLabels');
      expect(result.systemId).toBe('iJhCezBExJHvtyH3fSUwhzybVMVcCL9Gjf');
      expect(Array.isArray(result.permissionsLabels)).toBe(true);
      expect(Array.isArray(result.responseURIsLabels)).toBe(true);
      expect(result.responseURIsLabels).toEqual(['https://example.com/callback']);
    });
  });

  describe('extractConsentDataV2', () => {
    it('should extract consent data from GenericRequest with authentication detail', () => {
      const mockAuthRequestDetail = {
        expiryTime: new BN(0),
        hasExpiryTime: () => true,
        recipientConstraints: [
          new RecipientConstraint({
            type: RecipientConstraint.REQUIRED_ID,
            identity: new CompactIAddressObject({
              type: CompactIAddressObject.TYPE_I_ADDRESS,
              address: 'iNtjYwzzo1NLjdjtn1KrnXnKJoK9cbhYPd',
            }),
          }),
          new RecipientConstraint({
            type: RecipientConstraint.REQUIRED_SYSTEM,
            identity: new CompactIAddressObject({
              type: CompactIAddressObject.TYPE_I_ADDRESS,
              address: 'iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq',
            }),
          }),
          new RecipientConstraint({
            type: RecipientConstraint.REQUIRED_PARENT,
            identity: new CompactIAddressObject({
              type: CompactIAddressObject.TYPE_I_ADDRESS,
              address: 'iLvocymhpjbsQUaeXaJyn1MVQKxyCpEV8T',
            }),
          }),
        ],
        responseURIs: [],
      } as unknown as AuthenticationRequestDetails;

      const mockOrdinalWrapper = new AuthenticationRequestOrdinalVDXFObject({
        data: mockAuthRequestDetail,
      });

      const mockRequest = {
        signature: {
          systemID: {
            toIAddress: () => 'iJhCezBExJHvtyH3fSUwhzybVMVcCL9Gjf',
          },
        },
        details: [mockOrdinalWrapper],
        responseURIs: [],
        hasAppOrDelegatedID: () => false,
      } as unknown as GenericRequest;

      const mockSignedBy = {
        fullyqualifiedname: 'testuser@',
      } as unknown as Identity;

      const mockPreppedAuthDetail = {
        constraintsLabels: [
          'Required identity: Mbnv.VRSCTEST@',
          'Required system: VRSCTEST',
          'Required parent: MJS.VRSCTEST@',
        ],
        expiryLabel: 'Wed, Dec 31, 1969, 16:00:00',
      };

      const result = extractConsentDataV2(
        mockRequest,
        mockSignedBy,
        0,
        null,
        mockPreppedAuthDetail
      );

      expect(result.signerFqn).toBe('testuser@');
      expect(result.permissionsLabels).toEqual([]);
      expect(result.systemId).toBe('iJhCezBExJHvtyH3fSUwhzybVMVcCL9Gjf');
      expect(result.constraintsLabels).toEqual([
        'Required identity: Mbnv.VRSCTEST@',
        'Required system: VRSCTEST',
        'Required parent: MJS.VRSCTEST@',
      ]);

      // Make sure it has an auth detail and calculate these fields based on it
      expect(result.responseURIsLabels).toEqual([]);
      expect(result.expiryLabel).toBe('Wed, Dec 31, 1969, 16:00:00');
    });
  });
});
