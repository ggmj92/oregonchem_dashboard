import React, { useState, useEffect } from "react";
import { auth } from "../../firebase/firebase";
import {
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Check if user is logged in on component mount
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                navigate("/dashboard"); // Redirect to dashboard if logged in
            }
        });

        return () => unsubscribe(); // Cleanup subscription on unmount
    }, [navigate]);

    const handleLogin = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            setLoading(false);
            navigate("/dashboard");
        } catch (error) {
            setError(error.message);
            setLoading(false);
        }
    };

    const handleResetPassword = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await sendPasswordResetEmail(auth, email);
            setLoading(false);
            alert("Password reset email sent!");
        } catch (error) {
            setError(error.message);
            setLoading(false);
        }
    };

    return (
        <>
            <div className="login_container">
                <div className="login_logo" style={{ fontSize: '28px', fontWeight: 'bold', color: '#2c3e50', marginBottom: '30px' }}>
                    Química Industrial Dashboard
                </div>

                <form onSubmit={handleLogin}>
                    <div className="login_input_container">
                        <svg className="login_icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                            <polyline points="22,6 12,13 2,6"></polyline>
                        </svg>
                        <div className="login_input_wrapper">
                            <div className="login_separator"></div>
                            <input
                                type="email"
                                placeholder="Email"
                                className="login_input_field"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="login_input_container">
                        <svg className="login_icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                        <div className="login_input_wrapper">
                            <div className="login_separator"></div>
                            <input
                                type="password"
                                placeholder="Contraseña"
                                className="login_input_field"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="login_button"
                        disabled={loading}
                    >
                        {loading ? "Cargando..." : "Login"}
                    </button>
                </form>

                {error && <p className="error-message">{error}</p>}

                <a href="#" className="forgot-password" onClick={handleResetPassword}>
                    Recuperar contraseña
                </a>
            </div>
        </>
    );
};

export default Login;