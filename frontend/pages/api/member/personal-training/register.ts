import { NextApiRequest, NextApiResponse } from "next";
import pool from "@/db";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }
    const { member_username, availability_id, description } = req.body;

    try {

        const registerPersonalTrainingQuery = `INSERT INTO personal_training_session (member_username, availability_id, description)
        VALUES ($1, $2, $3)
        RETURNING *;`;

        const result = await pool.query(registerPersonalTrainingQuery, [member_username, availability_id, description]);

        // set is_booked in trainer_availability to true
        const isBookedQuery = `
        UPDATE trainer_availability
        SET is_booked = TRUE
        WHERE availability_id = $1;
        `
        await pool.query(isBookedQuery, [availability_id]);

        //return newly created registered personal training session
        res.status(201).json({ personal_training_session: result.rows[0] });
    } catch (error: any) {
        const errorCodes: Record<string, string> = {
            "23505": "Training session already exists",
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
