/*  DDL script, run this before everything else
    Zhenxuan Ding, Jiayu Hu and Andrew Verbovsky  */

/*  Drop all the tables and types to ensure a clean start  */
DROP TABLE IF EXISTS equipment CASCADE;
DROP TABLE IF EXISTS class_member CASCADE;
DROP TABLE IF EXISTS group_class CASCADE;
DROP TABLE IF EXISTS room CASCADE;
DROP TABLE IF EXISTS personal_training_session CASCADE;
DROP TABLE IF EXISTS bill CASCADE;
DROP TABLE IF EXISTS health_metric CASCADE;
DROP TABLE IF EXISTS exercise_routine CASCADE;
DROP TABLE IF EXISTS member_goal CASCADE;
DROP TABLE IF EXISTS trainer_availability CASCADE;
DROP TABLE IF EXISTS trainer_specialty CASCADE;
DROP TABLE IF EXISTS member CASCADE;
DROP TABLE IF EXISTS trainer CASCADE;
DROP TABLE IF EXISTS administrator CASCADE;
DROP TABLE IF EXISTS account CASCADE;
DROP TYPE IF EXISTS gender CASCADE;
DROP TYPE IF EXISTS user_type CASCADE;

/*  Actual table and type creation  */
CREATE TYPE user_type AS ENUM ('administrator', 'trainer', 'member');
CREATE TYPE gender AS ENUM ('female', 'male', 'other');

CREATE TABLE account (
    username VARCHAR(50) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    password VARCHAR(50) NOT NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    user_type user_type NOT NULL
);

CREATE TABLE administrator (
    admin_username VARCHAR(50) PRIMARY KEY REFERENCES account(username) ON DELETE CASCADE
);

CREATE TABLE trainer (
    trainer_username VARCHAR(50) PRIMARY KEY REFERENCES account(username) ON DELETE CASCADE,
    rate_per_hour DECIMAL NOT NULL CHECK (rate_per_hour > 0)
);

CREATE TABLE member (
    member_username VARCHAR(50) PRIMARY KEY REFERENCES account(username) ON DELETE CASCADE,
    age numeric(3, 0) NOT NULL CHECK (
        age > 0
        AND age < 150
    ),
    gender gender NOT NULL
);

CREATE TABLE trainer_specialty (
    trainer_username VARCHAR(50),
    specialty VARCHAR(50),
    PRIMARY KEY (trainer_username, specialty),
    FOREIGN KEY (trainer_username) REFERENCES trainer(trainer_username) ON DELETE CASCADE
);

CREATE TABLE trainer_availability (
    availability_id SERIAL PRIMARY KEY,
    trainer_username VARCHAR(50) NOT NULL,
    is_booked BOOLEAN NOT NULL DEFAULT FALSE,
    begin_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    FOREIGN KEY (trainer_username) REFERENCES trainer(trainer_username) ON DELETE CASCADE,
    CHECK (begin_time < end_time)
);

CREATE TABLE member_goal (
    member_username VARCHAR(50),
    goal_type VARCHAR(50),
    achieved BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (member_username, goal_type),
    FOREIGN KEY (member_username) REFERENCES member(member_username) ON DELETE CASCADE
);

CREATE TABLE exercise_routine (
    member_username VARCHAR(50),
    description VARCHAR(255),
    PRIMARY KEY (member_username, description),
    FOREIGN KEY (member_username) REFERENCES member(member_username) ON DELETE CASCADE
);

CREATE TABLE health_metric (
    member_username VARCHAR(50) NOT NULL,
    metric_timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    weight DECIMAL NOT NULL, -- In lbs
    body_fat_percentage DECIMAL NOT NULL CHECK (
        body_fat_percentage > 0
        AND body_fat_percentage < 100
    ),
    systolic_pressure INT NOT NULL,
    diastolic_pressure INT NOT NULL,
    PRIMARY KEY (member_username, metric_timestamp),
    FOREIGN KEY (member_username) REFERENCES member(member_username) ON DELETE CASCADE,
    CHECK (systolic_pressure > diastolic_pressure)
);

CREATE TABLE bill (
    bill_id SERIAL PRIMARY KEY,
    member_username VARCHAR(50) NOT NULL,
    amount DECIMAL NOT NULL,  -- Can be negative (refund)
    description VARCHAR(255) NOT NULL,
    bill_timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    cleared BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (member_username) REFERENCES member(member_username) ON DELETE CASCADE
);

CREATE TABLE personal_training_session (
    session_id SERIAL PRIMARY KEY,
    member_username VARCHAR(50) NOT NULL,
    availability_id INT NOT NULL,
    description VARCHAR(255) NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (member_username) REFERENCES member(member_username) ON DELETE CASCADE,
    FOREIGN KEY (availability_id) REFERENCES trainer_availability(availability_id) ON DELETE CASCADE
);

CREATE TABLE room (
    room_id SERIAL PRIMARY KEY,
    description VARCHAR(255) NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE
);

CREATE TABLE group_class (
    class_id SERIAL PRIMARY KEY,
    availability_id INT NOT NULL,
    description VARCHAR(255) NOT NULL,
    fee DECIMAL NOT NULL CHECK (fee > 0),
    room_id INT NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (availability_id) REFERENCES trainer_availability(availability_id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES room(room_id) ON DELETE CASCADE
);

CREATE TABLE class_member (
    class_id INT,
    member_username VARCHAR(50),
    PRIMARY KEY (class_id, member_username),
    FOREIGN KEY (class_id) REFERENCES group_class(class_id) ON DELETE CASCADE,
    FOREIGN KEY (member_username) REFERENCES member(member_username) ON DELETE CASCADE
);

CREATE TABLE equipment (
    equipment_id SERIAL PRIMARY KEY,
    description VARCHAR(255) NOT NULL,
    room_id INT NOT NULL,
    needs_maintenance BOOLEAN NOT NULL DEFAULT FALSE,
    last_maintained_at TIMESTAMP,  --Default is null (never maintained)
    FOREIGN KEY (room_id) REFERENCES room(room_id) ON DELETE CASCADE
);