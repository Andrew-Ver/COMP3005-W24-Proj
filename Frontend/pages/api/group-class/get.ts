import { NextApiRequest, NextApiResponse } from 'next'
import pool from '@/db'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { member_username } = req.body

    if (!member_username) {
        return res.status(400).json({ message: 'member_username is required' })
    }

    const query = `
    SELECT gc.class_id, gc.description, gc.fee, r.description AS roomname, gc.completed, ta.begin_time AT TIME ZONE 'UTC' AT TIME ZONE 'America/New_York' AS begin_time, ta.end_time AT TIME ZONE 'UTC' AT TIME ZONE 'America/New_York' AS end_time,
           CASE 
             WHEN cm.member_username IS NOT NULL THEN TRUE
             ELSE FALSE
           END AS signed_up
    FROM group_class gc
    INNER JOIN trainer_availability ta ON gc.availability_id = ta.availability_id
    LEFT JOIN class_member cm ON gc.class_id = cm.class_id AND cm.member_username = $1
    LEFT JOIN room r ON gc.room_id = r.room_id
    WHERE gc.completed = FALSE AND ta.end_time > NOW();
  `

    try {
        const result = await pool.query(query, [member_username])
        const metrics = result.rows.map((row) => ({
            class_id: row.class_id,
            description: row.description,
            fee: row.fee,
            room_id: row.roomname,
            completed: row.completed,
            begin_time: (row.begin_time = new Date(row.begin_time)
                .toISOString()
                .replace('T', ' ')
                .slice(0, -5)),
            end_time: (row.end_time = new Date(row.end_time)
                .toISOString()
                .replace('T', ' ')
                .slice(0, -5)),
            signed_up: row.signed_up
        }))
        res.status(200).json(metrics)
    } catch (error) {
        console.error('Database query error', error)
        res.status(500).json({ message: 'Internal server error' })
    }
}
