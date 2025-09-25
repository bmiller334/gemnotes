import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, CircularProgress } from '@mui/material';

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    // While the authentication state is loading, display a spinner.
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!currentUser) {
    // If loading is finished and there's no user, redirect to login.
    return <Navigate to="/login" />;
  }

  // If loading is finished and there is a user, render the requested page.
  return children;
};

export default ProtectedRoute;
