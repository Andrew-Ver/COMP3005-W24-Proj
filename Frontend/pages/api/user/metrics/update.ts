import { NextApiRequest, NextApiResponse } from 'next';
import pool, { Metric } from "@/db";


export default async function handler(req: NextApiRequest, res: NextApiResponse<Metric[]>) {
  const { metric_timestamp, username } = req.body;

  // Update a specific timestamp'd metric from the DB
  const query = ``;
  const result = await pool.query(query, [metric_timestamp, username]);


  res.status(200).json(result.rows);
}