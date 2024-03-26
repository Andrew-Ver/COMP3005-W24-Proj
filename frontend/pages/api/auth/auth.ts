import { User } from "next-auth";
import { compare } from "bcrypt";
import pool from "../../../db"

// Some sample users just to test authentication
//
const users: any = [
    {
        "username": "karl_member",
        "password": "member",
        "role": "trainer",
        "name": "The Mad Abdul Alhazred",
        "id": 1,
    },
    {
        "username": "jane_trainer",
        "password": "trainer",
        "name": "Jane Trainer",
        "role": "trainer",
        "id": 2
    },
    {
        "username": "karl_employee",
        "password": "employee",
        "role": "admin",
        "name": "The Mad Abdul Alhazred",
        "id": 3,
    }
]

type LoginFn = (username: string, password: string) => Promise<User | null>;

export const login: LoginFn = async (username, password) => {
    // const user = users.find((user: any) => user.username === username);
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM users WHERE username = $1', [username]);
        console.log("result: ", result)
        client.release();

        if (result.rows.length === 1) {
            const user = result.rows[0];
            console.log("user: ", user);
            const passwordMatch = await compare(password, user.password_hash);
            if (passwordMatch) {
                // Passwords match, return user object without password
                delete user.password_hash;
                return user;
            }
        }
        return null; // Username or password incorrect
    } catch (error) {
        console.error('Error authenticating user:', error);
        throw error;
    }
}
