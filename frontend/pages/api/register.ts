import { NextApiRequest, NextApiResponse } from "next";
import { hash } from "bcrypt";
import pool from "../../db";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }
    const { username, name, password, role } = req.body;

    console.log(req.body);
    try {
        // Don't hash password for Assignment
        // const hashedPassword = await hash(password, 10); // You can adjust the salt rounds as needed
        const query = `
        INSERT INTO account (username, name, password, user_type)
        VALUES ($1, $2, $3, $4)
        RETURNING username, name, password, user_type;`;

        /*
            Note: DB schema has user_type column, but the frontend uses role
            for conditional rendering
        */

        const result = await pool.query(query, [
            username,
            name,
            password,
            role,
        ]);

        //return newly created user
        res.status(201).json({ user: result.rows[0] });
    } catch (error: any) {
        //console.error("Error registering user:", error);
        return res.status(400).json({ message: "Username already exists" });
    }
}
