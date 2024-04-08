import { NextApiRequest, NextApiResponse } from 'next';
import pool from "@/db";

type DeleteResponse = {
    message: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<DeleteResponse>) {
    const { equipment_id } = req.body;
    try {
        const query = `DELETE FROM equipment WHERE equipment_id = ANY($1);`;

        await pool.query(query, [equipment_id]);

        res.status(200).json({ message: "Equipment successfully deleted" });
    } catch (error) {
        console.error('Database query error', error);
        res.status(500).json({ message: "Internal server error" });
    }
}