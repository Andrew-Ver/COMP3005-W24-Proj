import { NextApiRequest, NextApiResponse } from 'next';
import pool from "@/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  const { member_username } = req.body;
  const query = `SELECT  
                bill_id,
                member_username,
                amount,
                description,
                bill_timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'America/New_York' AS bill_timestamp,
                cleared
                FROM bill
                WHERE member_username = $1
                ORDER BY bill_timestamp ASC;`;

  const result = await pool.query(query, [member_username]);

  // among a few other changes
  // result.rows.forEach((row: any) => {
  //   row.bill_timestamp = new Date(row.begin_time).toISOString().replace("T", " ").slice(0, -5);
  // });

  res.status(200).json(result.rows);
}