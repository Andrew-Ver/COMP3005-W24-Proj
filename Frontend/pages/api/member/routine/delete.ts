import { NextApiRequest, NextApiResponse } from "next";
import pool from "@/db";

export default async function deleteExerciseRoutine(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { member_username, description } = req.body;

  try {
    const query = `
            DELETE FROM exercise_routine
            WHERE member_username = $1 AND description = $2
            RETURNING *;`;

    const result = await pool.query(query, [member_username, description]);
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}
