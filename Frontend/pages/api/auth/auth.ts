import pool from '@/db'
import { User } from 'next-auth'

type LoginFn = (username: string, password: string) => Promise<User | null>

export const login: LoginFn = async (username, password) => {
    try {
        const query = `SELECT * FROM account WHERE username = $1 AND is_deleted = FALSE`

        const result = await pool.query(query, [username])

        if (result.rows.length === 1) {
            const user = result.rows[0]
            // Remove hashing for now, because for assignment spec we cannot use hashing in DML queries
            //const passwordMatch = await compare(password, user.password_hash);
            const passwordMatch = password === user.password
            if (passwordMatch) {
                // Passwords match, return user object without password
                delete user.password_hash
                user.role = user.user_type
                return user
            }
        }

        return null // Username or password incorrect, return null
    } catch (error) {
        throw error
    }
}
