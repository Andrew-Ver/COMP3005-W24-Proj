import { NextApiRequest, NextApiResponse } from 'next';
import pool from "@/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    const { bill_ids } = req.body;
    try {
        for (const bill_id of bill_ids) {
            // Execute the SQL query to update the `bill` table for each `bill_id`
            const query = `
            UPDATE bill
            SET cleared = TRUE
            WHERE bill_id = $1
        `;
            await pool.query(query, [bill_id]);
        }

        // Send a success response
        res.status(200).json({ message: 'Bills updated successfully' });
    } catch (error) {
        // Send an error response if there's any issue with updating the bills
        console.error('Error updating bills:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}