import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import axiosInstance, { setAuthToken } from '../api/axiosInstance';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const {
    isAuthenticated: isAuth0Authenticated,
    isLoading: isAuth0Loading,
    getAccessTokenSilently,
    loginWithRedirect,
    logout: auth0Logout,
  } = useAuth0();

  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const syncUser = async () => {
      if (isAuth0Authenticated) {
        try {
          const token = await getAccessTokenSilently();
          setAuthToken(token);

          // Get database profile & role from the backend /me endpoint
          const response = await axiosInstance.get('/auth/me');
          if (response.data && response.data.data) {
            setUser(response.data.data);
            setIsAuthenticated(true);
          } else {
            setUser(null);
            setIsAuthenticated(false);
            setAuthToken(null);
          }
        } catch (error) {
          console.error('Error syncing user with backend:', error);
          setUser(null);
          setIsAuthenticated(false);
          setAuthToken(null);
        } finally {
          setIsLoading(false);
        }
      } else {
        if (!isAuth0Loading) {
          setUser(null);
          setIsAuthenticated(false);
          setAuthToken(null);
          setIsLoading(false);
        }
      }
    };

    syncUser();
  }, [isAuth0Authenticated, isAuth0Loading, getAccessTokenSilently]);

  const login = async () => {
    setIsLoading(true);
    await loginWithRedirect();
  };

  const logout = async () => {
    setAuthToken(null);
    setUser(null);
    setIsAuthenticated(false);
    await auth0Logout({ logoutParams: { returnTo: window.location.origin } });
  };

  const combinedLoading = isLoading || isAuth0Loading;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: combinedLoading,
        loading: combinedLoading,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
