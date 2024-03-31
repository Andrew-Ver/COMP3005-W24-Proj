import { NextApiRequest, NextApiResponse } from "next";
import { hash } from "bcrypt";
import { sql } from "@vercel/postgres";

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
        // const hashedPassword = await hash(password, 10); // You can adjust the salt rounds as needed
        const result = await sql`
            INSERT INTO account (username, name, password, user_type)
            VALUES (${username}, ${name}, ${password}, ${role})
            RETURNING username, name, user_type;`;
        // const query = await sql`
        //     INSERT INTO account (username, name, password, user_type)
        //     VALUES ($1, $2, $3, $4)
        //     RETURNING username, name, password, user_type;`;
        // `
        // INSERT INTO account (username, name, password, user_type)
        // VALUES ($1, $2, $3, $4)
        // RETURNING username, name, password, user_type;`;

        /*
            Note: DB schema has user_type column, but the frontend uses role
            for conditional rendering
        */

        // const result = await pool.query(query, [
        //     username,
        //     name,
        //     password,
        //     role,
        // ]);
        res.status(201).json({ user: result.rows[0] });

        //return newly created user
        //res.status(201).json({ user: result.rows[0] });
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

        // console.error(
        //     "Error registering user:",
        //     errorCodes[error.code] || error?.message
        // );
        console.log(error)

        return res.status(400).json({
            message: errorCodes[error.code] || "Internal Server Error",
        });
    }
}
