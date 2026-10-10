
import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import PostTask from "./pages/PostTask";
import MyApplications from "./pages/MyApplications";
import ApplicationManagement from "./pages/ApplicationManagement";
import Assignments from "./pages/Assignments";
import Submission from "./pages/Submission";
import Review from "./pages/Review";
import SkillMatching from "./pages/SkillMatching";
import MySkills from "./pages/MySkills";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import "./App.css";

const navigationGroups = [
    {
        title: "WORKSPACE",
        items: [
            { id: "dashboard", label: "Dashboard", icon: "⌂" },
            { id: "matching", label: "Skill Matching", icon: "✧" },
            { id: "skills", label: "My Skills", icon: "◇" },
            { id: "profile", label: "My Profile", icon: "○" },
        ],
    },
    {
        title: "TASK CENTER",
        items: [
            { id: "post", label: "Post a Task", icon: "+" },
            { id: "applications", label: "My Applications", icon: "▤" },
            { id: "manage", label: "Manage Applications", icon: "☷" },
            { id: "assignments", label: "Assignments", icon: "✓" },
            { id: "submission", label: "Submit Work", icon: "↗" },
            { id: "review", label: "Reviews", icon: "☆" },
        ],
    },
];

const pageTitles = {
    dashboard: "Dashboard",
    matching: "Skill Matching",
    skills: "My Skills",
    profile: "My Profile",
    post: "Post a Task",
    applications: "My Applications",
    manage: "Manage Applications",
    assignments: "Assignments",
    submission: "Submit Work",
    review: "Reviews",
};

function App() {
    const [student, setStudent] = useState(() => {
        try {
            const savedStudent = localStorage.getItem("skillbridge_student");
            return savedStudent ? JSON.parse(savedStudent) : null;
        } catch {
            return null;
        }
    });

    const [page, setPage] = useState("dashboard");
    const [authPage, setAuthPage] = useState("login");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogin = (studentData) => {
        setStudent(studentData);
        setPage("dashboard");
        setAuthPage("login");
    };

    const handleLogout = () => {
        localStorage.removeItem("skillbridge_token");
        localStorage.removeItem("skillbridge_student");
        setStudent(null);
        setAuthPage("login");
        setSidebarOpen(false);
    };

    const navigate = (nextPage) => {
        setPage(nextPage);
        setSidebarOpen(false);
    };

    if (!student) {
        if (authPage === "register") {
            return <Register onLogin={() => setAuthPage("login")} />;
        }

        return (
            <Login
                onLogin={handleLogin}
                onRegister={() => setAuthPage("register")}
            />
        );
    }

    const studentName = student.name || "Student";

    const initials = studentName
        .trim()
        .split(/\s+/)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return (
        <div className="app-shell">
            {sidebarOpen && (
                <button
                    className="sidebar-overlay"
                    aria-label="Close navigation"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
                <button
                    className="brand"
                    onClick={() => navigate("dashboard")}
                    aria-label="Go to dashboard"
                >
                    <span className="brand-icon">✦</span>
                    <span>
                        SkillBridge
                        <small>STUDENT COMMUNITY</small>
                    </span>
                </button>

                <div className="sidebar-profile">
                    <div className="avatar">{initials}</div>
                    <div className="sidebar-profile-info">
                        <strong>{studentName}</strong>
                        <span>Student workspace</span>
                    </div>
                </div>

                <nav className="side-navigation" aria-label="Main navigation">
                    {navigationGroups.map((group) => (
                        <div className="nav-group" key={group.title}>
                            <p className="nav-group-title">{group.title}</p>

                            {group.items.map((item) => (
                                <button
                                    key={item.id}
                                    className={`nav-item ${
                                        page === item.id ? "nav-item-active" : ""
                                    }`}
                                    onClick={() => navigate(item.id)}
                                    aria-current={
                                        page === item.id ? "page" : undefined
                                    }
                                >
                                    <span className="nav-icon">{item.icon}</span>
                                    <span>{item.label}</span>
                                    {page === item.id && (
                                        <span className="nav-active-dot" />
                                    )}
                                </button>
                            ))}
                        </div>
                    ))}
                </nav>

                <div className="sidebar-bottom">
                    <div className="sidebar-tip">
                        <span className="tip-icon">✧</span>
                        <strong>Keep growing!</strong>
                        <p>
                            Learn new skills, collaborate, and build your
                            portfolio.
                        </p>
                    </div>

                    <button className="logout-button" onClick={handleLogout}>
                        <span>↪</span> Sign out
                    </button>
                </div>
            </aside>

            <div className="main-panel">
                <header className="topbar">
                    <div className="topbar-left">
                        <button
                            className="menu-toggle"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            aria-label="Toggle navigation"
                        >
                            ☰
                        </button>

                        <div>
                            <span className="breadcrumb">Workspace /</span>
                            <strong>{pageTitles[page]}</strong>
                        </div>
                    </div>

                    <div className="topbar-right">
                        <span className="online-indicator" />
                        <span className="online-label">
                            Student workspace
                        </span>

                        <button
                            className="topbar-avatar"
                            onClick={() => navigate("profile")}
                            aria-label="Open profile"
                            title="My profile"
                        >
                            {initials}
                        </button>
                    </div>
                </header>

                <main className="main-content">
                    <section className="welcome-banner">
                        <div className="welcome-copy">
                            <span className="welcome-eyebrow">
                                YOUR SKILLS. YOUR OPPORTUNITIES.
                            </span>

                            <h1>
                                Welcome back, {studentName.split(" ")[0]}!
                                <span className="wave"> ✨</span>
                            </h1>

                            <p>
                                Discover opportunities, collaborate with peers,
                                and turn your skills into real experience.
                            </p>

                            <div className="welcome-actions">
                                <button
                                    className="primary-action"
                                    onClick={() => navigate("dashboard")}
                                >
                                    Explore tasks <span>→</span>
                                </button>

                                <button
                                    className="secondary-action"
                                    onClick={() => navigate("post")}
                                >
                                    + Post a task
                                </button>
                            </div>
                        </div>

                        <div className="welcome-art" aria-hidden="true">
                            <div className="art-circle art-circle-one" />
                            <div className="art-circle art-circle-two" />

                            <div className="art-card">
                                <span className="art-sparkle">✦</span>
                                <strong>Grow together.</strong>
                                <span>Build something meaningful.</span>

                                <div className="art-avatars">
                                    <span>A</span>
                                    <span>S</span>
                                    <span>V</span>
                                    <span>+</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="page-heading">
                        <div>
                            <span className="section-eyebrow">
                                YOUR WORKSPACE
                            </span>
                            <h2>{pageTitles[page]}</h2>
                            <p>
                                Everything you need to learn and collaborate.
                            </p>
                        </div>

                        <span className="date-label">
                            ✦ &nbsp; Learn · Build · Collaborate
                        </span>
                    </div>

                    <section className="page-content">
                        {page === "dashboard" && <Dashboard />}
                        {page === "matching" && <SkillMatching />}
                        {page === "skills" && <MySkills />}
                        {page === "profile" && <Profile />}
                        {page === "post" && <PostTask />}
                        {page === "applications" && <MyApplications />}
                        {page === "manage" && <ApplicationManagement />}
                        {page === "assignments" && <Assignments />}
                        {page === "submission" && <Submission />}
                        {page === "review" && <Review />}
                    </section>

                    <footer className="app-footer">
                        <span>✦ SkillBridge</span>
                        <span>Connect skills with opportunities.</span>
                    </footer>
                </main>
            </div>
        </div>
    );
}

export default App;
