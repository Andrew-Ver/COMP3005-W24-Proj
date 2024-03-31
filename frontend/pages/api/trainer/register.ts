import { NextApiRequest, NextApiResponse } from "next";
import pool from "../../../db";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }
    const { username, rateperhour } = req.body;

    try {
        const query = `
        INSERT INTO trainer (trainer_username, rate_per_hour)
        VALUES ($1, $2)
        RETURNING *;`;

        const result = await pool.query(query, [
            username,
            parseFloat(rateperhour)
        ]);

        //return newly created user
        res.status(201).json({ user: result.rows[0] });
    } catch (error: any) {
        //console.error("Error registering user:", error);
        return res.status(400).json({ message: "Username already exists" });
    }
}