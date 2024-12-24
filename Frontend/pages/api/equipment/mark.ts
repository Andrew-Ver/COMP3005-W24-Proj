import { NextApiRequest, NextApiResponse } from 'next'
import pool from '@/db'

export default async function markEquipmentAsNeedingMaintenance(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { equipment_id } = req.body

    try {
        const query = `UPDATE equipment SET needs_maintenance = TRUE WHERE equipment_id = ANY($1);`

        await pool.query(query, [equipment_id])

        res.status(200).json({
            message: 'Equipment marked as needing maintenance'
        })
    } catch (error) {
        console.error('Database query error', error)
        res.status(500).json({ message: 'Internal server error' })
    }
}
