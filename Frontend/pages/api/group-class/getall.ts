import { NextApiRequest, NextApiResponse } from 'next'
import pool from '@/db'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const query = `
        SELECT 
          gc.class_id,
          a.name AS trainer_name,
          ta.begin_time AT TIME ZONE 'UTC' AT TIME ZONE 'America/New_York' AS begin_time,
          ta.end_time AT TIME ZONE 'UTC' AT TIME ZONE 'America/New_York' AS end_time,
          r.description AS room_name,
          gc.fee,
          gc.availability_id,
          gc.room_id,
          gc.description
        FROM group_class gc
        INNER JOIN trainer_availability ta ON gc.availability_id = ta.availability_id
        INNER JOIN trainer t ON ta.trainer_username = t.trainer_username
        INNER JOIN account a ON t.trainer_username = a.username
        LEFT JOIN room r ON gc.room_id = r.room_id
        WHERE gc.completed = FALSE
        ORDER BY ta.begin_time ASC;
    `

    try {
        const result = await pool.query(query)
        result.rows.forEach((row: any) => {
            row.begin_time = new Date(row.begin_time)
                .toISOString()
                .replace('T', ' ')
                .slice(0, -5)
            row.end_time = new Date(row.end_time)
                .toISOString()
                .replace('T', ' ')
                .slice(0, -5)
        })
        res.status(200).json(result.rows)
    } catch (error) {
        console.error('Error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}
