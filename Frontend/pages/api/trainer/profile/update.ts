import { NextApiRequest, NextApiResponse } from 'next'
import pool, { Specialty } from '@/db'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Specialty[]>
) {
    const { trainer_username, old_specialty, new_specialty } = req.body

    const query = `UPDATE trainer_specialty SET specialty = $3 WHERE trainer_username = $1 AND specialty = $2`
    const result = await pool.query(query, [
        trainer_username,
        old_specialty,
        new_specialty
    ])

    res.status(200).json(result.rows)
}
