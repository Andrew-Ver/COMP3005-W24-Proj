import { NextApiRequest, NextApiResponse } from 'next';
import pool from "@/db";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { availability_id, room_id, description, fee } = req.body;


    // Fetch user data from the DB and return object
    const query = `
    INSERT INTO group_class (availability_id, room_id, description, fee)
    VALUES ($1, $2, $3, $4);`;

    const result = await pool.query(query, [availability_id, room_id, description, fee]);

    res.status(200).json(result.rows);
}