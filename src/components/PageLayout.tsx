import React from 'react';
import {Box, CircularProgress, Container, SxProps, Theme, Typography} from '@mui/material';

import {VerusIdLogo} from '#/images';

interface PageLayoutProps {
  children?: React.ReactNode;
  title?: string;
  showLogo?: boolean;
  logoWidth?: string;
  logoHeight?: string;
  footerContent?: React.ReactNode;
  contentStyle?: SxProps<Theme>;
  containerStyle?: SxProps<Theme>;
  loading?: boolean;
}

const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  title,
  showLogo = true,
  logoWidth = '55%',
  logoHeight = '10%',
  footerContent,
  contentStyle = {},
  containerStyle = {},
  loading = false,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        height: '100%',
        ...containerStyle,
      }}
    >
      <Container
        maxWidth={false}
        sx={{
          height: '100%',
          display: 'flex',
          padding: 4,
          flexDirection: 'column',
          alignItems: 'center',
          flex: 1,
        }}
      >
        {showLogo && (
          <Box
            component="img"
            src={VerusIdLogo}
            alt="Verus ID Logo"
            sx={{
              width: logoWidth,
              height: logoHeight,
              objectFit: 'contain',
            }}
          />
        )}

        {title && (
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              padding: 1,
            }}
          >
            <Typography color="text.secondary" gutterBottom>
              {title}
            </Typography>
          </Box>
        )}

        {/* Main content area */}
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            minHeight: 0,
            ...contentStyle,
          }}
        >
          {loading ? (
            <Box
              sx={{
                display: 'flex',
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            children
          )}
        </Box>

        {/* Footer area */}
        {footerContent && (
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'flex-end',
              justifyContent: 'flex-end',
              marginTop: 'auto',
              paddingTop: 2,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-end',
              }}
            >
              {footerContent}
            </Box>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default PageLayout;
