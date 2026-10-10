const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");

const router = express.Router();

router.post("/register", async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            department,
            year,
            bio
        } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                error: "Name, email and password are required."
            });
        }

        const existingStudent = await pool.query(
            "SELECT student_id FROM students WHERE email = $1",
            [email]
        );

        if (existingStudent.rows.length > 0) {
            return res.status(400).json({
                error: "Email already registered."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            `
            INSERT INTO students
            (name, email, password, department, year, bio)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING
                student_id,
                name,
                email,
                department,
                year,
                bio,
                created_at
            `,
            [
                name,
                email,
                hashedPassword,
                department || null,
                year || null,
                bio || null
            ]
        );

        res.status(201).json({
            message: "Registration successful.",
            student: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

router.post("/login", async (req, res) => {
    try {
        const {
            email,
            password
        } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                error: "Email and password are required."
            });
        }

        const result = await pool.query(
            `
            SELECT
                student_id,
                name,
                email,
                password,
                department,
                year,
                bio
            FROM students
            WHERE email = $1
            `,
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                error: "Invalid email or password."
            });
        }

        const student = result.rows[0];

        const passwordMatch = await bcrypt.compare(
            password,
            student.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                error: "Invalid email or password."
            });
        }

        const token = jwt.sign(
            {
                student_id: student.student_id,
                email: student.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        delete student.password;

        res.json({
            message: "Login successful.",
            token,
            student
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

module.exports = router;