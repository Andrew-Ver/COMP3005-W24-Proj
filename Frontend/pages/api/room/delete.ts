import { NextApiRequest, NextApiResponse } from "next";
import pool from "@/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { room_id } = req.body;
  console.log(room_id);

  const query = `UPDATE room SET is_deleted = TRUE WHERE room_id = ($1);`;

  const result = await pool.query(query, [room_id]);

  res.status(200).json(result.rows);
}
