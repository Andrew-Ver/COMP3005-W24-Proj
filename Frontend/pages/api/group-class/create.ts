import { NextApiRequest, NextApiResponse } from "next";
import pool from "@/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { availability_id, room_id, description, fee } = req.body;

  const query = `
    INSERT INTO group_class (availability_id, room_id, description, fee)
    VALUES ($1, $2, $3, $4);`;

  await pool.query(
    "UPDATE trainer_availability SET is_booked=TRUE WHERE availability_id = ($1)",
    [availability_id],
  );

  const result = await pool.query(query, [
    availability_id,
    room_id,
    description,
    fee,
  ]);

  res.status(200).json(result.rows);
}
