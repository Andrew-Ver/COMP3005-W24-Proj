import { NextApiRequest, NextApiResponse } from "next";
import pool, { TimeSlot } from "@/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TimeSlot[]>,
) {
  const query = `SELECT  
                availability_id
                FROM trainer_availability
                WHERE is_booked = FALSE;`;

  const result = await pool.query(query);

  res.status(200).json(result.rows);
}
