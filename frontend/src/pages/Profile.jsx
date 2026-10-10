import { useEffect, useState } from "react";
import axios from "axios";
import { getStudentReviews } from "../api";

function Profile() {
    const [student, setStudent] = useState(null);
    const [skills, setSkills] = useState([]);
    const [reviews, setReviews] = useState([]);

    const [stats, setStats] = useState({
        completedWork: 0,
        averageRating: 0
    });

    const [loading, setLoading] = useState(true);

    const loadProfile = async () => {
        try {
            const savedStudent = localStorage.getItem(
                "skillbridge_student"
            );

            if (!savedStudent) {
                setLoading(false);
                return;
            }

            const studentData =
                JSON.parse(savedStudent);

            setStudent(studentData);

            const skillsResponse =
                await axios.get(
                    `https://skillbridge-api-2jff.onrender.com/api/skills/student/${studentData.student_id}`
                );

            setSkills(skillsResponse.data);

            const dashboardResponse =
                await axios.get(
                    `https://skillbridge-api-2jff.onrender.com/api/dashboard/${studentData.student_id}`
                );

            setStats({
                completedWork:
                    dashboardResponse.data.completedWork,

                averageRating:
                    dashboardResponse.data.averageRating
            });

            const reviewsResponse =
                await getStudentReviews(
                    studentData.student_id
                );

            setReviews(reviewsResponse.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProfile();
    }, []);

    if (loading) {
        return (
            <div className="dashboard">
                <h1>Profile</h1>
                <p>Loading profile...</p>
            </div>
        );
    }

    if (!student) {
        return (
            <div className="dashboard">
                <h1>Profile</h1>
                <p>Please login first.</p>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <header>
                <h1>My Profile</h1>

                <p>
                    Your SkillBridge profile and
                    student portfolio.
                </p>
            </header>

            <div className="profile-card">
                <h2>{student.name}</h2>

                <p>
                    <strong>Email:</strong>{" "}
                    {student.email}
                </p>

                <p>
                    <strong>Department:</strong>{" "}
                    {student.department ||
                        "Not specified"}
                </p>

                <p>
                    <strong>Year:</strong>{" "}
                    {student.year ||
                        "Not specified"}
                </p>

                <p>
                    <strong>Bio:</strong>{" "}
                    {student.bio ||
                        "No bio added yet."}
                </p>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <h3>Completed Work</h3>

                    <strong>
                        {stats.completedWork}
                    </strong>
                </div>

                <div className="stat-card">
                    <h3>Average Rating</h3>

                    <strong>
                        {stats.averageRating}
                    </strong>
                </div>

                <div className="stat-card">
                    <h3>Total Skills</h3>

                    <strong>
                        {skills.length}
                    </strong>
                </div>

                <div className="stat-card">
                    <h3>Total Reviews</h3>

                    <strong>
                        {reviews.length}
                    </strong>
                </div>
            </div>

            <h2>My Skills</h2>

            {skills.length === 0 ? (
                <p>
                    No skills added yet.
                </p>
            ) : (
                <div className="task-grid">
                    {skills.map((skill) => (
                        <div
                            className="task-card"
                            key={skill.skill_id}
                        >
                            <h3>
                                {skill.skill_name}
                            </h3>

                            <p>
                                <strong>
                                    Category:
                                </strong>{" "}
                                {skill.category}
                            </p>

                            <p>
                                <strong>
                                    Proficiency:
                                </strong>{" "}
                                {skill.proficiency}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            <h2>Review History</h2>

            {reviews.length === 0 ? (
                <p>
                    No reviews received yet.
                </p>
            ) : (
                <div className="task-grid">
                    {reviews.map((review) => (
                        <div
                            className="task-card"
                            key={review.review_id}
                        >
                            <h3>
                                {review.title}
                            </h3>

                            <p>
                                <strong>
                                    Rating:
                                </strong>{" "}
                                {review.rating} / 5
                            </p>

                            <p>
                                <strong>
                                    Reviewed By:
                                </strong>{" "}
                                {
                                    review.reviewer_name
                                }
                            </p>

                            <p>
                                <strong>
                                    Feedback:
                                </strong>{" "}
                                {review.comment ||
                                    "No comment"}
                            </p>

                            <p>
                                <strong>
                                    Date:
                                </strong>{" "}
                                {new Date(
                                    review.created_at
                                ).toLocaleDateString()}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Profile;