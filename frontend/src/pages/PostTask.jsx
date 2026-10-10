
import { useEffect, useState } from "react";
import { createTask } from "../api";
import axios from "axios";

function PostTask() {
    const [skills, setSkills] = useState([]);
    const [loadingSkills, setLoadingSkills] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        title: "",
        description: "",
        category: "",
        required_skill: "",
        deadline: ""
    });

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        loadSkills();
    }, []);

    const loadSkills = async () => {
        try {
            const response = await axios.get(
                "http://localhost:5000/api/skills"
            );

            setSkills(
                Array.isArray(response.data) ? response.data : []
            );
        } catch (err) {
            console.error("Skills loading error:", err);
            setError("Unable to load skills. Please check the backend.");
        } finally {
            setLoadingSkills(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value
        }));

        setMessage("");
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        const savedStudent = localStorage.getItem("skillbridge_student");

        if (!savedStudent) {
            setError("Please log in before posting a task.");
            return;
        }

        if (
            !form.title.trim() ||
            !form.description.trim() ||
            !form.category.trim() ||
            !form.required_skill
        ) {
            setError("Please complete all required fields.");
            return;
        }

        if (form.deadline) {
            const selectedDate = new Date(`${form.deadline}T00:00:00`);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (selectedDate < today) {
                setError("The deadline cannot be in the past.");
                return;
            }
        }

        try {
            const student = JSON.parse(savedStudent);

            setSubmitting(true);

            await createTask({
                title: form.title.trim(),
                description: form.description.trim(),
                category: form.category.trim(),
                posted_by: student.student_id,
                required_skill: Number(form.required_skill),
                deadline: form.deadline || null
            });

            setMessage("Your task was posted successfully!");

            setForm({
                title: "",
                description: "",
                category: "",
                required_skill: "",
                deadline: ""
            });
        } catch (err) {
            console.error("Task creation error:", err);

            setError(
                err.response?.data?.error ||
                "Unable to post the task. Please try again."
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="post-task-page">
            <section className="post-task-hero">
                <span className="post-task-eyebrow">
                    CREATE AN OPPORTUNITY
                </span>

                <h1>Post a Task</h1>

                <p>
                    Share a project, collaborate with talented students,
                    and find the skills you need to get things done.
                </p>
            </section>

            <div className="post-task-layout">
                <section className="post-task-form-card">
                    <div className="post-task-section-heading">
                        <div>
                            <h2>Task details</h2>
                            <p>
                                Fill in the information to publish your opportunity.
                            </p>
                        </div>

                        <span className="required-note">
                            * Required
                        </span>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="post-task-field">
                            <label htmlFor="task-title">
                                Task title <span>*</span>
                            </label>

                            <input
                                id="task-title"
                                type="text"
                                name="title"
                                placeholder="e.g. Build a student dashboard"
                                value={form.title}
                                onChange={handleChange}
                                maxLength={120}
                                required
                            />

                            <small>Use a short, descriptive title.</small>
                        </div>

                        <div className="post-task-field">
                            <label htmlFor="task-description">
                                Description <span>*</span>
                            </label>

                            <textarea
                                id="task-description"
                                name="description"
                                placeholder="Describe the work, expected outcome, and any important requirements..."
                                value={form.description}
                                onChange={handleChange}
                                rows={5}
                                required
                            />

                            <small>Explain what the student will work on.</small>
                        </div>

                        <div className="post-task-two-columns">
                            <div className="post-task-field">
                                <label htmlFor="task-category">
                                    Category <span>*</span>
                                </label>

                                <input
                                    id="task-category"
                                    type="text"
                                    name="category"
                                    placeholder="e.g. Web Development"
                                    value={form.category}
                                    onChange={handleChange}
                                    maxLength={80}
                                    required
                                />
                            </div>

                            <div className="post-task-field">
                                <label htmlFor="task-skill">
                                    Required skill <span>*</span>
                                </label>

                                <select
                                    id="task-skill"
                                    name="required_skill"
                                    value={form.required_skill}
                                    onChange={handleChange}
                                    disabled={loadingSkills || skills.length === 0}
                                    required
                                >
                                    <option value="">
                                        {loadingSkills
                                            ? "Loading skills..."
                                            : skills.length === 0
                                              ? "No skills available"
                                              : "Select a skill"}
                                    </option>

                                    {skills.map((skill) => (
                                        <option
                                            key={skill.skill_id}
                                            value={skill.skill_id}
                                        >
                                            {skill.skill_name}
                                        </option>
                                    ))}
                                </select>

                                {skills.length === 0 && !loadingSkills && (
                                    <small>
                                        Check the skills table and backend API.
                                    </small>
                                )}
                            </div>
                        </div>

                        <div className="post-task-field">
                            <label htmlFor="task-deadline">
                                Deadline <span className="optional-label">(Optional)</span>
                            </label>

                            <input
                                id="task-deadline"
                                type="date"
                                name="deadline"
                                value={form.deadline}
                                min={new Date(
                                    Date.now() - new Date().getTimezoneOffset() * 60000
                                ).toISOString().slice(0, 10)}
                                onChange={handleChange}
                            />

                            <small>Choose the date by which the work should be completed.</small>
                        </div>

                        {message && (
                            <div
                                className="post-task-feedback post-task-success"
                                role="status"
                            >
                                <span>✓</span>
                                {message}
                            </div>
                        )}

                        {error && (
                            <div
                                className="post-task-feedback post-task-error"
                                role="alert"
                            >
                                {error}
                            </div>
                        )}

                        <div className="post-task-form-actions">
                            <button
                                type="button"
                                className="post-task-reset"
                                disabled={submitting}
                                onClick={() => {
                                    setForm({
                                        title: "",
                                        description: "",
                                        category: "",
                                        required_skill: "",
                                        deadline: ""
                                    });
                                    setMessage("");
                                    setError("");
                                }}
                            >
                                Clear form
                            </button>

                            <button
                                type="submit"
                                className="post-task-submit"
                                disabled={submitting || loadingSkills || skills.length === 0}
                            >
                                {submitting ? "Publishing..." : "Publish task →"}
                            </button>
                        </div>
                    </form>
                </section>

                <aside className="post-task-info-card">
                    <div className="post-task-info-icon">✦</div>

                    <h2>Make your task stand out</h2>

                    <p>
                        A clear task description helps students understand
                        the work and decide whether their skills are a match.
                    </p>

                    <div className="post-task-tip">
                        <span>01</span>
                        <div>
                            <strong>Be specific</strong>
                            <p>Describe the goal and expected result.</p>
                        </div>
                    </div>

                    <div className="post-task-tip">
                        <span>02</span>
                        <div>
                            <strong>Choose the right skill</strong>
                            <p>Select the skill most relevant to the task.</p>
                        </div>
                    </div>

                    <div className="post-task-tip">
                        <span>03</span>
                        <div>
                            <strong>Set a realistic deadline</strong>
                            <p>Give students enough time to complete the work.</p>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}

export default PostTask;
