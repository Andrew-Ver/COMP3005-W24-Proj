import { NextApiRequest, NextApiResponse } from "next";
import pool from "@/db";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }
    const { member_username, class_id, availability_id, fee, description } = req.body;

    try {
        // add member to class_member
        const query = `INSERT INTO class_member (member_username, class_id)
        VALUES ($1, $2)
        RETURNING *;`;

        const result = await pool.query(query, [member_username, class_id]);

        // set is_booked in trainer_availability to true
        const isBookedQuery = `
        UPDATE trainer_availability
        SET is_booked = TRUE
        WHERE availability_id = $1;
        `
        await pool.query(isBookedQuery, [availability_id]);

        // add the bill
        const insertBillQuery = `
        INSERT INTO bill (member_username, amount, description, bill_timestamp, cleared) VALUES ($1, $2, $3, $4, $5)
        `
        const formatted_time = new Date().toISOString();
        await pool.query(insertBillQuery, [member_username, fee, description, formatted_time, false]);

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
