import { NextApiRequest, NextApiResponse } from 'next'
import pool from '@/db'

export default async function getUserHealthMetrics(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { member_username } = req.body

    try {
        const query = `
            WITH LatestMetrics AS (
                SELECT 
                    weight,
                    body_fat_percentage,
                    systolic_pressure,
                    diastolic_pressure,
                    ROW_NUMBER() OVER (PARTITION BY member_username ORDER BY metric_timestamp DESC) as rn
                FROM health_metric
                WHERE member_username = $1
            ), Averages AS (
                SELECT
                    AVG(weight) AS avg_weight,
                    AVG(body_fat_percentage) AS avg_body_fat_percentage,
                    AVG(systolic_pressure) AS avg_systolic_pressure,
                    AVG(diastolic_pressure) AS avg_diastolic_pressure
                FROM health_metric
                WHERE member_username = $1
            )
            SELECT 
                a.*,
                l.weight AS latest_weight,
                l.body_fat_percentage AS latest_body_fat_percentage,
                l.systolic_pressure AS latest_systolic_pressure,
                l.diastolic_pressure AS latest_diastolic_pressure
            FROM Averages a, LatestMetrics l
            WHERE l.rn = 1;
        `

        const result = await pool.query(query, [member_username])
        if (result.rows.length > 0) {
            const row = result.rows[0]
            const formattedResult = {
                avg_weight: parseFloat(row.avg_weight).toFixed(2),
                avg_body_fat: parseFloat(row.avg_body_fat_percentage).toFixed(
                    2
                ),
                avg_pressure: `${parseFloat(row.avg_systolic_pressure).toFixed(2)}/${parseFloat(row.avg_diastolic_pressure).toFixed(2)}`,
                latest_weight: parseFloat(row.latest_weight).toFixed(2),
                latest_body_fat: parseFloat(
                    row.latest_body_fat_percentage
                ).toFixed(2),
                latest_pressure: `${row.latest_systolic_pressure}/${row.latest_diastolic_pressure}`
            }
            res.status(200).json(formattedResult)
        } else {
            const defaultResult = {
                avg_weight: 'N/A',
                avg_body_fat: 'N/A',
                avg_pressure: 'N/A/N/A',
                latest_weight: 'N/A',
                latest_body_fat: 'N/A',
                latest_pressure: 'N/A/N/A'
            }
            res.status(200).json(defaultResult)
        }
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Internal Server Error' })
    }
}
