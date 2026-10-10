
import { useEffect, useState } from "react";
import { getTasks, applyForTask } from "../api";
import axios from "axios";

function Dashboard() {
    const [tasks, setTasks] = useState([]);
    const [stats, setStats] = useState({
        totalTasks: 0,
        applications: 0,
        acceptedApplications: 0,
        completedWork: 0,
        averageRating: 0
    });

    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");
    const [skill, setSkill] = useState("All");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [applyingTaskId, setApplyingTaskId] = useState(null);

    useEffect(() => {
        loadTasks();
        loadDashboardStats();
    }, []);

    const loadTasks = async () => {
        setLoading(true);

        try {
            const response = await getTasks();
            setTasks(Array.isArray(response.data) ? response.data : []);
            setError("");
        } catch (err) {
            console.error("Task loading error:", err);
            setError("Unable to load tasks. Please check that the backend is running.");
        } finally {
            setLoading(false);
        }
    };

    const loadDashboardStats = async () => {
        try {
            const savedStudent = localStorage.getItem("skillbridge_student");

            if (!savedStudent) return;

            const student = JSON.parse(savedStudent);

            const response = await axios.get(
                `https://skillbridge-api-2jff.onrender.com/api/dashboard/${student.student_id}`
            );

            setStats((previous) => ({
                ...previous,
                ...response.data
            }));
        } catch (err) {
            console.error("Dashboard statistics error:", err);
        }
    };

    const handleApply = async (task) => {
        setMessage("");
        setError("");

        if (String(task.status || "").toUpperCase() !== "OPEN") {
            setError("This task is not currently accepting applications.");
            return;
        }

        try {
            const savedStudent = localStorage.getItem("skillbridge_student");

            if (!savedStudent) {
                setError("Please log in before applying for a task.");
                return;
            }

            const student = JSON.parse(savedStudent);
            setApplyingTaskId(task.task_id);

            await applyForTask({
                task_id: task.task_id,
                student_id: student.student_id,
                message: "I would like to apply for this task."
            });

            setMessage(`Your application for "${task.title}" was submitted.`);
            await loadDashboardStats();
        } catch (err) {
            console.error("Application error:", err);
            setError(
                err.response?.data?.error ||
                "Unable to submit your application. Please check the backend API."
            );
        } finally {
            setApplyingTaskId(null);
        }
    };

    const categories = [
        "All",
        ...new Set(
            tasks.map((task) => task.category).filter(Boolean)
        )
    ];

    const skills = [
        "All",
        ...new Set(
            tasks.map((task) => task.required_skill).filter(Boolean)
        )
    ];

    const filteredTasks = tasks.filter((task) => {
        const searchText = search.trim().toLowerCase();

        const matchesSearch =
            (task.title || "").toLowerCase().includes(searchText) ||
            (task.description || "").toLowerCase().includes(searchText);

        const matchesCategory =
            category === "All" || task.category === category;

        const matchesSkill =
            skill === "All" || task.required_skill === skill;

        return matchesSearch && matchesCategory && matchesSkill;
    });

    const statCards = [
        {
            label: "Available Tasks",
            value: stats.totalTasks,
            icon: "📋",
            description: "Tasks listed on SkillBridge"
        },
        {
            label: "My Applications",
            value: stats.applications,
            icon: "📨",
            description: "Applications submitted"
        },
        {
            label: "Accepted",
            value: stats.acceptedApplications,
            icon: "✓",
            description: "Applications accepted"
        },
        {
            label: "Completed Work",
            value: stats.completedWork,
            icon: "🎯",
            description: "Completed assignments"
        },
        {
            label: "Average Rating",
            value: stats.averageRating,
            icon: "⭐",
            description: "Your review rating"
        }
    ];

    return (
        <div className="dashboard">
            <section className="dashboard-intro">
                <div>
                    <span className="dashboard-eyebrow">
                        YOUR LEARNING SPACE
                    </span>
                    <h1>Student Dashboard</h1>
                    <p>
                        Discover opportunities, showcase your skills,
                        and turn your knowledge into experience.
                    </p>
                </div>
            </section>

            <section className="stats-grid">
                {statCards.map((stat) => (
                    <div className="stat-card" key={stat.label}>
                        <div className="stat-card-top">
                            <span className="stat-icon">{stat.icon}</span>
                            <span className="stat-label">{stat.label}</span>
                        </div>
                        <strong className="stat-value">
                            {stat.value ?? 0}
                        </strong>
                        <p className="stat-description">
                            {stat.description}
                        </p>
                    </div>
                ))}
            </section>

            <section className="task-search-panel">
                <div className="section-heading">
                    <div>
                        <h2>Find your next opportunity</h2>
                        <p>Search tasks and filter them by category or skill.</p>
                    </div>
                    <span className="task-count-badge">
                        {filteredTasks.length} found
                    </span>
                </div>

                <div className="task-filters">
                    <div className="search-field">
                        <label htmlFor="task-search">Search tasks</label>
                        <input
                            id="task-search"
                            type="search"
                            placeholder="Search by title or description..."
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                        />
                    </div>

                    <div className="filter-field">
                        <label htmlFor="task-category">Category</label>
                        <select
                            id="task-category"
                            value={category}
                            onChange={(event) => setCategory(event.target.value)}
                        >
                            {categories.map((item) => (
                                <option key={item} value={item}>
                                    {item === "All" ? "All categories" : item}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-field">
                        <label htmlFor="task-skill">Required skill</label>
                        <select
                            id="task-skill"
                            value={skill}
                            onChange={(event) => setSkill(event.target.value)}
                        >
                            {skills.map((item) => (
                                <option key={item} value={item}>
                                    {item === "All" ? "All skills" : item}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="button"
                        className="reset-filters-button"
                        onClick={() => {
                            setSearch("");
                            setCategory("All");
                            setSkill("All");
                        }}
                    >
                        Reset
                    </button>
                </div>
            </section>

            {message && (
                <div className="dashboard-message success-message" role="status">
                    <span>✓</span> {message}
                </div>
            )}

            {error && (
                <div className="dashboard-message error-message" role="alert">
                    {error}
                </div>
            )}

            <section className="task-results-section">
                <div className="section-heading">
                    <div>
                        <h2>Explore tasks</h2>
                        <p>Find work that matches your interests and skills.</p>
                    </div>
                </div>

                {loading ? (
                    <div className="dashboard-empty-state">
                        <div className="loading-indicator" />
                        <h3>Loading opportunities...</h3>
                        <p>Please wait while we retrieve the available tasks.</p>
                    </div>
                ) : filteredTasks.length === 0 ? (
                    <div className="dashboard-empty-state">
                        <span className="empty-state-icon">🔎</span>
                        <h3>No matching tasks</h3>
                        <p>Try a different search or reset your filters.</p>
                        <button
                            type="button"
                            onClick={() => {
                                setSearch("");
                                setCategory("All");
                                setSkill("All");
                            }}
                        >
                            Clear filters
                        </button>
                    </div>
                ) : (
                    <div className="task-grid">
                        {filteredTasks.map((task) => {
                            const isOpen =
                                String(task.status || "").toUpperCase() === "OPEN";

                            return (
                                <article className="task-card" key={task.task_id}>
                                    <div className="task-card-top">
                                        <span className="task-category">
                                            {task.category || "General"}
                                        </span>
                                        <span
                                            className={`status ${
                                                isOpen ? "status-open" : "status-closed"
                                            }`}
                                        >
                                            {task.status || "Unknown"}
                                        </span>
                                    </div>

                                    <h3>{task.title}</h3>

                                    <p className="task-description">
                                        {task.description || "No description provided."}
                                    </p>

                                    <div className="task-detail">
                                        <span>Required skill</span>
                                        <strong>
                                            {task.required_skill || "Not specified"}
                                        </strong>
                                    </div>

                                    <div className="task-detail">
                                        <span>Posted by</span>
                                        <strong>{task.posted_by || "SkillBridge student"}</strong>
                                    </div>

                                    <div className="task-detail">
                                        <span>Deadline</span>
                                        <strong>
                                            {task.deadline
                                                ? new Date(task.deadline).toLocaleDateString()
                                                : "No deadline"}
                                        </strong>
                                    </div>

                                    <button
                                        type="button"
                                        className="apply-task-button"
                                        disabled={!isOpen || applyingTaskId === task.task_id}
                                        onClick={() => handleApply(task)}
                                    >
                                        {applyingTaskId === task.task_id
                                            ? "Submitting..."
                                            : isOpen
                                              ? "Apply for task →"
                                              : "Applications closed"}
                                    </button>
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}

export default Dashboard;
