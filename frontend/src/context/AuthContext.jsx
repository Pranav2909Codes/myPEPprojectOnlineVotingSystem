import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            setUser(JSON.parse(userInfo));
        }
        setLoading(false);
    }, []);

    const API = import.meta.env.VITE_API_URL || 'http://localhost:5001';

    const login = async (email, password) => {
        const response = await fetch(`${API}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        let data;
        try {
            data = await response.json();
        } catch (e) {
            const text = await response.text();
            return { success: false, message: text || 'Server error' };
        }

        if (response.ok) {
            localStorage.setItem('userInfo', JSON.stringify(data));
            setUser(data);
            return { success: true };
        } else {
            return { success: false, message: data.message };
        }
    };

    const register = async (name, email, password, role = 'user') => {
        const response = await fetch(`${API}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, role }),
        });

        let data;
        try {
            data = await response.json();
        } catch (e) {
            const text = await response.text();
            return { success: false, message: text || 'Server error' };
        }

        if (response.ok) {
            localStorage.setItem('userInfo', JSON.stringify(data));
            setUser(data);
            return { success: true };
        } else {
            return { success: false, message: data.message };
        }
    };

    const logout = () => {
        localStorage.removeItem('userInfo');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
