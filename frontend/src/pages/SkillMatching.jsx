import { useEffect, useState } from "react";
import {
    getMatchedTasks,
    applyForTask
} from "../api";

function SkillMatching() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [applyingTask, setApplyingTask] = useState(null);

    useEffect(() => {
        loadMatchedTasks();
    }, []);

    const loadMatchedTasks = async () => {
        try {
            const savedStudent = localStorage.getItem(
                "skillbridge_student"
            );

            if (!savedStudent) {
                setError("Please login first.");
                setLoading(false);
                return;
            }

            const student = JSON.parse(savedStudent);

            const response = await getMatchedTasks(
                student.student_id
            );

            setTasks(response.data);
        } catch (error) {
            console.error(error);

            setError(
                "Unable to load matched tasks."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async (taskId) => {
        try {
            setMessage("");
            setError("");

            const savedStudent = localStorage.getItem(
                "skillbridge_student"
            );

            if (!savedStudent) {
                setError("Please login first.");
                return;
            }

            const student = JSON.parse(savedStudent);

            setApplyingTask(taskId);

            await applyForTask({
                task_id: taskId,
                student_id: student.student_id,
                message:
                    "I am interested in this task and would like to contribute using my skills."
            });

            setMessage(
                "Application submitted successfully."
            );
        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.error ||
                "Unable to apply for this task."
            );
        } finally {
            setApplyingTask(null);
        }
    };

    return (
        <div className="dashboard">
            <header>
                <h1>Skill Matching</h1>

                <p>
                    Tasks recommended based on your skills.
                </p>
            </header>

            {message && (
                <p>{message}</p>
            )}

            {error && (
                <p>{error}</p>
            )}

            {loading && (
                <p>
                    Finding matching tasks...
                </p>
            )}

            {!loading &&
                !error &&
                tasks.length === 0 && (
                    <p>
                        No matching tasks found for your
                        skills.
                    </p>
                )}

            {!loading &&
                tasks.length > 0 && (
                    <div className="task-grid">
                        {tasks.map((task) => (
                            <div
                                className="task-card"
                                key={task.task_id}
                            >
                                <h3>
                                    {task.title}
                                </h3>

                                <p>
                                    {task.description}
                                </p>

                                <p>
                                    <strong>
                                        Category:
                                    </strong>{" "}
                                    {task.category}
                                </p>

                                <p>
                                    <strong>
                                        Matched Skill:
                                    </strong>{" "}
                                    {task.matched_skill}
                                </p>

                                <p>
                                    <strong>
                                        Posted By:
                                    </strong>{" "}
                                    {task.posted_by}
                                </p>

                                <p>
                                    <strong>
                                        Deadline:
                                    </strong>{" "}
                                    {task.deadline
                                        ? new Date(
                                              task.deadline
                                          ).toLocaleDateString()
                                        : "Not specified"}
                                </p>

                                <span className="status">
                                    {task.status}
                                </span>

                                <button
                                    onClick={() =>
                                        handleApply(
                                            task.task_id
                                        )
                                    }
                                    disabled={
                                        applyingTask ===
                                        task.task_id
                                    }
                                >
                                    {applyingTask ===
                                    task.task_id
                                        ? "Applying..."
                                        : "Apply for Task"}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
        </div>
    );
}

export default SkillMatching;