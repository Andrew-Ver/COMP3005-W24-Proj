import { NextApiRequest, NextApiResponse } from 'next';
import pool from "@/db";

export default async function createNewEquipment(req: NextApiRequest, res: NextApiResponse) {
    const { description, room_id } = req.body;

    try {
        const query = `
          INSERT INTO equipment (description, room_id)
          VALUES ($1, $2)
          RETURNING *;
        `;

        const result = await pool.query(query, [description, room_id]);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Database query error', error);
        res.status(500).json({ message: "Internal server error" });
    }
}