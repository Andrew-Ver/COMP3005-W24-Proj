import { NextApiRequest, NextApiResponse } from 'next';
import pool, { Specialty } from "@/db";


export default async function handler(req: NextApiRequest, res: NextApiResponse<Specialty[]>) {
  const { trainer_username } = req.body;

  const query = `SELECT trainer_username, specialty
                FROM trainer_specialty
                WHERE trainer_username = $1`;

  const result = await pool.query(query, [trainer_username]);

  res.status(200).json(result.rows);
}