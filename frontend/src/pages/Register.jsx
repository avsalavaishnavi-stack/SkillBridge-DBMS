import { useState } from "react";
import axios from "axios";

function Register({ onLogin }) {
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        department: "",
        year: "",
        bio: ""
    });

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        try {
            const response = await axios.post(
                "http://localhost:5000/api/auth/register",
                {
                    name: form.name,
                    email: form.email,
                    password: form.password,
                    department: form.department,
                    year: form.year ? Number(form.year) : null,
                    bio: form.bio
                }
            );

            setMessage(response.data.message);

            setForm({
                name: "",
                email: "",
                password: "",
                department: "",
                year: "",
                bio: ""
            });

            setTimeout(() => {
                if (onLogin) {
                    onLogin();
                }
            }, 1000);
        } catch (error) {
            setError(
                error.response?.data?.error ||
                "Registration failed."
            );
        }
    };

    return (
        <div className="post-task">
            <h1>Create Account</h1>

            <p>Join SkillBridge and exchange your skills.</p>

            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={form.name}
                    onChange={handleChange}
                    required
                />

                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                    required
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange}
                    required
                />

                <input
                    type="text"
                    name="department"
                    placeholder="Department"
                    value={form.department}
                    onChange={handleChange}
                />

                <input
                    type="number"
                    name="year"
                    placeholder="Year"
                    value={form.year}
                    onChange={handleChange}
                    min="1"
                    max="6"
                />

                <textarea
                    name="bio"
                    placeholder="Tell us about yourself"
                    value={form.bio}
                    onChange={handleChange}
                />

                <button type="submit">
                    Create Account
                </button>
            </form>

            {message && (
                <p>{message}</p>
            )}

            {error && (
                <p>{error}</p>
            )}
        </div>
    );
}

export default Register;