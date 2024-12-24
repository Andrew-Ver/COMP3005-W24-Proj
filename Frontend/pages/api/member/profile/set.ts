import { NextApiRequest, NextApiResponse } from 'next'
import pool from '@/db'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<any>
) {
    const { gender, age, username } = req.body

    try {
        const query = `UPDATE member
                        SET gender = $1, age = $2
                        WHERE member_username = $3;
                        `

        const result = await pool.query(query, [gender, age, username])
        res.status(200).json({ success: true })
    } catch (error) {
        res.status(500).json({ success: false })
        return
    }
}
