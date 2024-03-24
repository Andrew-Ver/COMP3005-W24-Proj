import { User } from "next-auth";

import { compare } from "bcrypt";

// Some sample users just to test authentication
//
const users: any = [
    {
        "username": "john_member",
        "password": "member",
        "firstname": "John",
        "lastname": "Member",
        "role": "member"
    },
    {
        "username": "jane_trainer",
        "password": "trainer",
        "firstname": "Jane",
        "lastname": "Trainer",
        "role": "admin"
    },
    {
        "username": "karl-employee",
        "password": "employee",
        "firstname": "Karl",
        "lastname": "Employee",
        "role": "staff",
        "name": "The Alan Reviews",
        "email": "some email",
        "id": 1,
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
