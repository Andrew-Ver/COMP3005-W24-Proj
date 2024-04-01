import { NextApiRequest, NextApiResponse } from 'next';
import pool, { TimeSlot } from "@/db";


export default async function handler(req: NextApiRequest, res: NextApiResponse<TimeSlot[]>) {
    const { username, begin_time, end_time } = req.body;


    // Fetch user data from the DB and return object
    const query = `
                                INSERT INTO trainer_availability(trainer_username, is_booked, begin_time, end_time)
                                VALUES ($1, $2, $3, $4);`;

    const result = await pool.query(query, [username, false, begin_time, end_time]);

    res.status(200).json(result.rows);
}