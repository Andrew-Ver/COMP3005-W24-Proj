import { NextApiRequest, NextApiResponse } from "next";
import pool, { Metric } from "@/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Metric[]>,
) {
  const { username, weight, body_fat_percentage, blood_pressure } = req.body;
  // Only split up blood pressure if it's delimited by /
  let systolic_pressure = "0";
  let diastolic_pressure = "0";
  if (blood_pressure.includes("/")) {
    [systolic_pressure, diastolic_pressure] = blood_pressure.split("/");
  }

  // const formatted_time = new Intl.DateTimeFormat('en-US', options).format(new Date());
  const formatted_time = new Date().toISOString();

  // Fetch user data from the DB and return object
  const query = `
                                INSERT INTO health_metric(metric_timestamp, member_username, weight, body_fat_percentage, systolic_pressure, diastolic_pressure)
                                VALUES (NOW(), $1, $2, $3, $4, $5);`;

  const result = await pool.query(query, [
    username,
    weight,
    body_fat_percentage,
    systolic_pressure,
    diastolic_pressure,
  ]);

  res.status(200).json(result.rows);
}
