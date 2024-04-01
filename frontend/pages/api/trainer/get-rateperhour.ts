import pool from "../../../db";
import { NextApiRequest, NextApiResponse } from "next";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    const { username } = req.body;

    try {
        // Query the database to get the rate per hour for the trainer
        const query = "SELECT rate_per_hour FROM trainer WHERE trainer_username = $1";
        const result = await pool.query(query, [username]);

        // If the query is successful, return the rate per hour
        if (result.rows.length > 0) {
            const ratePerHour = result.rows[0].rate_per_hour;
            return res.status(200).json({ rate_per_hour: ratePerHour });
        } else {
            return res.status(404).json({ message: "Rate per hour not found" });
        }
    } catch (error) {
        console.error("Error fetching rate per hour:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
