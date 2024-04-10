import { NextApiRequest, NextApiResponse } from 'next';
import pool from "@/db";

export default async function createBill(req: NextApiRequest, res: NextApiResponse) {
    const { member_username, fee, description } = req.body;

    if (!member_username || fee === undefined || !description) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    try {
        const query = `
          INSERT INTO bill (member_username, amount, description)
          VALUES ($1, $2, $3)
          RETURNING *;
        `;

        const result = await pool.query(query, [member_username, fee, description]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Database query error', error);
        res.status(500).json({ message: "Internal server error" });
    }
}
