import { NextApiRequest, NextApiResponse } from 'next';
import pool, { TimeSlot } from "@/db";


export default async function handler(req: NextApiRequest, res: NextApiResponse<TimeSlot[]>) {
    const { description } = req.body;


    // Fetch user data from the DB and return object
    const query = `
                                INSERT INTO room(description, is_deleted)
                                VALUES ($1, $2);`;

    const result = await pool.query(query, [description, false]);

    res.status(200).json(result.rows);
}