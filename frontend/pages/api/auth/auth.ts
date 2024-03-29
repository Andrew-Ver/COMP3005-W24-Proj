import { User } from "next-auth";
import { compare } from "bcrypt";
import pool from "../../../db";

type LoginFn = (username: string, password: string) => Promise<User | null>;

export const login: LoginFn = async (username, password) => {
    // const user = users.find((user: any) => user.username === username);
    try {
        const client = await pool.connect();
        const result = await client.query(
            "SELECT * FROM account WHERE username = $1",
            [username.toLowerCase()]
        );
        client.release();

        if (result.rows.length === 1) {
            const user = result.rows[0];
            // Remove hashing for now, because for assignment spec we cannot use hashing in DML queries
            //const passwordMatch = await compare(password, user.password_hash);
            const passwordMatch = password === user.password;

            if (passwordMatch) {
                // Passwords match, return user object without password
                delete user.password_hash;
                user.role = user.user_type;
                return user;
            }
        }
        return null; // Username or password incorrect
    } catch (error) {
        //console.error("Error authenticating user:", error);
        throw error;
    }
};
