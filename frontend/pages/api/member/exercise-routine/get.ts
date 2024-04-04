import { NextApiRequest, NextApiResponse } from 'next';
import pool from "@/db";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { member_username } = req.body;

  // if (req.method !== 'GET') {
  //   return res.status(405);
  // }
  // Fetch user data from the DB and return object
  const query = `SELECT 
                description
                FROM exercise_routine
                WHERE member_username = $1;`;

  const result = await pool.query(query, [member_username]);

  res.status(200).json(result.rows);
}