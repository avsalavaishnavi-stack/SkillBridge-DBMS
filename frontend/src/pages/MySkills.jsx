import { useEffect, useState } from "react";
import axios from "axios";

function MySkills() {
    const [skills, setSkills] = useState([]);
    const [mySkills, setMySkills] = useState([]);
    const [selectedSkill, setSelectedSkill] = useState("");
    const [proficiency, setProficiency] = useState("Beginner");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const loadSkills = async () => {
        try {
            const response = await axios.get(
                "https://skillbridge-api-2jff.onrender.com/api/skills"
            );

            setSkills(response.data);
        } catch (error) {
            setError("Unable to load skills.");
        }
    };

    const loadMySkills = async () => {
        try {
            const savedStudent = localStorage.getItem(
                "skillbridge_student"
            );

            if (!savedStudent) {
                setError("Please login first.");
                return;
            }

            const student = JSON.parse(savedStudent);

            const response = await axios.get(
                `https://skillbridge-api-2jff.onrender.com/api/skills/student/${student.student_id}`
            );

            setMySkills(response.data);
        } catch (error) {
            setError("Unable to load your skills.");
        }
    };

    useEffect(() => {
        loadSkills();
        loadMySkills();
    }, []);

    const addSkill = async (e) => {
        e.preventDefault();

        if (!selectedSkill) {
            setError("Please select a skill.");
            return;
        }

        try {
            const savedStudent = localStorage.getItem(
                "skillbridge_student"
            );

            const student = JSON.parse(savedStudent);

            await axios.post(
                `https://skillbridge-api-2jff.onrender.com/api/skills/student/${student.student_id}`,
                {
                    skill_id: Number(selectedSkill),
                    proficiency
                }
            );

            setMessage("Skill added successfully.");
            setError("");
            setSelectedSkill("");

            loadMySkills();
        } catch (error) {
            setError(
                error.response?.data?.error ||
                "Unable to add skill."
            );
        }
    };

    const removeSkill = async (skillId) => {
        try {
            const savedStudent = localStorage.getItem(
                "skillbridge_student"
            );

            const student = JSON.parse(savedStudent);

            await axios.delete(
                `https://skillbridge-api-2jff.onrender.com/api/skills/student/${student.student_id}/${skillId}`
            );

            setMessage("Skill removed successfully.");
            setError("");

            loadMySkills();
        } catch (error) {
            setError("Unable to remove skill.");
        }
    };

    return (
        <div className="dashboard">
            <header>
                <h1>My Skills</h1>

                <p>
                    Add your skills and improve your task
                    recommendations.
                </p>
            </header>

            <div className="post-task">
                <h2>Add a Skill</h2>

                <form onSubmit={addSkill}>
                    <select
                        value={selectedSkill}
                        onChange={(e) =>
                            setSelectedSkill(e.target.value)
                        }
                    >
                        <option value="">
                            Select a skill
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

                    <select
                        value={proficiency}
                        onChange={(e) =>
                            setProficiency(e.target.value)
                        }
                    >
                        <option value="Beginner">
                            Beginner
                        </option>

                        <option value="Intermediate">
                            Intermediate
                        </option>

                        <option value="Advanced">
                            Advanced
                        </option>
                    </select>

                    <button type="submit">
                        Add Skill
                    </button>
                </form>

                {message && <p>{message}</p>}

                {error && <p>{error}</p>}
            </div>

            <h2>My Current Skills</h2>

            {mySkills.length === 0 ? (
                <p>
                    You have not added any skills yet.
                </p>
            ) : (
                <div className="task-grid">
                    {mySkills.map((skill) => (
                        <div
                            className="task-card"
                            key={skill.skill_id}
                        >
                            <h3>{skill.skill_name}</h3>

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

                            <button
                                onClick={() =>
                                    removeSkill(
                                        skill.skill_id
                                    )
                                }
                            >
                                Remove Skill
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MySkills;