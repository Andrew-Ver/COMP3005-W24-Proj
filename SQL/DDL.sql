/*  DDL script, run this before everything else
    Zhenxuan Ding, Jiayu Hu and Andrew Verbovsky  */

/*  Drop all the tables and types to ensure a clean start  */
DROP TABLE IF EXISTS bill CASCADE;
DROP TABLE IF EXISTS equipment CASCADE;
DROP TABLE IF EXISTS room_booking CASCADE;
DROP TABLE IF EXISTS room CASCADE;
DROP TABLE IF EXISTS class_member CASCADE;
DROP TABLE IF EXISTS group_class CASCADE;
DROP TABLE IF EXISTS personal_training_session CASCADE;
DROP TABLE IF EXISTS health_metric CASCADE;
DROP TABLE IF EXISTS member_goal CASCADE;
DROP TABLE IF EXISTS exercise_routine CASCADE;
DROP TABLE IF EXISTS trainer_availability CASCADE;
DROP TABLE IF EXISTS trainer_specialty CASCADE;
DROP TABLE IF EXISTS member CASCADE;
DROP TABLE IF EXISTS trainer CASCADE;
DROP TABLE IF EXISTS administrator CASCADE;
DROP TABLE IF EXISTS account CASCADE;
DROP TYPE IF EXISTS service_type;
DROP TYPE IF EXISTS user_type;
DROP TYPE IF EXISTS gender;

/*  Actual table and type creation  */
CREATE TYPE user_type AS ENUM ('Administrator', 'Trainer', 'Member');
CREATE TYPE service_type AS ENUM ('Membership', 'PersonalTraining', 'GroupClass');
CREATE TYPE gender AS ENUM ('Female', 'Male', 'Other');

CREATE TABLE account (
    account_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    password VARCHAR(50) NOT NULL,
	is_inactive BOOLEAN DEFAULT FALSE,
    user_type user_type NOT NULL
);

CREATE TABLE administrator (
    administrator_id VARCHAR(50) PRIMARY KEY REFERENCES account(account_id) ON DELETE CASCADE
);

CREATE TABLE trainer (
    trainer_id VARCHAR(50) PRIMARY KEY REFERENCES account(account_id) ON DELETE CASCADE,
	rate_per_hour DECIMAL NOT NULL CHECK (rate_per_hour > 0)
);

CREATE TABLE member (
    member_id VARCHAR(50) PRIMARY KEY REFERENCES account(account_id) ON DELETE CASCADE,
    age numeric(3, 0) CHECK (
        age > 0
        AND age < 150
    ),
	gender gender
);

CREATE TABLE trainer_specialty (
    trainer_id VARCHAR(50),
    specialty VARCHAR(50),
    PRIMARY KEY (trainer_id, specialty),
    FOREIGN KEY (trainer_id) REFERENCES trainer(trainer_id) ON DELETE CASCADE
);

CREATE TABLE trainer_availability (
    availability_id SERIAL PRIMARY KEY,
    trainer_id VARCHAR(50) NOT NULL,
    is_booked BOOLEAN NOT NULL DEFAULT FALSE,
    begin_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    FOREIGN KEY (trainer_id) REFERENCES trainer(trainer_id) ON DELETE CASCADE
);

CREATE TABLE member_goal (
    member_id VARCHAR(50),
    goal_type VARCHAR(50),
	achieved BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (member_id, goal_type),
    FOREIGN KEY (member_id) REFERENCES member(member_id) ON DELETE CASCADE
);

CREATE TABLE exercise_routine (
    member_id VARCHAR(50),
    description VARCHAR(255),
    PRIMARY KEY (member_id, description),
    FOREIGN KEY (member_id) REFERENCES member(member_id) ON DELETE CASCADE
);

CREATE TABLE health_metric (
    member_id VARCHAR(50) NOT NULL,
    metric_timestamp TIMESTAMP NOT NULL,
    weight DECIMAL NOT NULL,
    body_fat_percentage DECIMAL NOT NULL,
    systolic_pressure INT NOT NULL,
    diastolic_pressure INT NOT NULL,
    PRIMARY KEY (member_id, metric_timestamp),
    FOREIGN KEY (member_id) REFERENCES member(member_id) ON DELETE CASCADE
);

CREATE TABLE bill (
    bill_id SERIAL PRIMARY KEY,
    member_id VARCHAR(50) NOT NULL,
    amount DECIMAL NOT NULL,  -- Can be negative (refund)
	description VARCHAR(255),
    bill_timestamp TIMESTAMP NOT NULL,
    for_service service_type NOT NULL,
	cleared BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (member_id) REFERENCES member(member_id)  --Keep bill record even if the user is deleted
);

CREATE TABLE personal_training_session (
    session_id SERIAL PRIMARY KEY,
    member_id VARCHAR(50) NOT NULL,
    availability_id INT NOT NULL,
	description VARCHAR(255),
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (member_id) REFERENCES member(member_id) ON DELETE CASCADE,
    FOREIGN KEY (availability_id) REFERENCES trainer_availability(availability_id) ON DELETE CASCADE
);

CREATE TABLE group_class (
    class_id SERIAL PRIMARY KEY,
    availability_id INT NOT NULL,
	description VARCHAR(255),
	fee DECIMAL NOT NULL CHECK (fee > 0),
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (availability_id) REFERENCES trainer_availability(availability_id) ON DELETE CASCADE
);

CREATE TABLE class_member (
    class_id INT,
    member_id VARCHAR(50),
    PRIMARY KEY (class_id, member_id),
    FOREIGN KEY (class_id) REFERENCES group_class(class_id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES member(member_id) ON DELETE CASCADE
);

CREATE TABLE room (
    room_id SERIAL PRIMARY KEY,
    description VARCHAR(255),
	is_inactive BOOLEAN DEFAULT FALSE
);

CREATE TABLE room_booking (
    booking_id SERIAL PRIMARY KEY,
    class_id INT NOT NULL,
    room_id INT NOT NULL,
	booked_by VARCHAR(50) NOT NULL,
    FOREIGN KEY (class_id) REFERENCES group_class(class_id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES room(room_id) ON DELETE CASCADE,
    FOREIGN KEY (booked_by) REFERENCES administrator(administrator_id) ON DELETE CASCADE
);

CREATE TABLE equipment (
    equipment_id SERIAL PRIMARY KEY,
    description VARCHAR(255) NOT NULL,
    room_id INT NOT NULL,
    needs_maintenance BOOLEAN NOT NULL DEFAULT FALSE,
    last_maintained_by VARCHAR(50),
    FOREIGN KEY (room_id) REFERENCES room(room_id) ON DELETE CASCADE,
    FOREIGN KEY (last_maintained_by) REFERENCES administrator(administrator_id) -- Keep maintenance record even if the user is deleted
);