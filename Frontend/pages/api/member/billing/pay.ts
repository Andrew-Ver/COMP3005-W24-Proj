import { NextApiRequest, NextApiResponse } from "next";
import pool from "@/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { bill_ids } = req.body;
  try {
    if (bill_ids.length > 0) {
      const query = `
                UPDATE bill
                SET cleared = TRUE
                WHERE bill_id = ANY($1)
            `;
      await pool.query(query, [bill_ids]);

      res.status(200).json({ message: "Bills updated successfully" });
    } else {
      res.status(400).json({ message: "No bill IDs provided" });
    }
  } catch (error) {
    console.error("Error updating bills:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
