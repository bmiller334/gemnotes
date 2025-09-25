import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Button, Snackbar, Alert } from '@mui/material';

function ReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered:', r);
    },
    onRegisterError(error) {
      console.log('SW registration error:', error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  return (
    <>
      <Snackbar
        open={offlineReady}
        autoHideDuration={6000}
        onClose={close}
        message="App is ready to work offline."
      />
      <Snackbar
        open={needRefresh}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity="info"
          action={
            <>
              <Button color="inherit" size="small" onClick={() => updateServiceWorker(true)}>
                Reload
              </Button>
              <Button color="inherit" size="small" onClick={close}>
                Close
              </Button>
            </>
          }
        >
          A new version is available!
        </Alert>
      </Snackbar>
    </>
  );
}

export default ReloadPrompt;
