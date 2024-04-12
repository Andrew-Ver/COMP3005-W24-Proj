import pool from "@/db";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { username } = req.body;

  try {
    const query = "SELECT age, gender FROM member WHERE member_username = $1";
    const result = await pool.query(query, [username]);

    if (result.rows.length > 0) {
      const age = result.rows[0].age;
      const gender = result.rows[0].gender;
      return res.status(200).json({ age: age, gender: gender });
    } else {
      return res.status(404).json({ message: "Age and gender not found" });
    }
  } catch (error) {
    console.error("Error fetching age and gender:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
