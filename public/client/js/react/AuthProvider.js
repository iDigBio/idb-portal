import React, {createContext, useEffect, useState} from 'react';

export const AuthContext = createContext(null);
export const AuthProvider = ({ children, initialUser  }) => {
    const [user, setUser] = useState(initialUser)

    // Check if user has a valid session on the server, if yes the server will respond with data about the user's session.
    useEffect(() => {
        (async () => {
            try {
                const response = await fetch('/api/session');
                if (response.ok) {
                    const data = await response.json(); // Added await here
                    if (data.user) {
                        login(data.user);
                    }
                }
            } catch (error) {
                console.error('Error checking session:', error);
            }
        })();
    }, []);

    const login = (userData) => {
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        console.log('firing logout!')
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

