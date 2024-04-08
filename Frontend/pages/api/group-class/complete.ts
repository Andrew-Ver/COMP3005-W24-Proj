import { NextApiRequest, NextApiResponse } from 'next';
import pool from "@/db";

export default async function markClassComplete(req: NextApiRequest, res: NextApiResponse) {
    const { class_id } = req.body;
    console.log(req.body);
    try {
        if (class_id) {
            const query = `
                UPDATE group_class
                SET completed = TRUE
                WHERE class_id = $1
            `;
            await pool.query(query, [class_id]);

            res.status(200).json({ message: 'Class marked as complete successfully' });
        } else {
            res.status(400).json({ message: 'No class ID provided' });
        }
    } catch (error) {
        console.error('Error marking class as complete:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}
