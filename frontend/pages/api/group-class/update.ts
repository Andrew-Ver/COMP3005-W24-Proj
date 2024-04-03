import { NextApiRequest, NextApiResponse } from 'next';
import pool from "@/db";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { class_id, availability_id, room_id, description, fee } = req.body;

  // Update a specific timestamp'd metric from the DB
  const query = `UPDATE group_class 
                SET 
                availability_id = ($1),
                room_id = ($2),
                description = ($3),
                fee = ($4) 
                WHERE class_id = ($5)`;
  const result = await pool.query(query, [availability_id, room_id, description, fee, class_id]);

  res.status(200).json(result.rows);
}