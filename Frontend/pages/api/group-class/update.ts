import { NextApiRequest, NextApiResponse } from "next";
import pool from "@/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { class_id, availability_id, room_id, description, fee } = req.body;
  console.log(req.body);

  try {
    await pool.query("BEGIN");

    const currentAvailability = await pool.query(
      `SELECT availability_id FROM group_class WHERE class_id = $1`,
      [class_id],
    );

    if (
      currentAvailability.rows.length > 0 &&
      currentAvailability.rows[0].availability_id
    ) {
      const currentAvailabilityId = currentAvailability.rows[0].availability_id;
      await pool.query(
        `UPDATE trainer_availability SET is_booked = FALSE WHERE availability_id = $1`,
        [currentAvailabilityId],
      );
    }

    await pool.query(
      `UPDATE group_class 
      SET availability_id = $1, room_id = $2, description = $3, fee = $4 
      WHERE class_id = $5`,
      [availability_id, room_id, description, fee, class_id],
    );

    await pool.query(
      `UPDATE trainer_availability SET is_booked = TRUE WHERE availability_id = $1`,
      [availability_id],
    );

    await pool.query("COMMIT");

    res.status(200).json({ success: true });
  } catch (error) {
    await pool.query("ROLLBACK");
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
}
