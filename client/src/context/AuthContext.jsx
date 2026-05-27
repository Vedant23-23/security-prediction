import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userInfo');
  };

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
    setLoading(false);

    // Setup global axios interceptor for 401 Auth errors
    import('axios').then(axios => {
        axios.default.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response && error.response.status === 401) {
                    console.log('401 Unauthorized detected. Logging out mock/invalid user.');
                    logout();
                     // Instead of redirecting right away, we let components handle the unauthenticated state or we can optionally reload.
                     window.location.href = '/login';
                }
                return Promise.reject(error);
            }
        );
    });
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.removeItem('userInfo'); // clear old
    localStorage.setItem('userInfo', JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
