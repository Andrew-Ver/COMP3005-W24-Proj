import { NextApiRequest, NextApiResponse } from "next";
import pool, { Specialty } from "@/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Specialty[]>,
) {
  const { trainer_username, specialty } = req.body;

  // Fetch user data from the DB and return object
  const query = `
                                INSERT INTO trainer_specialty(trainer_username, specialty)
                                VALUES ($1, $2);`;

  const result = await pool.query(query, [trainer_username, specialty]);

  res.status(200).json(result.rows);
}
