'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

interface User {
  id: string;
  name: string;
  email: string;
  bio: string;
  role: string;
  avatar?: string; 
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => void;  // เพิ่ม logout ใน context type
  setUser: (user: User | null) => void;
  login: (token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: () => {}, // default noop
  setUser: () => {}, 
  login: async () => {},
  
});


export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(res.data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
  
    fetchUser();
  }, []);
  

  const login = async (token: string) => {
    setLoading(true);
    localStorage.setItem('token', token); // ถ้าคุณใช้ localStorage
    try {
      const res = await axios.get('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`, // ส่ง token ไปเช็ค user
        },
      });
      setUser(res.data);
    } catch (error) {
      console.error('Login failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };
  
  
  // ฟังก์ชัน logout
  const logout = async () => {
    setLoading(true);
    try {
      await axios.post('/api/auth/logout');
      localStorage.removeItem('token');
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
