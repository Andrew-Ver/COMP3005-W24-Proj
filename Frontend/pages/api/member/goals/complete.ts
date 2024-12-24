import { NextApiRequest, NextApiResponse } from 'next'
import pool from '@/db'

export default async function completeUserGoal(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { member_username, goal_types } = req.body

    try {
        const query = `
          UPDATE member_goal
          SET achieved = TRUE
          WHERE member_username = $1 AND goal_type = ANY($2)
          RETURNING *;
        `

        const result = await pool.query(query, [member_username, goal_types])

        if (result.rows.length === 0) {
            res.status(404).json({ message: 'Goal not found' })
        } else {
            res.status(200).json(result.rows[0])
        }
    } catch (error) {
        console.error('Database query error', error)
        res.status(500).json({ message: 'Internal server error' })
    }
}
