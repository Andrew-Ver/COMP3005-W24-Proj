import { NextApiRequest, NextApiResponse } from "next";
import pool from "@/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { member_username } = req.body;

  const query = `
    SELECT goal_type
    FROM member_goal
    WHERE member_username = $1 AND achieved = TRUE;
  `;

  try {
    const result = await pool.query(query, [member_username]);

    const achievedGoals = result.rows.map((row) => ({
      goal_type: row.goal_type,
    }));

    res.status(200).json(achievedGoals);
  } catch (error) {
    console.error("Error querying achieved goals:", error);
    res.status(500).json({ error: "Failed to retrieve achieved goals" });
  }
}
