import { useState } from "react";
import axios from "axios";

function Login({ onLogin, onRegister }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        try {
            const response = await axios.post(
                "https://skillbridge-api-2jff.onrender.com/api/auth/login",
                {
                    email,
                    password
                }
            );

            localStorage.setItem(
                "skillbridge_token",
                response.data.token
            );

            localStorage.setItem(
                "skillbridge_student",
                JSON.stringify(response.data.student)
            );

            if (onLogin) {
                onLogin(response.data.student);
            }
        } catch (error) {
            setError(
                error.response?.data?.error ||
                "Login failed."
            );
        }
    };

    return (
        <div className="post-task">
            <h1>Welcome to SkillBridge</h1>

            <p>Login to continue to your student workspace.</p>

            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <button type="submit">
                    Login
                </button>
            </form>

            {error && (
                <p>{error}</p>
            )}

            <p style={{ marginTop: "20px" }}>
                New to SkillBridge?
            </p>

            <button
                type="button"
                onClick={onRegister}
            >
                Create Account
            </button>
        </div>
    );
}

export default Login;