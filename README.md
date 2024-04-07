# COMP3005 Final Project

COMP3005 Database Management Systems at Carleton University Winter 2024 - :weight_lifting_man: Gym Management System :weight_lifting_woman:

**Team Members:** [Andrew Verbovsky](https://github.com/Andrew-Ver), [Zhenxuan Ding](https://github.com/InvalidPathException), and [Jiayu Hu](https://github.com/JennyHo5)

## :writing_hand: Description :writing_hand:

This is a Full-Stack web application designed to mimick a Health and Fitness Club Management System for COMP3005 for the Winter 2024 semester at Carleton University.

## :hammer: Built With :hammer:

* [Next.js](https://nextjs.org/) - React-based Web Framework
* [NextAuth.js](https://next-auth.js.org/) - Authentication
* [PostgreSQL](https://www.postgresql.org/) - Relational Database
* [Node-Postgres](https://node-postgres.com/) - Node.js PostgreSQL client
* [Mantine 7](https://mantine.dev/) - UI components Library
* [Mantine React Table v2](https://v2.mantine-react-table.com/) - Table components


## :computer: Getting Started :computer: 

### Dependencies

* [Node and NPM package manager](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm#checking-your-version-of-npm-and-nodejs)
* **A local or remote PostgreSQL server**
* A Desktop Web Browser

### :file_folder: File/Folder Structure :file_folder:

<details>
<summary>Structure :computer_mouse:</summary>
<br>

```
├── Documentation - (Diagrams and Justifications for Database Design folder)
│   ├── Diagrams.drawio
│   ├── ER Diagram.png
│   └── Schema.png
├── Frontend - (Next JS Webapp Frontend folder)
│   ├── .env.local - (PLACE YOUR DATABASE CONNECTION INFO HERE)
│   ├── db.ts - (A file defining some types and DB connection read from environment variables)
│   ├── ... (...Many other files and folders related to the frontend...)
├── GRADING.md - (A copy of the Project Grading Scheme in markdown format)
├── Project_COMP_3005_W24_V2.pdf - (Project Specifications)
├── Queries
│   └── queries.md - (A list of node-postgres queries used in the project)
├── README.md
└── SQL - (SQL query scripts to inititalize the Database and populate it with data)
    ├── DDL.sql - Script to define database structure
    ├── DML.sql - Script to populate with initial data
    └── DQL.sql - Script to view database table data
```
</details>

---


### :running: Running the Application :running:

* #### Ensure a local (or remote) PostgreSQL server is running
* #### Navigate to the [Frontend/](./Frontend/) directory
* #### Create a ```.env.local``` file and supply it with the following information:
  * ```bash
        DB_HOST=[your_database_host]
        DB_PORT=[your_database_port]
        DB_USER=[your_database_name]
        DB_PASSWORD=[your_database_password]
        DB_NAME=[your_database_name]
        NEXTAUTH_SECRET="SOMERANDOMSTRINGOFCHARACTERS"
* #### Run the following commands in your terminal:
  * ```npm install```
  * ```npm run dev```
* :sparkles: **Proceed to [localhost:3000/](http://localhost:3000/) in your web browser and navigate the Web Application** :sparkles:
* :shrug: **Optional**: Play around with it, or something like that.


## :trophy: Authors :trophy:

* [Andrew Verbovsky](https://github.com/Andrew-Ver)
* [Zhenxuan Ding](https://github.com/InvalidPathException)
* [Jiayu Hu](https://github.com/JennyHo5)

## Acknowledgements

**THIS FINAL PROJECT IS FOR COMP3005 WINTER 2024. Please do not use without permission or to commit any academic integrity violations.**
