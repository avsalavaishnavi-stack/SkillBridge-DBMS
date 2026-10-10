const express = require("express");
const router = express.Router();
const pool = require("../db");

router.get("/", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                a.assignment_id,
                a.application_id,
                app.task_id,
                t.title,
                app.student_id,
                s.name AS student_name,
                a.assigned_at,
                a.status
            FROM assignments a
            JOIN applications app
                ON a.application_id = app.application_id
            JOIN tasks t
                ON app.task_id = t.task_id
            JOIN students s
                ON app.student_id = s.student_id
            ORDER BY a.assigned_at DESC
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
                a.assignment_id,
                a.application_id,
                app.task_id,
                t.title,
                t.description,
                app.student_id,
                s.name AS student_name,
                a.assigned_at,
                a.status
            FROM assignments a
            JOIN applications app
                ON a.application_id = app.application_id
            JOIN tasks t
                ON app.task_id = t.task_id
            JOIN students s
                ON app.student_id = s.student_id
            WHERE a.assignment_id = $1
            `,
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Assignment not found."
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

router.patch("/:id/status", async (req, res) => {
    try {
        const { status } = req.body;

        const allowedStatuses = [
            "ASSIGNED",
            "IN_PROGRESS",
            "SUBMITTED",
            "COMPLETED"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                error: "Invalid assignment status."
            });
        }

        const result = await pool.query(
            `
            UPDATE assignments
            SET status = $1
            WHERE assignment_id = $2
            RETURNING *
            `,
            [status, req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Assignment not found."
            });
        }

        res.json({
            message: "Assignment status updated successfully.",
            assignment: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

module.exports = router;