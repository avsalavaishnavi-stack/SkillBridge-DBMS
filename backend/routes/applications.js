const express = require("express");
const router = express.Router();
const pool = require("../db");

router.post("/", async (req, res) => {
    try {
        const { task_id, student_id, message } = req.body;

        const result = await pool.query(
            `
            INSERT INTO applications
            (task_id, student_id, message)
            VALUES ($1, $2, $3)
            RETURNING *
            `,
            [task_id, student_id, message]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        if (error.code === "23505") {
            return res.status(400).json({
                error: "You have already applied for this task."
            });
        }

        res.status(500).json({
            error: error.message
        });
    }
});

router.get("/", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                a.application_id,
                a.task_id,
                t.title,
                t.category,
                a.student_id,
                s.name AS student_name,
                s.email AS student_email,
                a.message,
                a.status,
                a.applied_at
            FROM applications a
            JOIN tasks t
                ON a.task_id = t.task_id
            JOIN students s
                ON a.student_id = s.student_id
            ORDER BY a.applied_at DESC
        `);

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
                a.application_id,
                a.task_id,
                t.title,
                t.category,
                t.deadline,
                a.message,
                a.status,
                a.applied_at
            FROM applications a
            JOIN tasks t
                ON a.task_id = t.task_id
            WHERE a.student_id = $1
            ORDER BY a.applied_at DESC
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

router.patch("/:id/status", async (req, res) => {
    const client = await pool.connect();

    try {
        const { status } = req.body;

        if (!["ACCEPTED", "REJECTED"].includes(status)) {
            return res.status(400).json({
                error: "Invalid application status."
            });
        }

        await client.query("BEGIN");

        const applicationResult = await client.query(
            `
            UPDATE applications
            SET status = $1
            WHERE application_id = $2
            RETURNING *
            `,
            [status, req.params.id]
        );

        if (applicationResult.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                error: "Application not found."
            });
        }

        if (status === "ACCEPTED") {
            await client.query(
                `
                INSERT INTO assignments
                (application_id)
                VALUES ($1)
                ON CONFLICT (application_id) DO NOTHING
                `,
                [req.params.id]
            );
        }

        await client.query("COMMIT");

        res.json({
            message: `Application ${status.toLowerCase()} successfully.`,
            application: applicationResult.rows[0]
        });
    } catch (error) {
        await client.query("ROLLBACK");

        res.status(500).json({
            error: error.message
        });
    } finally {
        client.release();
    }
});

module.exports = router;