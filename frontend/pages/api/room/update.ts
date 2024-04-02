import { NextApiRequest, NextApiResponse } from 'next';
import pool, { TimeSlot } from "@/db";


export default async function handler(req: NextApiRequest, res: NextApiResponse<TimeSlot[]>) {
  const { room_id, description } = req.body;

  // Update a specific timestamp'd metric from the DB
  const query = `UPDATE room SET description = ($1) WHERE room_id = ($2)`;
  const result = await pool.query(query, [description, room_id]);

  res.status(200).json(result.rows);
}