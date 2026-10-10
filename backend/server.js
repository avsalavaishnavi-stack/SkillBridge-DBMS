const express = require("express");
const cors = require("cors");
const pool = require("./db");
require("dotenv").config();

const tasksRouter = require("./routes/tasks");
const applicationsRouter = require("./routes/applications");
const assignmentsRouter = require("./routes/assignments");
const submissionsRouter = require("./routes/submissions");
const reviewsRouter = require("./routes/reviews");
const skillMatchingRouter = require("./routes/skillMatching");
const authRouter = require("./routes/auth");
const skillsRouter = require("./routes/skills");
const dashboardRouter = require("./routes/dashboard");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "SkillBridge API is running"
    });
});

app.get("/api/test", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");

        res.json({
            message: "Database connected successfully",
            time: result.rows[0].now
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

app.use("/api/auth", authRouter);
app.use("/api/tasks", tasksRouter);
app.use("/api/applications", applicationsRouter);
app.use("/api/assignments", assignmentsRouter);
app.use("/api/submissions", submissionsRouter);
app.use("/api/reviews", reviewsRouter);
app.use("/api/matching", skillMatchingRouter);
app.use("/api/skills", skillsRouter);
app.use("/api/dashboard", dashboardRouter);

console.log("Auth router loaded:", typeof authRouter);
console.log("Tasks router loaded:", typeof tasksRouter);
console.log("Applications router loaded:", typeof applicationsRouter);
console.log("Assignments router loaded:", typeof assignmentsRouter);
console.log("Submissions router loaded:", typeof submissionsRouter);
console.log("Reviews router loaded:", typeof reviewsRouter);
console.log("Skill Matching router loaded:", typeof skillMatchingRouter);
console.log("Skills router loaded:", typeof skillsRouter);
console.log("Dashboard router loaded:", typeof dashboardRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(
        `SkillBridge server running on http://localhost:${PORT}`
    );
});
