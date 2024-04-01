import { NextApiRequest, NextApiResponse } from 'next';
import pool, { TimeSlot } from "@/db";


export default async function handler(req: NextApiRequest, res: NextApiResponse<TimeSlot[]>) {
  const { username, begin_time, end_time } = req.body;

  // Update a specific timestamp'd metric from the DB
  const query = ``;
  const result = await pool.query(query, [username, begin_time, end_time]);


  res.status(200).json(result.rows);
}