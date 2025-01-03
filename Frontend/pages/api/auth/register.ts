import pool from '@/db'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' })
    }
    const { username, name, password, role, rate, gender, age } = req.body

    try {
        // Don't hash password for Assignment

        const createAccountQuery = `INSERT INTO account (username, name, password, user_type)
        VALUES ($1, $2, $3, $4)
        RETURNING username, name, password, user_type;`

        const accountCreationResult = await pool.query(createAccountQuery, [
            username,
            name,
            password,
            role
        ])

        if (role === 'member') {
            const insertionQuery = `
                            INSERT INTO member (member_username, age, gender)
                            VALUES ($1, $2, $3)
                            RETURNING *;`

            const userInsertionResult = await pool.query(insertionQuery, [
                username,
                age,
                gender
            ])
        } else if (role === 'trainer') {
            const insertionQuery = `
                            INSERT INTO trainer (trainer_username, rate_per_hour)
                            VALUES ($1, $2)
                            RETURNING *;`

            const userInsertionResult = await pool.query(insertionQuery, [
                username,
                rate
            ])
        } else if (role === 'admin') {
            const insertionQuery = `
                            INSERT INTO administrator (admin_username)
                            VALUES ($1)
                            RETURNING *;`
            const userInsertionResult = await pool.query(insertionQuery, [
                username
            ])
        }
        //return newly created user
        res.status(201).json({ user: accountCreationResult.rows[0] })
    } catch (error: any) {
        // console.log(error);
        const errorCodes: Record<string, string> = {
            '23505': 'Username already exists',
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
