import { NextApiRequest, NextApiResponse } from "next";
import pool from "@/db";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }
    const { username, name, password, role } = req.body;

    try {
        // Don't hash password for Assignment

        const createAccountQuery = `INSERT INTO account (username, name, password, user_type)
        VALUES ($1, $2, $3, $4)
        RETURNING username, name, password, user_type;`;

        const result = await pool.query(createAccountQuery, [username, name, password, role]);

        const createMemberQuery = `
                        INSERT INTO member (member_username, age, gender)
                        VALUES ($1, $2, $3);`;
        const createMemberResult = await pool.query(createMemberQuery, [username, 20, "male"]);

        //return newly created user
        res.status(201).json({ user: result.rows[0] });
    } catch (error: any) {
        const errorCodes: Record<string, string> = {
            "23505": "Username already exists",
            "22P02": "Invalid input",
            "23502": "Missing input",
            "23503": "Invalid role",
            "22001": "Input too long",
            "22007": "Invalid input",
            "23514": "Invalid input",
        };

        return res.status(400).json({
            message: errorCodes[error.code] || "Internal Server Error",
        });
    }
}
