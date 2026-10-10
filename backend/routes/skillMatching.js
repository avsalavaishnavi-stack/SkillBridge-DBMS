const express = require("express");
const router = express.Router();
const pool = require("../db");

router.get("/:studentId", async (req, res) => {
    try {
        const result = await pool.query(
            `
            SELECT DISTINCT
                t.task_id,
                t.title,
                t.description,
                t.category,
                t.deadline,
                t.status,
                t.created_at,
                sk.skill_name AS matched_skill,
                s.name AS posted_by
            FROM student_skills ss
            JOIN skills sk
                ON ss.skill_id = sk.skill_id
            JOIN tasks t
                ON t.required_skill = sk.skill_id
            JOIN students s
                ON t.posted_by = s.student_id
            WHERE ss.student_id = $1
            AND t.status = 'OPEN'
            ORDER BY t.created_at DESC
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

module.exports = router;