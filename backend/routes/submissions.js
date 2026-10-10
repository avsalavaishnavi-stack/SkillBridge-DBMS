const express = require("express");
const router = express.Router();
const pool = require("../db");

router.post("/", async (req, res) => {
    try {
        const {
            assignment_id,
            submission_text,
            submission_url
        } = req.body;

        const result = await pool.query(
            `
            INSERT INTO submissions
            (assignment_id, submission_text, submission_url)
            VALUES ($1, $2, $3)
            RETURNING *
            `,
            [
                assignment_id,
                submission_text,
                submission_url
            ]
        );

        await pool.query(
            `
            UPDATE assignments
            SET status = 'SUBMITTED'
            WHERE assignment_id = $1
            `,
            [assignment_id]
        );

        res.status(201).json({
            message: "Submission created successfully.",
            submission: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

router.get("/", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                s.submission_id,
                s.assignment_id,
                a.application_id,
                t.title,
                app.student_id,
                st.name AS student_name,
                s.submission_text,
                s.submission_url,
                s.submitted_at,
                s.status
            FROM submissions s
            JOIN assignments a
                ON s.assignment_id = a.assignment_id
            JOIN applications app
                ON a.application_id = app.application_id
            JOIN tasks t
                ON app.task_id = t.task_id
            JOIN students st
                ON app.student_id = st.student_id
            ORDER BY s.submitted_at DESC
        `);

        res.json(result.rows);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const result = await pool.query(
            `
            SELECT
                s.submission_id,
                s.assignment_id,
                t.title,
                st.name AS student_name,
                s.submission_text,
                s.submission_url,
                s.submitted_at,
                s.status
            FROM submissions s
            JOIN assignments a
                ON s.assignment_id = a.assignment_id
            JOIN applications app
                ON a.application_id = app.application_id
            JOIN tasks t
                ON app.task_id = t.task_id
            JOIN students st
                ON app.student_id = st.student_id
            WHERE s.submission_id = $1
            `,
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Submission not found."
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

module.exports = router;