import { NextApiRequest, NextApiResponse } from 'next';
import pool from "@/db";

export default async function getCompletedClasses(req: NextApiRequest, res: NextApiResponse) {
    const { member_username } = req.body;

    const query = `
        SELECT 
          gc.class_id,
          a.name AS trainer_name,
          ta.end_time AT TIME ZONE 'UTC' AT TIME ZONE 'America/New_York' AS end_time,
          gc.description
        FROM class_member cm
        INNER JOIN group_class gc ON cm.class_id = gc.class_id
        INNER JOIN trainer_availability ta ON gc.availability_id = ta.availability_id
        INNER JOIN trainer t ON ta.trainer_username = t.trainer_username
        INNER JOIN account a ON t.trainer_username = a.username
        WHERE 
          cm.member_username = $1 
          AND gc.completed = TRUE
        ORDER BY ta.end_time ASC;
    `;

    try {
        const result = await pool.query(query, [member_username]);
        result.rows.forEach((row: any) => {
            row.end_time = new Date(row.end_time).toISOString().replace("T", " ").slice(0, -5);
        });
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
