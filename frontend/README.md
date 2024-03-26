# Frontend using Next.js for COMP3005 Final Project

Health and Fitness club management system with user authentication, role-based authorization, and more.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.


### Running


#### Setup frontend

```bash
git clone 'https://github.com/Andrew-Ver/COMP3005-W24-Proj.git'
cd COMP3005-W24-Proj/frontend
npm install
npm run dev
```

If you get the jwt_session_error, you need to make a secret for nextauth:
create `.env.local` in root directory 
run `openssl rand -base64 32`
`.env.local` should be: `NEXTAUTH_SECRET=[the output of that command]`

#### Setup backend
1. Set up and run a database in PostgreSQL
2. In `.env.local`, add the following lines:
```bash
DB_HOST=[your_database_host]
DB_PORT=[your_database_port]
DB_USER=[your_database_name]
DB_PASSWORD=[your_database_password]
DB_NAME=[your_database_name]
```
3. Create tables using following queries:
```bash
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL
);
```



## Built With

* [Next.js](https://nextjs.org/) - Web Framework
* [NextAuth.js](https://next-auth.js.org/) - Authentication
* [Mantine 7.6.2](https://mantine.dev/) - Components Library

## Deployment

```
placeholder
```