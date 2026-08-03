import React from 'react';

import CollapsibleListSection from '#/components/CollapsibleListSection';
import NestedListItem from '#/components/NestedListItem';
import {Identity} from '#/types/identity';
import {createIdentityDescriptor} from '#/utils/identity';

interface IdentityField {
  label: string;
  value: string;
  visible?: boolean;
}

interface IdentityDetailsProps {
  identity: Identity | null | undefined;
  revocationAuthority?: Identity | null | undefined;
  recoveryAuthority?: Identity | null | undefined;
  systemDescriptor?: string;
  headerLabel?: string;
  initiallyExpanded?: boolean;
  divider?: boolean;
}

const IdentityDetails: React.FC<IdentityDetailsProps> = ({
  identity,
  revocationAuthority,
  recoveryAuthority,
  systemDescriptor,
  headerLabel = 'Requested by',
  initiallyExpanded = false,
  divider = true,
}) => {
  const identityName = (identity?.identity?.name as string) || '-';
  const identityAddress = identity?.identity?.identityaddress || '-';
  const headerPrimary = identity?.identity?.identityaddress
    ? `${identityName} (${identityAddress})`
    : identityName;

  const fields: IdentityField[] = [
    {
      label: 'Name',
      value: identityName,
      visible: true,
    },
    {
      label: 'Identity Address',
      value: identityAddress,
      visible: true,
    },
    {
      label: 'Status',
      value: (identity?.status as string) || '-',
      visible: true,
    },
    {
      label: 'Revocation Authority',
      value: createIdentityDescriptor(revocationAuthority),
      visible: !!revocationAuthority,
    },
    {
      label: 'Recovery Authority',
      value: createIdentityDescriptor(recoveryAuthority),
      visible: !!recoveryAuthority,
    },
    {
      label: 'System',
      value: systemDescriptor || '-',
      visible: !!systemDescriptor,
    },
    ...(identity?.identity?.primaryaddresses ?? []).map((address, index) => ({
      label: `Primary Address #${index + 1}`,
      value: (address as string) || '-',
      visible: !!address,
    })),
  ];

  return (
    <CollapsibleListSection
      title={headerPrimary}
      subtitle={headerLabel}
      divider={divider}
      initiallyExpanded={initiallyExpanded}
      collapseHint={false}
    >
      {fields
        .filter(field => field.visible !== false)
        .map(field => (
          <NestedListItem
            key={field.label}
            primary={field.label}
            secondary={field.value}
            variant="detail"
          />
        ))}
    </CollapsibleListSection>
  );
};

export default IdentityDetails;
