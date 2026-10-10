
import { useEffect, useState } from "react";
import {
    getSubmissions,
    getReviews,
    getStudentReviews,
    createReview
} from "../api";

function Review() {
    const [submissions, setSubmissions] = useState([]);
    const [allReviews, setAllReviews] = useState([]);
    const [myReviews, setMyReviews] = useState([]);
    const [student, setStudent] = useState(null);

    const [selectedSubmission, setSelectedSubmission] = useState("");
    const [rating, setRating] = useState("5");
    const [comment, setComment] = useState("");

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        const savedStudent = localStorage.getItem("skillbridge_student");

        if (!savedStudent) {
            setError("Please log in to view reviews.");
            setLoading(false);
            return;
        }

        try {
            const currentStudent = JSON.parse(savedStudent);
            setStudent(currentStudent);
            loadData(currentStudent.student_id);
        } catch {
            setError("Unable to read your student details. Please log in again.");
            setLoading(false);
        }
    }, []);

    const loadData = async (studentId, showLoading = true) => {
        try {
            if (showLoading) setLoading(true);
            setError("");

            const [submissionResponse, reviewResponse, studentReviewResponse] =
                await Promise.all([
                    getSubmissions(),
                    getReviews(),
                    getStudentReviews(studentId)
                ]);

            setSubmissions(submissionResponse.data);
            setAllReviews(reviewResponse.data);
            setMyReviews(studentReviewResponse.data);
        } catch (err) {
            console.error(err);
            setError(
                err.response?.data?.error ||
                "Unable to load reviews. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const reviewedSubmissionIds = new Set(
        allReviews
            .filter(
                (review) =>
                    Number(review.reviewer_id) === Number(student?.student_id)
            )
            .map((review) => Number(review.submission_id))
    );

    const reviewableSubmissions = submissions.filter(
        (submission) =>
            Number(submission.student_id) !== Number(student?.student_id) &&
            !reviewedSubmissionIds.has(Number(submission.submission_id))
    );

    const averageRating = myReviews.length
        ? (
              myReviews.reduce(
                  (total, review) => total + Number(review.rating || 0),
                  0
              ) / myReviews.length
          ).toFixed(1)
        : "0.0";

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        if (!student?.student_id) {
            setError("Please log in again.");
            return;
        }

        if (!selectedSubmission) {
            setError("Please select a submission.");
            return;
        }

        if (!comment.trim()) {
            setError("Please enter your feedback.");
            return;
        }

        const selected = reviewableSubmissions.find(
            (submission) =>
                Number(submission.submission_id) ===
                Number(selectedSubmission)
        );

        if (!selected) {
            setError("This submission is unavailable or has already been reviewed.");
            return;
        }

        if (Number(selected.student_id) === Number(student.student_id)) {
            setError("You cannot review your own work.");
            return;
        }

        try {
            setSubmitting(true);

            await createReview({
                submission_id: Number(selectedSubmission),
                reviewer_id: Number(student.student_id),
                reviewee_id: Number(selected.student_id),
                rating: Number(rating),
                comment: comment.trim()
            });

            setMessage("Review submitted successfully!");
            setSelectedSubmission("");
            setRating("5");
            setComment("");

            await loadData(student.student_id, false);
        } catch (err) {
            console.error(err);
            setError(
                err.response?.data?.error ||
                "Unable to submit the review. Please try again."
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="review-page"><p>Loading reviews...</p></div>;
    }

    return (
        <div className="review-page">
            <div className="review-intro">
                <span className="review-eyebrow">COMMUNITY FEEDBACK</span>
                <h1>Reviews &amp; Ratings</h1>
                <p>
                    Celebrate great work, share constructive feedback,
                    and grow together through collaboration.
                </p>
            </div>

            {error && <div className="review-alert review-error">{error}</div>}
            {message && <div className="review-alert review-success">{message}</div>}

            <div className="review-stats">
                <div className="review-stat-card">
                    <span className="review-stat-icon">★</span>
                    <div>
                        <span className="review-stat-label">Average rating received</span>
                        <strong>{averageRating} / 5</strong>
                    </div>
                </div>

                <div className="review-stat-card">
                    <span className="review-stat-icon">✎</span>
                    <div>
                        <span className="review-stat-label">Reviews received</span>
                        <strong>{myReviews.length}</strong>
                    </div>
                </div>

                <div className="review-stat-card">
                    <span className="review-stat-icon">✓</span>
                    <div>
                        <span className="review-stat-label">Work available to review</span>
                        <strong>{reviewableSubmissions.length}</strong>
                    </div>
                </div>
            </div>

            <div className="review-main-grid">
                <section className="review-panel">
                    <div className="review-panel-heading">
                        <div>
                            <span className="review-eyebrow">GIVE FEEDBACK</span>
                            <h2>Write a review</h2>
                        </div>
                        <span className="review-heading-star">★</span>
                    </div>

                    {reviewableSubmissions.length === 0 ? (
                        <div className="review-empty">
                            <span>✓</span>
                            <h3>Nothing to review right now</h3>
                            <p>
                                Other students' submissions will appear here
                                when they are available and haven't been reviewed
                                by you yet.
                            </p>
                        </div>
                    ) : (
                        <form className="review-form" onSubmit={handleSubmit}>
                            <label htmlFor="review-submission">
                                Select submitted work
                            </label>
                            <select
                                id="review-submission"
                                value={selectedSubmission}
                                onChange={(e) => setSelectedSubmission(e.target.value)}
                                required
                            >
                                <option value="">Choose a submission</option>
                                {reviewableSubmissions.map((submission) => (
                                    <option
                                        key={submission.submission_id}
                                        value={submission.submission_id}
                                    >
                                        {submission.title} — {submission.student_name}
                                    </option>
                                ))}
                            </select>

                            <label htmlFor="review-rating">Your rating</label>
                            <select
                                id="review-rating"
                                value={rating}
                                onChange={(e) => setRating(e.target.value)}
                                required
                            >
                                <option value="5">★★★★★ — Excellent</option>
                                <option value="4">★★★★☆ — Very good</option>
                                <option value="3">★★★☆☆ — Good</option>
                                <option value="2">★★☆☆☆ — Needs improvement</option>
                                <option value="1">★☆☆☆☆ — Needs more work</option>
                            </select>

                            <label htmlFor="review-comment">Written feedback</label>
                            <textarea
                                id="review-comment"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="What did the student do well? What could be improved?"
                                rows={5}
                                maxLength={1000}
                                required
                            />
                            <span className="review-character-count">
                                {comment.length}/1000 characters
                            </span>

                            <button
                                className="review-submit-button"
                                type="submit"
                                disabled={submitting}
                            >
                                {submitting ? "Submitting..." : "Submit review"}
                            </button>
                        </form>
                    )}
                </section>

                <section className="review-panel">
                    <div className="review-panel-heading">
                        <div>
                            <span className="review-eyebrow">YOUR PROGRESS</span>
                            <h2>Rating summary</h2>
                        </div>
                    </div>

                    <div className="review-average">
                        <strong>{averageRating}</strong>
                        <span className="review-stars">
                            {"★".repeat(Math.round(Number(averageRating)))}
                            {"☆".repeat(5 - Math.round(Number(averageRating)))}
                        </span>
                        <p>Based on {myReviews.length} review{myReviews.length === 1 ? "" : "s"} received</p>
                    </div>

                    {[5, 4, 3, 2, 1].map((star) => {
                        const count = myReviews.filter(
                            (review) => Number(review.rating) === star
                        ).length;
                        const percentage = myReviews.length
                            ? (count / myReviews.length) * 100
                            : 0;

                        return (
                            <div className="review-rating-row" key={star}>
                                <span>{star} ★</span>
                                <div className="review-rating-track">
                                    <div
                                        className="review-rating-fill"
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                                <span>{count}</span>
                            </div>
                        );
                    })}
                </section>
            </div>

            <section className="review-history-section">
                <div className="review-section-heading">
                    <div>
                        <span className="review-eyebrow">YOUR FEEDBACK</span>
                        <h2>Reviews you've received</h2>
                    </div>
                    <span className="review-count">{myReviews.length} total</span>
                </div>

                {myReviews.length === 0 ? (
                    <div className="review-empty review-history-empty">
                        <span>☆</span>
                        <h3>No reviews received yet</h3>
                        <p>
                            Once another student reviews your submitted work,
                            their rating and feedback will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="review-history-grid">
                        {myReviews.map((review) => (
                            <article className="review-card" key={review.review_id}>
                                <div className="review-card-top">
                                    <div className="review-reviewer-avatar">
                                        {(review.reviewer_name || "S")
                                            .trim()
                                            .charAt(0)
                                            .toUpperCase()}
                                    </div>
                                    <div className="review-reviewer-info">
                                        <strong>{review.reviewer_name || "Student"}</strong>
                                        <span>{review.title || "Submitted work"}</span>
                                    </div>
                                    <span className="review-card-rating">
                                        ★ {review.rating}/5
                                    </span>
                                </div>

                                <p className="review-card-comment">
                                    {review.comment || "No written feedback provided."}
                                </p>

                                <span className="review-card-date">
                                    {review.created_at
                                        ? new Date(review.created_at).toLocaleDateString()
                                        : "Date unavailable"}
                                </span>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

export default Review;
