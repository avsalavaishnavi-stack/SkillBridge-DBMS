
import { useEffect, useState } from "react";
import {
    getAssignments,
    updateAssignmentStatus
} from "../api";

function Assignments() {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [filter, setFilter] = useState("ALL");
    const [updatingId, setUpdatingId] = useState(null);

    const loadAssignments = async () => {
        try {
            setError("");
            const response = await getAssignments();
            setAssignments(
                Array.isArray(response.data) ? response.data : []
            );
        } catch (err) {
            console.error(err);
            setError(
                err.response?.data?.error ||
                "Unable to load assignments. Check the backend API."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAssignments();
    }, []);

    const handleStatusChange = async (id, status) => {
        try {
            setUpdatingId(id);
            setError("");
            setMessage("");

            await updateAssignmentStatus(id, status);

            setMessage("Assignment status updated successfully.");
            await loadAssignments();
        } catch (err) {
            console.error(err);
            setError(
                err.response?.data?.error ||
                "Unable to update assignment status."
            );
        } finally {
            setUpdatingId(null);
        }
    };

    const getStatus = (assignment) =>
        String(assignment.status || "PENDING").toUpperCase();

    const filteredAssignments = assignments.filter((assignment) =>
        filter === "ALL" || getStatus(assignment) === filter
    );

    const completedCount = assignments.filter((assignment) =>
        ["COMPLETED", "DONE"].includes(getStatus(assignment))
    ).length;

    const activeCount = assignments.length - completedCount;

    return (
        <div className="dashboard assignments-page">
            <header className="assignments-header">
                <div>
                    <span className="assignments-eyebrow">
                        SKILLBRIDGE WORKSPACE
                    </span>
                    <h1>My Assignments</h1>
                    <p>
                        Track your assigned tasks and keep your
                        project progress up to date.
                    </p>
                </div>

                <button
                    className="assignments-refresh"
                    onClick={loadAssignments}
                    disabled={loading}
                >
                    ↻ Refresh
                </button>
            </header>

            <div className="assignments-stats">
                <div className="assignments-stat">
                    <span>Total assignments</span>
                    <strong>{assignments.length}</strong>
                </div>

                <div className="assignments-stat">
                    <span>In progress</span>
                    <strong>{activeCount}</strong>
                </div>

                <div className="assignments-stat">
                    <span>Completed</span>
                    <strong>{completedCount}</strong>
                </div>
            </div>

            {message && (
                <div className="assignments-alert assignments-success">
                    {message}
                </div>
            )}

            {error && (
                <div className="assignments-alert assignments-error">
                    {error}
                </div>
            )}

            <div className="assignments-toolbar">
                <h2>Assignment overview</h2>

                <select
                    value={filter}
                    onChange={(event) => setFilter(event.target.value)}
                    aria-label="Filter assignments by status"
                >
                    <option value="ALL">All assignments</option>
                    <option value="PENDING">Pending</option>
                    <option value="IN_PROGRESS">In progress</option>
                    <option value="COMPLETED">Completed</option>
                </select>
            </div>

            {loading && (
                <div className="assignments-empty">
                    Loading assignments...
                </div>
            )}

            {!loading && !error && assignments.length === 0 && (
                <div className="assignments-empty">
                    <div className="assignments-empty-icon">📋</div>
                    <h3>No assignments yet</h3>
                    <p>
                        Assignments will appear here when the backend
                        creates them for accepted applications.
                    </p>
                </div>
            )}

            {!loading &&
                assignments.length > 0 &&
                filteredAssignments.length === 0 && (
                    <div className="assignments-empty">
                        No assignments match this status.
                    </div>
                )}

            {!loading && filteredAssignments.length > 0 && (
                <div className="assignments-grid">
                    {filteredAssignments.map((assignment) => {
                        const status = getStatus(assignment);

                        return (
                            <article
                                className="assignments-card"
                                key={assignment.assignment_id}
                            >
                                <div className="assignments-card-top">
                                    <span className="assignments-category">
                                        {assignment.category || "General"}
                                    </span>

                                    <span
                                        className={`assignments-status status-${status.toLowerCase()}`}
                                    >
                                        {status.replaceAll("_", " ")}
                                    </span>
                                </div>

                                <h3>
                                    {assignment.title ||
                                        assignment.task_title ||
                                        "Untitled assignment"}
                                </h3>

                                <p className="assignments-description">
                                    {assignment.description ||
                                        "Work on this assignment and update its status as you make progress."}
                                </p>

                                {assignment.student_name && (
                                    <p className="assignments-detail">
                                        <strong>Student:</strong>{" "}
                                        {assignment.student_name}
                                    </p>
                                )}

                                {assignment.deadline && (
                                    <p className="assignments-detail">
                                        <strong>Deadline:</strong>{" "}
                                        {new Date(
                                            assignment.deadline
                                        ).toLocaleDateString()}
                                    </p>
                                )}

                                <div className="assignments-card-footer">
                                    <label>
                                        Update status
                                        <select
                                            value={status}
                                            disabled={
                                                updatingId !== null ||
                                                ["DONE", "COMPLETED"].includes(status)
                                            }
                                            onChange={(event) =>
                                                handleStatusChange(
                                                    assignment.assignment_id,
                                                    event.target.value
                                                )
                                            }
                                        >
                                            <option value="PENDING">
                                                Pending
                                            </option>
                                            <option value="IN_PROGRESS">
                                                In progress
                                            </option>
                                            <option value="COMPLETED">
                                                Completed
                                            </option>
                                        </select>
                                    </label>

                                    {updatingId ===
                                        assignment.assignment_id && (
                                        <span>Saving...</span>
                                    )}
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default Assignments;
