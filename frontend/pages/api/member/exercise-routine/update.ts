import { NextApiRequest, NextApiResponse } from 'next';
import pool from "@/db";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { member_username, old_description, new_description } = req.body;

  const query = `UPDATE exercise_routine SET description = $3 WHERE member_username = $1 AND description = $2`;
  const result = await pool.query(query, [member_username, old_description, new_description]);
  console.log(result)

  res.status(200).json(result.rows);
}