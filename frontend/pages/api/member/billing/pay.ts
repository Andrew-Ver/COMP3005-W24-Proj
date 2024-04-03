import { NextApiRequest, NextApiResponse } from 'next';
import pool from "@/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { bill_ids } = req.body;
    try {
        if (bill_ids.length > 0) {
            // Construct a single SQL query to update all specified bills at once
            const query = `
                UPDATE bill
                SET cleared = TRUE
                WHERE bill_id = ANY($1)
            `;
            await pool.query(query, [bill_ids]);

            // Send a success response
            res.status(200).json({ message: 'Bills updated successfully' });
        } else {
            // Handle the case where no bill IDs were provided
            res.status(400).json({ message: 'No bill IDs provided' });
        }
    } catch (error) {
        // Send an error response if there's any issue with updating the bills
        console.error('Error updating bills:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}