import { NextApiRequest, NextApiResponse } from 'next';
import pool, { TimeSlot } from "@/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse<TimeSlot[]>) {

  const query = `SELECT  
                 ta.availability_id,
                 ta.trainer_username,
                 ta.is_booked,
                 ta.begin_time AT TIME ZONE 'UTC' AT TIME ZONE 'America/New_York' AS begin_time, 
                 ta.end_time AT TIME ZONE 'UTC' AT TIME ZONE 'America/New_York' AS end_time,
                 t.rate_per_hour,
                 a.name AS trainer_name
                 FROM trainer_availability ta
                 JOIN trainer t ON ta.trainer_username = t.trainer_username
                 JOIN account a ON t.trainer_username = a.username
                 WHERE ta.is_booked = FALSE
                 ORDER BY ta.begin_time ASC;`;

  const result = await pool.query(query);

  // Convert datetime "2020-01-01T09:00:00.000Z" to "2020-01-01 09:00:00"
  // among a few other changes
  result.rows.forEach((row: any) => {

    // get the duration
    const beginTimestamp = new Date(row.begin_time).getTime();
    const endTimestamp = new Date(row.end_time).getTime();
    const durationMs = endTimestamp - beginTimestamp;
    const durationHours = durationMs / (1000 * 60 * 60);

    // calculate the amount
    row.fee = row.rate_per_hour * durationHours;
    row.begin_time = new Date(row.begin_time).toISOString().replace("T", " ").slice(0, -5);
    row.end_time = new Date(row.end_time).toISOString().replace("T", " ").slice(0, -5);
  });

  res.status(200).json(result.rows);
}