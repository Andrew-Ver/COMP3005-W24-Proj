import { NextApiRequest, NextApiResponse } from 'next'
import pool, { Metric } from '@/db'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Metric[]>
) {
    const { metric_timestamp, username } = req.body

    // Convert timestamp?
    const isoTimestamp = new Date(metric_timestamp).toISOString()

    // Delete a specicific timestamp'd metric from the DB
    const query = `DELETE FROM health_metric WHERE member_username = $1 AND metric_timestamp = $2;`

    const result = await pool.query(query, [username, isoTimestamp])

    res.status(200).json(result.rows)
}
