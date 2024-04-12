import { NextApiRequest, NextApiResponse } from "next";
import pool, { Metric } from "@/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Metric[]>,
) {
  const username: string = req.body?.username;
  // if (req.method !== 'GET') {
  //   return res.status(405);
  // }
  // Fetch user data from the DB and return object
  const query = `SELECT member_username, metric_timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'America/New_York' AS metric_timestamp, weight, body_fat_percentage, systolic_pressure, diastolic_pressure
                FROM health_metric
                WHERE member_username = $1
                ORDER BY metric_timestamp DESC;`;

  const result = await pool.query(query, [username]);

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false, // Use 24-hour format
    timeZoneName: "short", // Display the time zone abbreviation
  };

  // Convert result systolic and diastolic pressure to blood pressure
  // among a few other changes
  result.rows.forEach((row: any) => {
    row.blood_pressure = `${row.systolic_pressure}/${row.diastolic_pressure}`;
    delete row.systolic_pressure;
    delete row.diastolic_pressure;
    row.metric_timestamp = row.metric_timestamp = new Date(row.metric_timestamp)
      .toISOString()
      .replace("T", " ")
      .slice(0, -5);
    // row.metric_timestamp = new Intl.DateTimeFormat('en-US', options).format(new Date(row.metric_timestamp));
    row.weight = row.weight + " lbs";
    row.body_fat_percentage = row.body_fat_percentage + "%";
  });

  res.status(200).json(result.rows);
}
