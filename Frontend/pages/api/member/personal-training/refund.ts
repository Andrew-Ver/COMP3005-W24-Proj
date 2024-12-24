import { NextApiRequest, NextApiResponse } from 'next'
import pool from '@/db'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' })
    }
    const { session_ids } = req.body

    try {
        const sessionQuery = `
            SELECT 
                pts.availability_id, 
                ta.begin_time, 
                ta.end_time, 
                t.rate_per_hour,
                pts.description,
                pts.member_username
            FROM personal_training_session pts
            INNER JOIN trainer_availability ta ON pts.availability_id = ta.availability_id
            INNER JOIN trainer t ON ta.trainer_username = t.trainer_username
            WHERE pts.session_id = ANY($1);
        `
        const sessionResult = await pool.query(sessionQuery, [session_ids])
        if (sessionResult.rows.length === 0) {
            console.log('Session not found')
            return res.status(404).json({ message: 'Session not found' })
        }

        const {
            availability_id,
            begin_time,
            end_time,
            rate_per_hour,
            description,
            member_username
        } = sessionResult.rows[0]

        // make the session available again
        const makeAvailableQuery = `
            UPDATE trainer_availability
            SET is_booked = FALSE
            WHERE availability_id = $1;
        `
        await pool.query(makeAvailableQuery, [availability_id])

        // calculate refund amount
        const beginTimestamp = new Date(begin_time).getTime()
        const endTimestamp = new Date(end_time).getTime()
        const durationMs = endTimestamp - beginTimestamp
        const durationHours = durationMs / (1000 * 60 * 60)
        const amount = -(rate_per_hour * durationHours) // negative for refund

        // insert refund bill
        const insertBillQuery = `
            INSERT INTO bill (member_username, amount, description, bill_timestamp, cleared)
            VALUES ($1, $2, 'Refund: ' || $3, NOW(), TRUE)
            RETURNING *;
        `
        const refundResult = await pool.query(insertBillQuery, [
            member_username,
            amount,
            description
        ])

        const deleteSessionQuery = `
            DELETE FROM personal_training_session
            WHERE session_id = ANY($1);
        `
        await pool.query(deleteSessionQuery, [session_ids])

        //return refund bill information
        res.status(201).json({ refund: refundResult.rows[0] })
    } catch (error: any) {
        const errorCodes: Record<string, string> = {
            '23505': 'Refund already processed',
            '22P02': 'Invalid input',
            '23502': 'Missing input',
            '23503': 'Invalid role',
            '22001': 'Input too long',
            '22007': 'Invalid input',
            '23514': 'Invalid input'
        }

        return res.status(400).json({
            message: errorCodes[error.code] || 'Internal Server Error'
        })
    }
}
