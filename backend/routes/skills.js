const express = require("express");
const router = express.Router();
const pool = require("../db");

router.get("/", async (req, res) => {
    try {
        const result = await pool.query(
            `
            SELECT
                skill_id,
                skill_name,
                category
            FROM skills
            ORDER BY skill_name
            `
        );

        res.json(result.rows);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

router.get("/student/:studentId", async (req, res) => {
    try {
        const result = await pool.query(
            `
            SELECT
                sk.skill_id,
                sk.skill_name,
                sk.category,
                ss.proficiency
            FROM student_skills ss
            JOIN skills sk
                ON ss.skill_id = sk.skill_id
            WHERE ss.student_id = $1
            ORDER BY sk.skill_name
            `,
            [req.params.studentId]
        );

        res.json(result.rows);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

router.post("/student/:studentId", async (req, res) => {
    try {
        const {
            skill_id,
            proficiency
        } = req.body;

        await pool.query(
            `
            INSERT INTO student_skills
            (student_id, skill_id, proficiency)
            VALUES ($1, $2, $3)
            ON CONFLICT (student_id, skill_id)
            DO UPDATE SET proficiency = EXCLUDED.proficiency
            `,
            [
                req.params.studentId,
                skill_id,
                proficiency || "Beginner"
            ]
        );

        res.status(201).json({
            message: "Skill added successfully."
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

router.delete(
    "/student/:studentId/:skillId",
    async (req, res) => {
        try {
            await pool.query(
                `
                DELETE FROM student_skills
                WHERE student_id = $1
                AND skill_id = $2
                `,
                [
                    req.params.studentId,
                    req.params.skillId
                ]
            );

            res.json({
                message: "Skill removed successfully."
            });
        } catch (error) {
            res.status(500).json({
                error: error.message
            });
        }
    }
);

module.exports = router;