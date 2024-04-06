import { NextApiRequest, NextApiResponse } from 'next';
import pool from "@/db";

export default async function createUserGoal(req: NextApiRequest, res: NextApiResponse) {
    const { member_username, goal_type } = req.body;

    try {
        const query = `
          INSERT INTO member_goal (member_username, goal_type)
          VALUES ($1, $2)
          RETURNING *;
        `;

        const result = await pool.query(query, [member_username, goal_type]);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Database query error', error);
        res.status(500).json({ message: "Internal server error" });
    }
}
