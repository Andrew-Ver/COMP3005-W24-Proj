import { NextApiRequest, NextApiResponse } from "next";
import pool from "@/db";

export default async function markSessionsComplete(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { session_ids } = req.body;
  try {
    if (session_ids && session_ids.length > 0) {
      const query = `
                UPDATE personal_training_session
                SET completed = TRUE
                WHERE session_id = ANY($1)
            `;
      await pool.query(query, [session_ids]);

      res
        .status(200)
        .json({ message: "Sessions marked as complete successfully" });
    } else {
      res.status(400).json({ message: "No session IDs provided" });
    }
  } catch (error) {
    console.error("Error marking sessions as complete:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
