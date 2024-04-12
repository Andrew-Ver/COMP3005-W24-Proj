import { NextApiRequest, NextApiResponse } from "next";
import pool from "@/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const query = `SELECT  
                bill_id,
                member_username,
                amount,
                description,
                bill_timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'America/New_York' AS bill_timestamp,
                cleared
                FROM bill
                ORDER BY bill_id DESC;`;

  const result = await pool.query(query);

  const metrics = result.rows.map((row) => ({
    bill_id: row.bill_id,
    member_username: row.member_username,
    amount: row.amount,
    description: row.description,
    bill_timestamp: (row.bill_timestamp = new Date(row.bill_timestamp)
      .toISOString()
      .replace("T", " ")
      .slice(0, -5)),
    cleared: row.cleared,
  }));

  res.status(200).json(metrics);
}
