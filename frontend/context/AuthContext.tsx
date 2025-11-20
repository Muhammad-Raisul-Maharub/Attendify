
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User, Role } from '../types';
import { loginUser, addUser } from '../services/mockApi';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, role: Role) => Promise<{ success: boolean; message?: string }>;
  signup: (userData: Omit<User, 'id' | 'auth_uid'>) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('attendify-user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('attendify-user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string, role: Role): Promise<{ success: boolean; message?: string }> => {
    setLoading(true);
    try {
        const result = await loginUser(email, password, role);
        if (result.success && result.user) {
            setUser(result.user);
            localStorage.setItem('attendify-user', JSON.stringify(result.user));
            return { success: true };
        }
        return { success: false, message: result.message || 'Login failed' };
    } catch (error) {
        console.error("Login error", error);
        return { success: false, message: "An unexpected error occurred" };
    } finally {
        setLoading(false);
    }
  };

  const signup = async (userData: Omit<User, 'id' | 'auth_uid'>): Promise<{ success: boolean; message?: string }> => {
      setLoading(true);
      try {
          const result = await addUser(userData);
          if (result.success) {
             return { success: true };
          }
          return { success: false, message: result.message || 'Signup failed' };
      } catch (e) {
           console.error("Signup error", e);
           return { success: false, message: "An unexpected error occurred" };
      } finally {
          setLoading(false);
      }
  }

  const logout = () => {
    setUser(null);
    localStorage.removeItem('attendify-user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};