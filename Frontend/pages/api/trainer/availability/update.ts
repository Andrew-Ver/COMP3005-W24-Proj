import { NextApiRequest, NextApiResponse } from "next";
import pool from "@/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { availability_id, begin_time, end_time, trainer_username } = req.body;

  try {
    const conflictCheckQuery = `
      SELECT 1
      FROM trainer_availability
      WHERE trainer_username = $4
      AND NOT (end_time <= $1 OR begin_time >= $2)
      AND availability_id != $3
    `;
    const conflictCheckResult = await pool.query(conflictCheckQuery, [
      begin_time,
      end_time,
      availability_id,
      trainer_username,
    ]);

    if (conflictCheckResult.rows.length > 0) {
      console.log(conflictCheckResult.rows);
      return res
        .status(409)
        .json({
          message: "The new time slot conflicts with existing availability.",
        });
    }

    const updateQuery = `UPDATE trainer_availability
                         SET begin_time = $1, end_time = $2
                         WHERE availability_id = $3
                         RETURNING *;`;
    const updateResult = await pool.query(updateQuery, [
      begin_time,
      end_time,
      availability_id,
    ]);

    if (updateResult.rows.length > 0) {
      res.status(200).json(updateResult.rows);
    } else {
      res
        .status(404)
        .json({ message: "No availability found with the provided ID." });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
