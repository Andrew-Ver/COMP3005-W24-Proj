import { NextApiRequest, NextApiResponse } from 'next';
import pool from "@/db";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { member_username, description } = req.body;


    // Fetch user data from the DB and return object
    const query = `
                                INSERT INTO exercise_routine(member_username, description)
                                VALUES ($1, $2);`;

    const result = await pool.query(query, [member_username, description]);

    res.status(200).json(result.rows);
}