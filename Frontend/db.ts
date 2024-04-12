import { Pool } from "pg";
require("dotenv").config();

let pool: Pool;

/*
  Handle local DB vs deployed DB
*/
if (!process.env.POSTGRES_URL) {
  pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || ""),
  });
} else {
  pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
  });
}

export default pool;

// Some type definitions

export type Metric = {
  id: string;
  metric_timestamp: string;
  weight: string;
  body_fat_percentage: string;
  blood_pressure: string;
};

export type TimeSlot = {
  id: string;
  username: string;
  is_booked: boolean;
  begin_time: string;
  end_time: string;
};

export type Specialty = {
  trainer_username: string;
  specialty: string;
};
