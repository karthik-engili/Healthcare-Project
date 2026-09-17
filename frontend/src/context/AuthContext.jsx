import React, { createContext, useContext, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user_info');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [role, setRole] = useState(() => {
    return localStorage.getItem('user_role') || 'patient';
  });
  const [loading, setLoading] = useState(false);

  const loginUser = async (credentials) => {
    setLoading(true);
    try {
      // Attempt backend JWT login
      const response = await api.post('/api/auth/login/', {
        username: credentials.username,
        password: credentials.password,
      });

      const { access, refresh } = response.data;
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);

      // Fetch profile from backend
      let userInfo = {
        username: credentials.username,
        name: credentials.username.charAt(0).toUpperCase() + credentials.username.slice(1),
        email: `${credentials.username}@sevahealth.org`,
        role: credentials.role || 'patient',
      };

      try {
        const profileRes = await api.get('/api/auth/profile/');
        if (profileRes.data) {
          const resData = profileRes.data;
          const pFullName = resData.full_name || 
            (resData.first_name ? `${resData.first_name} ${resData.last_name || ''}`.trim() : null);

          userInfo = {
            ...userInfo,
            ...resData,
            name: (pFullName && typeof pFullName === 'string' && isNaN(Number(pFullName)) && pFullName.trim() !== '')
                  ? pFullName
                  : (credentials.username && isNaN(Number(credentials.username))
                      ? credentials.username.charAt(0).toUpperCase() + credentials.username.slice(1)
                      : userInfo.name),
          };
        }
      } catch (pErr) {
        console.warn('Profile fetch error:', pErr);
      }

      setUser(userInfo);
      setRole(credentials.role || 'patient');
      localStorage.setItem('user_info', JSON.stringify(userInfo));
      localStorage.setItem('user_role', credentials.role || 'patient');
      sessionStorage.setItem('profile_popup_eligible', 'true');
      setLoading(false);
      return { success: true };
    } catch (err) {
      console.error('Backend login failed:', err);

      const isOfflineOrUnreachable =
        !err.response ||
        err.response?.status === 503 ||
        err.response?.status === 500 ||
        err.code === 'ERR_NETWORK' ||
        err.message?.includes('Network Error');

      // Fallback: If backend server is offline or returns 503 proxy error, seamlessly activate Demo Mode Login
      if (isOfflineOrUnreachable) {
        console.info('Backend server is offline. Activating Demo Mode Login...');
        const demoUser = {
          username: credentials.username || 'demo_user',
          name: credentials.role === 'doctor' ? 'Dr. Ananya Sharma' : 'Ramesh Kumar',
          email: `${credentials.username || 'user'}@sevahealth.org`,
          role: credentials.role || 'patient',
          phone: credentials.role === 'doctor' ? '+91 98111 22334' : '+91 98765 43210',
        };
        setUser(demoUser);
        setRole(credentials.role || 'patient');
        localStorage.setItem('user_info', JSON.stringify(demoUser));
        localStorage.setItem('user_role', credentials.role || 'patient');
        setLoading(false);
        return { success: true, isDemo: true };
      }

      setLoading(false);
      return { success: false, error: err.response?.data?.detail || 'Invalid credentials' };
    }
  };

  const registerUser = async (userData) => {
    setLoading(true);
    try {
      const payload = {
        username: userData.username,
        password: userData.password,
        email: userData.email || '',
        role: userData.role || 'patient',
        phone_number: userData.phone || userData.phone_number || '',
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        date_of_birth: userData.date_of_birth || null,
        gender: userData.gender || '',
        address: userData.address || userData.village || '',
        village_town: userData.village || userData.address || '',
        emergency_contact_number: userData.emergency_contact || userData.emergency_contact_number || '',
        preferred_language: userData.language_preference || userData.preferred_language || 'English',
      };
      const response = await api.post('/api/auth/register/', payload);
      if (response.data?.access) {
        localStorage.setItem('access_token', response.data.access);
      }
      if (response.data?.refresh) {
        localStorage.setItem('refresh_token', response.data.refresh);
      }
      setLoading(false);
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Backend registration failed:', err);

      const isOfflineOrUnreachable =
        !err.response ||
        err.response?.status === 503 ||
        err.response?.status === 500 ||
        err.code === 'ERR_NETWORK' ||
        err.message?.includes('Network Error');

      if (isOfflineOrUnreachable) {
        console.info('Backend server is offline. Simulating Demo Registration...');
        setLoading(false);
        return { success: true, isDemo: true };
      }

      setLoading(false);
      return { success: false, error: err.response?.data ? JSON.stringify(err.response.data) : 'Registration failed' };
    }
  };

  const updateUser = (newUserData) => {
    setUser((prev) => {
      const updated = { ...prev, ...newUserData };
      if (newUserData.first_name || newUserData.username) {
        updated.name = newUserData.first_name || newUserData.username || prev?.name;
      }
      localStorage.setItem('user_info', JSON.stringify(updated));
      return updated;
    });
  };

  const logoutUser = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_info');
    localStorage.removeItem('user_role');
    sessionStorage.removeItem('profile_popup_eligible');
    sessionStorage.removeItem('profile_popup_dismissed');
    setUser(null);
    setRole('patient');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        loginUser,
        registerUser,
        updateUser,
        logoutUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
