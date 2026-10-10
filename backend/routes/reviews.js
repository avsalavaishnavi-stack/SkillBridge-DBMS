const express = require("express");
const router = express.Router();
const pool = require("../db");

router.post("/", async (req, res) => {
    try {
        const {
            submission_id,
            reviewer_id,
            reviewee_id,
            rating,
            comment
        } = req.body;

        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                error: "Rating must be between 1 and 5."
            });
        }

        const result = await pool.query(
            `
            INSERT INTO reviews
            (submission_id, reviewer_id, reviewee_id, rating, comment)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
            `,
            [
                submission_id,
                reviewer_id,
                reviewee_id,
                rating,
                comment
            ]
        );

        await pool.query(
            `
            UPDATE assignments a
            SET status = 'COMPLETED'
            FROM submissions s
            WHERE a.assignment_id = s.assignment_id
            AND s.submission_id = $1
            `,
            [submission_id]
        );

        res.status(201).json({
            message: "Review submitted successfully.",
            review: result.rows[0]
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
                r.review_id,
                r.submission_id,
                r.reviewer_id,
                reviewer.name AS reviewer_name,
                r.reviewee_id,
                reviewee.name AS reviewee_name,
                r.rating,
                r.comment,
                r.created_at,
                t.title
            FROM reviews r
            JOIN students reviewer
                ON r.reviewer_id = reviewer.student_id
            JOIN students reviewee
                ON r.reviewee_id = reviewee.student_id
            JOIN submissions sub
                ON r.submission_id = sub.submission_id
            JOIN assignments a
                ON sub.assignment_id = a.assignment_id
            JOIN applications app
                ON a.application_id = app.application_id
            JOIN tasks t
                ON app.task_id = t.task_id
            ORDER BY r.created_at DESC
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
                r.review_id,
                r.rating,
                r.comment,
                r.created_at,
                reviewer.name AS reviewer_name,
                t.title
            FROM reviews r
            JOIN students reviewer
                ON r.reviewer_id = reviewer.student_id
            JOIN submissions sub
                ON r.submission_id = sub.submission_id
            JOIN assignments a
                ON sub.assignment_id = a.assignment_id
            JOIN applications app
                ON a.application_id = app.application_id
            JOIN tasks t
                ON app.task_id = t.task_id
            WHERE r.reviewee_id = $1
            ORDER BY r.created_at DESC
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