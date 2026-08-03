export const LIST_ITEM_SLOTS = {
  standard: {
    primary: {color: 'text.secondary' as const, variant: 'body2' as const},
    secondary: {variant: 'subtitle1' as const, color: 'text.primary' as const},
  },
  nested: {
    primary: {variant: 'body2' as const, sx: {lineHeight: 1.3}},
  },
  detail: {
    primary: {
      color: 'text.secondary' as const,
      variant: 'caption' as const,
      sx: {lineHeight: 1.2},
    },
    secondary: {variant: 'body2' as const, color: 'text.primary' as const, sx: {lineHeight: 1.3}},
  },
  collapsible: {
    primary: {color: 'text.secondary' as const, variant: 'body2' as const},
    secondary: {variant: 'subtitle1' as const, color: 'text.primary' as const},
  },
} as const;
