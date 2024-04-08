import { NextApiRequest, NextApiResponse } from 'next';
import pool, { TimeSlot } from "@/db";


export default async function handler(req: NextApiRequest, res: NextApiResponse<TimeSlot[]>) {
  const { availability_id, begin_time, end_time } = req.body;

  // Update a specific timestamp'd metric from the DB
  const query = `UPDATE trainer_availability 
                  SET begin_time = ($1), end_time = ($2)
                  WHERE availability_id = ($3)`;
  const result = await pool.query(query, [begin_time, end_time, availability_id]);

  res.status(200).json(result.rows);
}