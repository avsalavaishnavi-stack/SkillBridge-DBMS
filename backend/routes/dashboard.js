const express = require("express");
const router = express.Router();
const pool = require("../db");

router.get("/:studentId", async (req, res) => {
    try {
        const studentId = req.params.studentId;

        const totalTasksResult = await pool.query(
            `
            SELECT COUNT(*) AS count
            FROM tasks
            WHERE status = 'OPEN'
            `
        );

        const applicationsResult = await pool.query(
            `
            SELECT COUNT(*) AS count
            FROM applications
            WHERE student_id = $1
            `,
            [studentId]
        );

        const acceptedResult = await pool.query(
            `
            SELECT COUNT(*) AS count
            FROM applications
            WHERE student_id = $1
            AND status = 'ACCEPTED'
            `,
            [studentId]
        );

        const completedResult = await pool.query(
            `
            SELECT COUNT(*) AS count
            FROM assignments a
            JOIN applications app
                ON a.application_id = app.application_id
            WHERE app.student_id = $1
            AND a.status = 'COMPLETED'
            `,
            [studentId]
        );

        const ratingResult = await pool.query(
            `
            SELECT COALESCE(
                ROUND(AVG(rating)::numeric, 2),
                0
            ) AS average_rating
            FROM reviews
            WHERE reviewee_id = $1
            `,
            [studentId]
        );

        res.json({
            totalTasks: Number(
                totalTasksResult.rows[0].count
            ),
            applications: Number(
                applicationsResult.rows[0].count
            ),
            acceptedApplications: Number(
                acceptedResult.rows[0].count
            ),
            completedWork: Number(
                completedResult.rows[0].count
            ),
            averageRating: Number(
                ratingResult.rows[0].average_rating
            )
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

module.exports = router;