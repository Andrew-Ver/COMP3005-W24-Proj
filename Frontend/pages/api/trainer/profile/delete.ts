import { NextApiRequest, NextApiResponse } from 'next'
import pool, { Specialty } from '@/db'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Specialty[]>
) {
    const { trainer_username, specialty } = req.body

    const query = `DELETE FROM trainer_specialty WHERE trainer_username = $1 AND specialty = $2;`

    const result = await pool.query(query, [trainer_username, specialty])

    res.status(200).json(result.rows)
}
