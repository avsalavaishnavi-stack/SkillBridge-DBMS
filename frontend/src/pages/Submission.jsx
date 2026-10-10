import { useEffect, useState } from "react";
import {
    getAssignments,
    createSubmission,
    getSubmissions
} from "../api";

function Submission() {
    const [assignments, setAssignments] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [selectedAssignment, setSelectedAssignment] = useState("");
    const [submissionText, setSubmissionText] = useState("");
    const [submissionUrl, setSubmissionUrl] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const savedStudent = localStorage.getItem("skillbridge_student");
    let student = null;

    try {
        student = savedStudent ? JSON.parse(savedStudent) : null;
    } catch {
        student = null;
    }

    const loadData = async (showLoading = true) => {
        if (!student?.student_id) {
            setError("Please login again to view your submissions.");
            setLoading(false);
            return;
        }

        if (showLoading) {
            setLoading(true);
        }

        setError("");

        try {
            const [assignmentResponse, submissionResponse] =
                await Promise.all([
                    getAssignments(),
                    getSubmissions()
                ]);

            const allAssignments = Array.isArray(assignmentResponse.data)
                ? assignmentResponse.data
                : [];

            const allSubmissions = Array.isArray(submissionResponse.data)
                ? submissionResponse.data
                : [];

            const myAssignments = allAssignments.filter(
                (assignment) =>
                    String(assignment.student_id) ===
                    String(student.student_id)
            );

            const mySubmissions = allSubmissions.filter(
                (submission) =>
                    String(submission.student_id) ===
                    String(student.student_id)
            );

            setAssignments(myAssignments);
            setSubmissions(mySubmissions);
        } catch (err) {
            console.error(err);
            setError(
                err.response?.data?.error ||
                "Unable to load assignments or submission history."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        if (!selectedAssignment) {
            setError("Please select an assignment.");
            return;
        }

        if (!submissionText.trim()) {
            setError("Please describe the work you completed.");
            return;
        }

        try {
            setSubmitting(true);

            await createSubmission({
                assignment_id: Number(selectedAssignment),
                submission_text: submissionText.trim(),
                submission_url: submissionUrl.trim()
            });

            setMessage("Work submitted successfully!");
            setSelectedAssignment("");
            setSubmissionText("");
            setSubmissionUrl("");

            await loadData(false);
        } catch (err) {
            console.error(err);
            setError(
                err.response?.data?.error ||
                "Unable to submit work. Please try again."
            );
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (date) => {
        if (!date) return "Date unavailable";

        const parsedDate = new Date(date);

        return Number.isNaN(parsedDate.getTime())
            ? "Date unavailable"
            : parsedDate.toLocaleString();
    };

    const statusLabel = (status) => {
        const value = String(status || "SUBMITTED").toUpperCase();

        if (value === "REVIEWED" || value === "APPROVED") {
            return "Reviewed";
        }

        if (value === "REJECTED") {
            return "Changes requested";
        }

        return "Submitted";
    };

    if (loading) {
        return (
            <div className="dashboard">
                <h1>Submit Work</h1>
                <p>Loading your assignments and submissions...</p>
            </div>
        );
    }

    return (
        <div className="dashboard submission-page">
            <header className="submission-header">
                <h1>Submit Work</h1>
                <p>
                    Submit completed assignments and track your submission history.
                </p>
            </header>

            {message && (
                <div className="submission-message success-message">
                    {message}
                </div>
            )}

            {error && (
                <div className="submission-message error-message">
                    {error}
                </div>
            )}

            <div className="submission-stats">
                <div className="submission-stat">
                    <span>My Assignments</span>
                    <strong>{assignments.length}</strong>
                </div>

                <div className="submission-stat">
                    <span>Work Submitted</span>
                    <strong>{submissions.length}</strong>
                </div>

                <div className="submission-stat">
                    <span>Awaiting Review</span>
                    <strong>
                        {
                            submissions.filter(
                                (submission) =>
                                    !["REVIEWED", "APPROVED", "REJECTED"].includes(
                                        String(submission.status || "SUBMITTED").toUpperCase()
                                    )
                            ).length
                        }
                    </strong>
                </div>
            </div>

            <section className="post-task submission-form-card">
                <h2>Submit a New Submission</h2>
                <p>Choose an assignment and provide details about your completed work.</p>

                {assignments.length === 0 ? (
                    <p>
                        You do not have any assignments available. Apply for a task
                        and wait for the task owner to accept your application.
                    </p>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <label htmlFor="submission-assignment">
                            Select Assignment
                        </label>

                        <select
                            id="submission-assignment"
                            value={selectedAssignment}
                            onChange={(e) => setSelectedAssignment(e.target.value)}
                            required
                        >
                            <option value="">Choose an assignment</option>

                            {assignments.map((assignment) => (
                                <option
                                    key={assignment.assignment_id}
                                    value={assignment.assignment_id}
                                >
                                    {assignment.title || assignment.task_title ||
                                        `Assignment #${assignment.assignment_id}`}
                                </option>
                            ))}
                        </select>

                        <label htmlFor="submission-description">
                            Work Description
                        </label>

                        <textarea
                            id="submission-description"
                            placeholder="Explain what you completed, the features you implemented, and how it works."
                            value={submissionText}
                            onChange={(e) => setSubmissionText(e.target.value)}
                            rows={5}
                            required
                        />

                        <label htmlFor="submission-url">
                            Project URL (optional)
                        </label>

                        <input
                            id="submission-url"
                            type="url"
                            placeholder="https://github.com/username/project"
                            value={submissionUrl}
                            onChange={(e) => setSubmissionUrl(e.target.value)}
                        />

                        <button type="submit" disabled={submitting}>
                            {submitting ? "Submitting..." : "Submit Work"}
                        </button>
                    </form>
                )}
            </section>

            <section className="submission-history">
                <div className="submission-history-heading">
                    <div>
                        <h2>My Submission History</h2>
                        <p>Review the work you have submitted previously.</p>
                    </div>

                    <button
                        type="button"
                        className="submission-refresh-button"
                        onClick={() => loadData()}
                    >
                        Refresh
                    </button>
                </div>

                {submissions.length === 0 ? (
                    <div className="post-task submission-empty">
                        <h3>No submissions yet</h3>
                        <p>
                            Your submitted work will appear here after you submit
                            an assignment.
                        </p>
                    </div>
                ) : (
                    <div className="submission-history-list">
                        {submissions.map((submission) => (
                            <article
                                className="submission-history-card"
                                key={submission.submission_id}
                            >
                                <div className="submission-card-top">
                                    <div>
                                        <h3>
                                            {submission.title ||
                                                `Assignment #${submission.assignment_id}`}
                                        </h3>
                                        <span className="submission-date">
                                            Submitted: {formatDate(submission.submitted_at)}
                                        </span>
                                    </div>

                                    <span
                                        className={`submission-status status-${String(
                                            submission.status || "SUBMITTED"
                                        ).toLowerCase()}`}
                                    >
                                        {statusLabel(submission.status)}
                                    </span>
                                </div>

                                <p className="submission-description">
                                    {submission.submission_text}
                                </p>

                                {submission.submission_url && (
                                    <a
                                        href={submission.submission_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="submission-project-link"
                                    >
                                        View submitted project ↗
                                    </a>
                                )}

                                <span className="submission-id">
                                    Submission ID: {submission.submission_id}
                                </span>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

export default Submission;