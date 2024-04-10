import pool from "@/db";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { searchQuery } = req.body;

    const query = `
      SELECT m.member_username, a.name, m.age, m.gender, STRING_AGG(mg.goal_type, ', ') AS goals
      FROM member m
      JOIN account a ON m.member_username = a.username
      LEFT JOIN member_goal mg ON m.member_username = mg.member_username
      WHERE LOWER(a.username) LIKE '%' || LOWER($1) || '%'
         OR LOWER(a.name) LIKE '%' || LOWER($1) || '%'
      GROUP BY m.member_username, a.name, m.age, m.gender;
    `;

    const result = await pool.query(query, [searchQuery.toLowerCase()]);
    const rows = result.rows.map(row => ({
      ...row,
      goals: row.goals && row.goals.length > 50 ? `${row.goals.substring(0, 47)}...` : row.goals
    }));

    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
