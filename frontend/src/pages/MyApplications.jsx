
import { useEffect, useState } from "react";
import { getStudentApplications } from "../api";

function MyApplications() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    useEffect(() => {
        loadApplications();
    }, []);

    const loadApplications = async () => {
        setLoading(true);
        setError("");

        try {
            const savedStudent = localStorage.getItem("skillbridge_student");

            if (!savedStudent) {
                setError("Please log in to view your applications.");
                return;
            }

            const student = JSON.parse(savedStudent);
            const response = await getStudentApplications(student.student_id);

            setApplications(
                Array.isArray(response.data) ? response.data : []
            );
        } catch (err) {
            console.error("Applications loading error:", err);
            setError("Unable to load your applications. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const getStatus = (status) =>
        String(status || "Pending").trim().toLowerCase();

    const getStatusClass = (status) => {
        const normalized = getStatus(status);

        if (normalized.includes("accept")) return "application-status-accepted";
        if (normalized.includes("reject") || normalized.includes("declin")) {
            return "application-status-rejected";
        }
        if (normalized.includes("complete")) return "application-status-completed";
        if (normalized.includes("pending")) return "application-status-pending";

        return "application-status-default";
    };

    const formatDate = (value, includeTime = false) => {
        if (!value) return "Not specified";

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) return "Not specified";

        return includeTime
            ? date.toLocaleString()
            : date.toLocaleDateString();
    };

    const countStatus = (words) =>
        applications.filter((application) =>
            words.some((word) => getStatus(application.status).includes(word))
        ).length;

    const stats = [
        {
            label: "Total Applications",
            value: applications.length,
            icon: "📨"
        },
        {
            label: "Pending",
            value: countStatus(["pending"]),
            icon: "⏳"
        },
        {
            label: "Accepted",
            value: countStatus(["accept"]),
            icon: "✓"
        },
        {
            label: "Rejected",
            value: countStatus(["reject", "declin"]),
            icon: "↩"
        }
    ];

    const filteredApplications = applications.filter((application) => {
        const searchText = search.trim().toLowerCase();

        const matchesSearch =
            String(application.title || "").toLowerCase().includes(searchText) ||
            String(application.category || "").toLowerCase().includes(searchText);

        const matchesStatus =
            statusFilter === "All" ||
            getStatus(application.status) === statusFilter.toLowerCase();

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="my-applications-page">
            <section className="applications-hero">
                <span className="applications-eyebrow">
                    YOUR TASK ACTIVITY
                </span>

                <h1>My Applications</h1>

                <p>
                    Keep track of your opportunities, check application
                    statuses, and follow your progress on SkillBridge.
                </p>
            </section>

            <section className="application-stats-grid">
                {stats.map((stat) => (
                    <div className="application-stat-card" key={stat.label}>
                        <div className="application-stat-icon">
                            {stat.icon}
                        </div>

                        <div>
                            <p>{stat.label}</p>
                            <strong>{stat.value}</strong>
                        </div>
                    </div>
                ))}
            </section>

            <section className="applications-list-panel">
                <div className="applications-heading">
                    <div>
                        <h2>Your applications</h2>
                        <p>
                            {applications.length} application
                            {applications.length !== 1 ? "s" : ""} submitted
                        </p>
                    </div>

                    <button
                        type="button"
                        className="applications-refresh-button"
                        onClick={loadApplications}
                        disabled={loading}
                    >
                        {loading ? "Loading..." : "↻ Refresh"}
                    </button>
                </div>

                <div className="applications-filters">
                    <input
                        type="search"
                        aria-label="Search applications"
                        placeholder="Search by task title or category..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />

                    <select
                        aria-label="Filter by application status"
                        value={statusFilter}
                        onChange={(event) => setStatusFilter(event.target.value)}
                    >
                        <option value="All">All statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Completed">Completed</option>
                    </select>
                </div>

                {loading && (
                    <div className="applications-empty-state">
                        <div className="applications-loader" />
                        <h3>Loading applications...</h3>
                        <p>Getting your latest application details.</p>
                    </div>
                )}

                {!loading && error && (
                    <div className="applications-empty-state">
                        <span className="applications-empty-icon">!</span>
                        <h3>Couldn't load applications</h3>
                        <p>{error}</p>

                        <button
                            type="button"
                            className="applications-primary-button"
                            onClick={loadApplications}
                        >
                            Try again
                        </button>
                    </div>
                )}

                {!loading && !error && applications.length === 0 && (
                    <div className="applications-empty-state">
                        <span className="applications-empty-icon">📋</span>
                        <h3>No applications yet</h3>
                        <p>
                            Explore the Dashboard and apply for a task that
                            matches your skills.
                        </p>
                    </div>
                )}

                {!loading && !error && applications.length > 0 &&
                    filteredApplications.length === 0 && (
                        <div className="applications-empty-state">
                            <span className="applications-empty-icon">🔎</span>
                            <h3>No matching applications</h3>
                            <p>Try another search term or choose a different status.</p>

                            <button
                                type="button"
                                className="applications-primary-button"
                                onClick={() => {
                                    setSearch("");
                                    setStatusFilter("All");
                                }}
                            >
                                Clear filters
                            </button>
                        </div>
                    )}

                {!loading && !error && filteredApplications.length > 0 && (
                    <div className="applications-cards-grid">
                        {filteredApplications.map((application) => (
                            <article
                                className="application-detail-card"
                                key={application.application_id}
                            >
                                <div className="application-card-top">
                                    <span className="application-category">
                                        {application.category || "General"}
                                    </span>

                                    <span
                                        className={`application-status ${getStatusClass(
                                            application.status
                                        )}`}
                                    >
                                        {application.status || "Pending"}
                                    </span>
                                </div>

                                <h3>{application.title || "Untitled task"}</h3>

                                <div className="application-info-row">
                                    <span>Deadline</span>
                                    <strong>
                                        {formatDate(application.deadline)}
                                    </strong>
                                </div>

                                <div className="application-message">
                                    <span>Your message</span>
                                    <p>
                                        {application.message || "No message provided."}
                                    </p>
                                </div>

                                <div className="application-date-row">
                                    <span>Applied on</span>
                                    <strong>
                                        {formatDate(application.applied_at, true)}
                                    </strong>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

export default MyApplications;
