
import { useEffect, useMemo, useState } from "react";
import {
    getApplications,
    updateApplicationStatus
} from "../api";

function ApplicationManagement() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const loadApplications = async () => {
        try {
            setError("");
            const response = await getApplications();
            setApplications(
                Array.isArray(response.data) ? response.data : []
            );
        } catch (err) {
            console.error(err);
            setError(
                err.response?.data?.error ||
                "Unable to load applications. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadApplications();
    }, []);

    const handleStatus = async (applicationId, status) => {
        try {
            setUpdatingId(applicationId);
            setError("");
            setMessage("");

            await updateApplicationStatus(applicationId, status);

            setMessage(
                `Application ${status.toLowerCase()} successfully.`
            );

            await loadApplications();
        } catch (err) {
            console.error(err);
            setError(
                err.response?.data?.error ||
                "Unable to update application. Please try again."
            );
        } finally {
            setUpdatingId(null);
        }
    };

    const counts = useMemo(() => ({
        total: applications.length,
        pending: applications.filter(
            (app) => app.status?.toUpperCase() === "PENDING"
        ).length,
        accepted: applications.filter(
            (app) => app.status?.toUpperCase() === "ACCEPTED"
        ).length,
        rejected: applications.filter(
            (app) => app.status?.toUpperCase() === "REJECTED"
        ).length
    }), [applications]);

    const filteredApplications = useMemo(() => {
        const term = search.trim().toLowerCase();

        return applications.filter((app) => {
            const matchesSearch = [
                app.title,
                app.student_name,
                app.student_email,
                app.category,
                app.message
            ].some((value) =>
                String(value || "").toLowerCase().includes(term)
            );

            const matchesStatus =
                statusFilter === "ALL" ||
                app.status?.toUpperCase() === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [applications, search, statusFilter]);

    return (
        <div className="dashboard application-management-page">
            <header className="management-header">
                <div>
                    <span className="management-eyebrow">
                        SKILLBRIDGE WORKSPACE
                    </span>
                    <h1>Manage Applications</h1>
                    <p>
                        Review student applications and decide who
                        can work on your posted tasks.
                    </p>
                </div>

                <button
                    className="management-refresh"
                    onClick={loadApplications}
                    disabled={loading}
                >
                    {loading ? "Loading..." : "↻ Refresh"}
                </button>
            </header>

            <div className="management-stats">
                <div className="management-stat">
                    <span>Total applications</span>
                    <strong>{counts.total}</strong>
                </div>
                <div className="management-stat pending-stat">
                    <span>Pending review</span>
                    <strong>{counts.pending}</strong>
                </div>
                <div className="management-stat accepted-stat">
                    <span>Accepted</span>
                    <strong>{counts.accepted}</strong>
                </div>
                <div className="management-stat rejected-stat">
                    <span>Rejected</span>
                    <strong>{counts.rejected}</strong>
                </div>
            </div>

            {message && (
                <div className="management-alert success-alert" role="status">
                    ✓ {message}
                </div>
            )}

            {error && (
                <div className="management-alert error-alert" role="alert">
                    {error}
                </div>
            )}

            <div className="management-toolbar">
                <input
                    type="search"
                    placeholder="Search by task, student, email..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    aria-label="Search applications"
                />

                <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    aria-label="Filter by application status"
                >
                    <option value="ALL">All statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="ACCEPTED">Accepted</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="COMPLETED">Completed</option>
                </select>
            </div>

            {loading && (
                <div className="management-empty">
                    <div className="management-loader" />
                    <p>Loading applications...</p>
                </div>
            )}

            {!loading && !error && applications.length === 0 && (
                <div className="management-empty">
                    <div className="management-empty-icon">📋</div>
                    <h3>No applications yet</h3>
                    <p>
                        Student applications will appear here when
                        someone applies for a task.
                    </p>
                </div>
            )}

            {!loading &&
                applications.length > 0 &&
                filteredApplications.length === 0 && (
                    <div className="management-empty">
                        <h3>No matching applications</h3>
                        <p>Try changing your search or status filter.</p>
                        <button
                            className="management-secondary-button"
                            onClick={() => {
                                setSearch("");
                                setStatusFilter("ALL");
                            }}
                        >
                            Clear filters
                        </button>
                    </div>
                )}

            {!loading && filteredApplications.length > 0 && (
                <div className="management-results">
                    <p className="management-results-label">
                        Showing {filteredApplications.length} of{" "}
                        {applications.length} applications
                    </p>

                    <div className="management-grid">
                        {filteredApplications.map((application) => {
                            const status =
                                application.status?.toUpperCase() || "PENDING";

                            return (
                                <article
                                    className="management-card"
                                    key={application.application_id}
                                >
                                    <div className="management-card-top">
                                        <span className="management-category">
                                            {application.category || "General"}
                                        </span>

                                        <span
                                            className={`management-status status-${status.toLowerCase()}`}
                                        >
                                            {status}
                                        </span>
                                    </div>

                                    <h3>
                                        {application.title || "Untitled task"}
                                    </h3>

                                    <div className="management-student">
                                        <div className="management-avatar">
                                            {(application.student_name || "S")
                                                .charAt(0)
                                                .toUpperCase()}
                                        </div>
                                        <div>
                                            <strong>
                                                {application.student_name || "Unknown student"}
                                            </strong>
                                            <span>
                                                {application.student_email || "No email provided"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="management-message">
                                        <span>Application message</span>
                                        <p>
                                            {application.message ||
                                                "The student did not include a message."}
                                        </p>
                                    </div>

                                    <div className="management-date">
                                        <span>Applied on</span>
                                        <strong>
                                            {application.applied_at
                                                ? new Date(
                                                    application.applied_at
                                                ).toLocaleString()
                                                : "Date unavailable"}
                                        </strong>
                                    </div>

                                    {status === "PENDING" && (
                                        <div className="management-actions">
                                            <button
                                                className="management-accept"
                                                disabled={
                                                    updatingId !== null
                                                }
                                                onClick={() =>
                                                    handleStatus(
                                                        application.application_id,
                                                        "ACCEPTED"
                                                    )
                                                }
                                            >
                                                {updatingId ===
                                                application.application_id
                                                    ? "Updating..."
                                                    : "✓ Accept"}
                                            </button>

                                            <button
                                                className="management-reject"
                                                disabled={
                                                    updatingId !== null
                                                }
                                                onClick={() =>
                                                    handleStatus(
                                                        application.application_id,
                                                        "REJECTED"
                                                    )
                                                }
                                            >
                                                ✕ Reject
                                            </button>
                                        </div>
                                    )}

                                    {status === "ACCEPTED" && (
                                        <div className="management-note">
                                            ✓ Application accepted
                                        </div>
                                    )}

                                    {status === "REJECTED" && (
                                        <div className="management-note rejected-note">
                                            Application rejected
                                        </div>
                                    )}
                                </article>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

export default ApplicationManagement;
