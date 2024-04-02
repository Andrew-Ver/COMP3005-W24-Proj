import { NextApiRequest, NextApiResponse } from 'next';
import pool from "@/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  // Fetch user data from the DB and return object
  const query = `SELECT * 
                FROM group_class;`;

  const result = await pool.query(query);

  res.status(200).json(result.rows);
}