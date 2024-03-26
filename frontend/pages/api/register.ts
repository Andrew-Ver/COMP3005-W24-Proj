import { NextApiRequest, NextApiResponse } from "next";
import {hash} from 'bcrypt';
import pool from '../../db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({message: 'Method Not Allowed'});
    }
    const {username, password, role} = req.body;

    try {
        // hash password
        const hashedPassword = await hash(password, 10); // You can adjust the salt rounds as needed
        const query = `
        INSERT INTO users (username, password_hash, role)
        VALUES ($1, $2, $3)
        RETURNING id, username, role;`;

        const result = await pool.query(query, [username, hashedPassword, role]);
        
        //return newly created user
        res.status(201).json({ user: result.rows[0] });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}