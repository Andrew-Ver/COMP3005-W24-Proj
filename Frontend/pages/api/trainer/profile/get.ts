import { NextApiRequest, NextApiResponse } from 'next'
import pool from '@/db'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<any>
) {
    const { trainer_username } = req.body

    const query = `SELECT *
                FROM trainer_specialty
                WHERE trainer_username = $1`

    const result = await pool.query(query, [trainer_username])

    // console.log('result', result.rows);

    res.status(200).json(result.rows)
}
