import { NextApiRequest, NextApiResponse } from 'next';
import pool from "@/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { member_username } = req.body;

    const query = `
    SELECT goal_type
    FROM member_goal
    WHERE member_username = $1 AND achieved = FALSE;
  `;

    try {
        const result = await pool.query(query, [member_username]);

        const unachievedGoals = result.rows.map(row => ({
            goal_type: row.goal_type,
        }));

        res.status(200).json(unachievedGoals);
    } catch (error) {
        console.error('Error querying unachieved goals:', error);
        res.status(500).json({ error: "Failed to retrieve unachieved goals" });
    }
}
