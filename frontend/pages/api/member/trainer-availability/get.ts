import { NextApiRequest, NextApiResponse } from 'next';
import pool, { TimeSlot } from "@/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse<TimeSlot[]>) {

  const query = `SELECT  
                availability_id,
                trainer_username,
                is_booked,
                begin_time AT TIME ZONE 'UTC' AT TIME ZONE 'America/New_York' AS begin_time, 
                end_time AT TIME ZONE 'UTC' AT TIME ZONE 'America/New_York' AS end_time
                FROM trainer_availability
                ORDER BY begin_time ASC;`;

  const result = await pool.query(query);

  // Convert datetime "2020-01-01T09:00:00.000Z" to "2020-01-01 09:00:00"
  // among a few other changes
  result.rows.forEach((row: any) => {
    row.begin_time = new Date(row.begin_time).toISOString().replace("T", " ").slice(0, -5);
    row.end_time = new Date(row.end_time).toISOString().replace("T", " ").slice(0, -5);
  });

  res.status(200).json(result.rows);
}