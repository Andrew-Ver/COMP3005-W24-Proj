import { NextApiRequest, NextApiResponse } from 'next'
import pool from '@/db'

export default async function addExerciseRoutine(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { member_username, description } = req.body

    try {
        const query = `
            INSERT INTO exercise_routine(member_username, description)
            VALUES ($1, $2)
            RETURNING *;`

        const result = await pool.query(query, [member_username, description])
        res.status(200).json(result.rows)
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' })
    }
}
