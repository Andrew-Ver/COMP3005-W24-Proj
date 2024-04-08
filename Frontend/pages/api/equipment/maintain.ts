import { NextApiRequest, NextApiResponse } from 'next';
import pool from "@/db";

export default async function markEquipmentAsMaintained(req: NextApiRequest, res: NextApiResponse) {
    const { equipment_id } = req.body;

    try {
        const query = `UPDATE equipment SET needs_maintenance = FALSE, last_maintained_at = NOW() WHERE equipment_id = ANY($1);`;

        await pool.query(query, [equipment_id]);

        res.status(200).json({ message: "Equipment marked as maintained" });
    } catch (error) {
        console.error('Database query error', error);
        res.status(500).json({ message: "Internal server error" });
    }
}
