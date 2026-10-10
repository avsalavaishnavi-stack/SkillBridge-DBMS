const express = require("express");
const router = express.Router();
const pool = require("../db");

router.get("/", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                t.task_id,
                t.title,
                t.description,
                t.category,
                t.deadline,
                t.status,
                s.name AS posted_by,
                sk.skill_name AS required_skill
            FROM tasks t
            JOIN students s
                ON t.posted_by = s.student_id
            LEFT JOIN skills sk
                ON t.required_skill = sk.skill_id
            ORDER BY t.created_at DESC
        `);

        res.json(result.rows);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

router.post("/", async (req, res) => {
    try {
        const {
            title,
            description,
            category,
            posted_by,
            required_skill,
            deadline
        } = req.body;

        const result = await pool.query(
            `
            INSERT INTO tasks
            (title, description, category, posted_by, required_skill, deadline)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
            `,
            [
                title,
                description,
                category,
                posted_by,
                required_skill,
                deadline
            ]
        );

        res.status(201).json(result.rows[0]);
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
                t.*,
                s.name AS posted_by_name,
                sk.skill_name
            FROM tasks t
            JOIN students s
                ON t.posted_by = s.student_id
            LEFT JOIN skills sk
                ON t.required_skill = sk.skill_id
            WHERE t.task_id = $1
            `,
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        await pool.query(
            "DELETE FROM tasks WHERE task_id = $1",
            [req.params.id]
        );

        res.json({
            message: "Task deleted"
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

module.exports = router;