import { NextApiRequest, NextApiResponse } from "next";
import pool from "@/db";

export default async function addTrainerAvailability(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { username, begin_time, end_time } = req.body;

  const conflictCheckQuery = `
        SELECT 1
        FROM trainer_availability
        WHERE trainer_username = $1
        AND NOT (end_time <= $2 OR begin_time >= $3)
    `;

  const insertQuery = `
        INSERT INTO trainer_availability (trainer_username, is_booked, begin_time, end_time)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
    `;

  try {
    const conflictCheckResult = await pool.query(conflictCheckQuery, [
      username,
      begin_time,
      end_time,
    ]);
    if (conflictCheckResult.rows.length > 0) {
      console.log(conflictCheckResult.rows);
      return res.status(409).json({ message: "Time slot conflict detected." });
    }

    const insertResult = await pool.query(insertQuery, [
      username,
      false,
      begin_time,
      end_time,
    ]);
    res.status(200).json(insertResult.rows[0]);
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
