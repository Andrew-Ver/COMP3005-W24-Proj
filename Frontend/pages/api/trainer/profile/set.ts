import { NextApiRequest, NextApiResponse } from "next";
import pool, { Specialty } from "@/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>,
) {
  const { rate, username } = req.body;

  try {
    const query = `UPDATE trainer
                        SET rate_per_hour = $1
                        WHERE trainer_username = $2;
                        `;

    const result = await pool.query(query, [rate, username]);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error updating rate per hour:", error);
    res.status(500).json({ success: false });
    return;
  }
}
