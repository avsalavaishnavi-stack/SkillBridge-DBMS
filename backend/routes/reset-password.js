
require("dotenv").config();

const bcrypt = require("bcryptjs");
const pool = require("./db");
const readline = require("readline/promises");

async function resetPassword() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    try {
        const email = (
            await rl.question("Account email: ")
        ).trim().toLowerCase();

        const password = await rl.question("New temporary password: ");

        if (password.length < 8) {
            console.log("Use at least 8 characters.");
            return;
        }

        const hash = await bcrypt.hash(password, 10);

        const result = await pool.query(
            "UPDATE students SET password = $1 WHERE LOWER(email) = $2 RETURNING student_id, name, email",
            [hash, email]
        );

        if (result.rowCount === 0) {
            console.log("Account not found. No password was changed.");
        } else {
            console.log("Password reset successful!");
            console.log(result.rows[0]);
        }
    } catch (error) {
        console.error("Error:", error.message);
    } finally {
        rl.close();
        await pool.end();
    }
}

resetPassword();
