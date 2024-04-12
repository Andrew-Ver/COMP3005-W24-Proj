import { NextApiRequest, NextApiResponse } from "next";
import pool from "@/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const query = `
          SELECT
            e.equipment_id,
            e.description,
            e.room_id,
            r.description AS room_name,
            e.needs_maintenance,
            e.last_maintained_at AT TIME ZONE 'UTC' AT TIME ZONE 'America/New_York' AS last_maintained_at
          FROM equipment e
          JOIN room r ON e.room_id = r.room_id
          ORDER BY e.equipment_id;
        `;

    const result = await pool.query(query);

    const metrics = result.rows.map((row) => ({
      equipment_id: row.equipment_id,
      description: row.description,
      room_id: row.room_id,
      room_name: row.room_name,
      needs_maintenance: row.needs_maintenance,
      last_maintained_at: row.last_maintained_at
        ? row.last_maintained_at.toISOString().replace("T", " ").slice(0, -5)
        : null,
    }));

    res.status(200).json(metrics);
  } catch (error) {
    console.error("Database query error", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
