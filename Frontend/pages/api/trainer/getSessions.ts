import { NextApiRequest, NextApiResponse } from "next";
import pool from "@/db";

export default async function getSession(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { trainer_name } = req.body;

  const query = `
        SELECT 
          pts.session_id,
          m.name AS member_name,
          ta.begin_time AT TIME ZONE 'UTC' AT TIME ZONE 'America/New_York' AS begin_time,
          ta.end_time AT TIME ZONE 'UTC' AT TIME ZONE 'America/New_York' AS end_time,
          pts.description
        FROM personal_training_session pts
        INNER JOIN trainer_availability ta ON pts.availability_id = ta.availability_id
        INNER JOIN trainer t ON ta.trainer_username = t.trainer_username
        INNER JOIN account m ON pts.member_username = m.username
        WHERE 
          t.trainer_username = $1
          AND pts.completed = FALSE
        ORDER BY ta.begin_time ASC;
    `;

  try {
    const result = await pool.query(query, [trainer_name]);
    result.rows.forEach((row: any) => {
      row.begin_time = new Date(row.begin_time)
        .toISOString()
        .replace("T", " ")
        .slice(0, -5);
      row.end_time = new Date(row.end_time)
        .toISOString()
        .replace("T", " ")
        .slice(0, -5);
    });
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
