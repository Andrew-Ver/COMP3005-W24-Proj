import { User } from "next-auth";

import { compare } from "bcrypt";

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
    const user = users.find((user: any) => user.username === username);

    // Plaintext password comparison is not recommended
    // change to use bcrypt.compare() and store hashed passwords later
    if (user && (password === user.password) ) {
        return user;
    } else {
        return null;
    }
}
