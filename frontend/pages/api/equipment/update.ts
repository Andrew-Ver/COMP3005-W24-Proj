import { NextApiRequest, NextApiResponse } from 'next';
import pool from "@/db";

export default async function updateEquipment(req: NextApiRequest, res: NextApiResponse) {
    const { equipment_id, description, room_id } = req.body;

    try {
        const query = `
          UPDATE equipment
          SET description = $2, room_id = $3
          WHERE equipment_id = $1
          RETURNING *;
        `;

        const result = await pool.query(query, [equipment_id, description, room_id]);

        if (result.rows.length > 0) {
            res.status(200).json(result.rows[0]);
        } else {
            res.status(404).json({ message: "Equipment not found" });
        }
    } catch (error) {
        console.error('Database query error', error);
        res.status(500).json({ message: "Internal server error" });
    }
}
