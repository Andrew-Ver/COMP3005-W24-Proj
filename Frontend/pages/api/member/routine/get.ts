import { NextApiRequest, NextApiResponse } from "next";
import pool from "@/db";

export default async function getMemberRoutines(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { member_username } = req.body;

  try {
    const query = `
            SELECT * FROM exercise_routine
            WHERE member_username = $1;`;

    const result = await pool.query(query, [member_username]);
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}
