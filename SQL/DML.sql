/*  DML script, run this after DDL
    Zhenxuan Ding, Jiayu Hu and Andrew Verbovsky  */

-- Adding an administrator
INSERT INTO account (username, name, password, user_type) VALUES ('admin', 'Manager', 'password', 'administrator');
INSERT INTO administrator (admin_username) VALUES ('admin');

-- Adding trainers
INSERT INTO account (username, name, password, user_type) VALUES ('andrew', 'Andrew Proshare', 'password', 'trainer');
INSERT INTO trainer (trainer_username, rate_per_hour) VALUES ('andrew', 37.50);
INSERT INTO trainer_specialty (trainer_username, specialty) VALUES ('andrew', 'mewing'), ('andrew', 'bonesmashing');

INSERT INTO account (username, name, password, user_type) VALUES ('bocchi', 'Hitori Bocchi', 'password', 'trainer');
INSERT INTO trainer (trainer_username, rate_per_hour) VALUES ('bocchi', 37.50);
INSERT INTO trainer_specialty (trainer_username, specialty) VALUES ('bocchi', 'crawling'), ('bocchi', 'dooming');

INSERT INTO account (username, name, password, user_type) VALUES ('jy', 'Jiayu', 'password', 'trainer');
INSERT INTO trainer (trainer_username, rate_per_hour) VALUES ('jy', 50.00);

-- Adding Trainer Availability
INSERT INTO trainer_availability (trainer_username, begin_time, end_time) VALUES
('andrew', '2024-04-23 09:00', '2024-04-23 11:00'),  -- availability_id = 1
('bocchi', '2024-04-23 12:00', '2024-04-23 14:00'),  -- availability_id = 2
('jy', '2024-04-23 15:00', '2024-04-23 17:00'),  -- availability_id = 3
('andrew', '2024-04-24 09:00', '2024-04-24 11:00'),  -- availability_id = 4
('bocchi', '2024-04-24 12:00', '2024-04-24 14:00'),  -- availability_id = 5
('jy', '2024-04-24 15:00', '2024-04-24 17:00'),  -- availability_id = 6
('andrew', '2024-04-25 09:00', '2024-04-25 11:00'),  -- availability_id = 7
('bocchi', '2024-04-25 12:00', '2024-04-25 14:00'),  -- availability_id = 8
('jy', '2024-04-25 15:00', '2024-04-25 17:00');  -- availability_id = 9

-- Adding Members
INSERT INTO account (username, name, password, user_type) VALUES ('robert', 'Robert Prolog', 'password', 'member');
INSERT INTO member (member_username, age, gender) VALUES ('robert', 40, 'male');
INSERT INTO health_metric (member_username, metric_timestamp, weight, body_fat_percentage, systolic_pressure, diastolic_pressure) VALUES
('robert', '2024-03-22 08:00', 170, 15, 120, 80),
('robert', '2024-03-15 08:00', 171, 16, 122, 82);
INSERT INTO member_goal (member_username, goal_type) VALUES ('robert', 'Lose Weight'), ('robert', 'Gain Muscle'), ('robert', 'Increase Stamina');

INSERT INTO account (username, name, password, user_type) VALUES ('vojislav', 'Vojislav Kewtee', 'password', 'member');
INSERT INTO member (member_username, age, gender) VALUES ('vojislav', 50, 'male');
INSERT INTO health_metric (member_username, metric_timestamp, weight, body_fat_percentage, systolic_pressure, diastolic_pressure) VALUES
('vojislav', '2024-03-22 08:00', 180, 20, 125, 85),
('vojislav', '2024-03-15 08:00', 182, 21, 128, 87);
INSERT INTO member_goal (member_username, goal_type) VALUES ('vojislav', 'Run Marathon'), ('vojislav', 'Reduce Body Fat'), ('vojislav', 'Improve Flexibility');

INSERT INTO account (username, name, password, user_type) VALUES ('patrick', 'Patrick Skip-List', 'password', 'member');
INSERT INTO member (member_username, age, gender) VALUES ('patrick', 45, 'male');

INSERT INTO exercise_routine (member_username, description) VALUES
('robert', 'Cardio: Running 30 minutes, 3 times a week'),
('robert', 'Strength Training: Upper body workouts, 2 times a week'),
('vojislav', 'Cardio: Long-distance running, gradually increasing distance'),
('patrick', 'Cardio: Cycling 20 minutes, 3 times a week');

-- Creating rooms and equipment pieces
INSERT INTO room (description) VALUES
('Cardio Zone'),  -- room_id = 1
('Weight Training Area'),  -- room_id = 2
('Yoga Studio'),  -- room_id = 3
('Cycling Room');  -- room_id = 4

INSERT INTO equipment (description, room_id, needs_maintenance) VALUES
('Treadmill', 1, FALSE),
('Elliptical', 1, TRUE),
('Dumbbell Set', 2, FALSE),
('Adjustable Bench', 2, TRUE),
('Yoga Mat', 3, FALSE),
('Yoga Block', 3, FALSE),
('Spin Bike (Nokia brand)', 4, FALSE),
('Spin Bike (Ford brand)', 4, TRUE);

-- Creating group classes
INSERT INTO group_class (availability_id, description, fee, room_id) VALUES
(3, 'Cardio Session with Jiayu', 50.00, 1);  -- class_id = 1
UPDATE trainer_availability
SET is_booked = TRUE
WHERE availability_id = 3;

INSERT INTO group_class (availability_id, description, fee, room_id) VALUES
(5, 'Mewing Session with Bocchi', 50.00, 2);  -- class_id = 2
UPDATE trainer_availability
SET is_booked = TRUE
WHERE availability_id = 5;

-- Linking group class enrollments
INSERT INTO class_member (class_id, member_username) VALUES
(1, 'vojislav'),
(1, 'patrick');

-- Creating personal training sessions
INSERT INTO personal_training_session (member_username, availability_id, description) VALUES
('robert', 1, 'Strength Training with Andrew Proshare'),
('vojislav', 2, 'Endurance Training with Hitori Bocchi');

UPDATE trainer_availability
SET is_booked = TRUE
WHERE availability_id IN (1, 2);

-- Payments
INSERT INTO bill (member_username, amount, description, bill_timestamp, cleared) VALUES
-- Payments for Membership
('robert', 100.00, 'Membership purchase', CURRENT_TIMESTAMP - INTERVAL '5 day', FALSE),
('vojislav', 100.00, 'Membership purchase', CURRENT_TIMESTAMP - INTERVAL '5 day', TRUE),
('patrick', 100.00, 'Membership purchase', CURRENT_TIMESTAMP - INTERVAL '5 day', TRUE),
-- Payments for Group Class
('robert', 50.00, 'Cardio Session with Jiayu', CURRENT_TIMESTAMP - INTERVAL '4 day', FALSE),
('vojislav', 50.00, 'Cardio Session with Jiayu', CURRENT_TIMESTAMP - INTERVAL '4 day', TRUE),
('patrick', 50.00, 'Cardio Session with Jiayu', CURRENT_TIMESTAMP - INTERVAL '4 day', TRUE),
-- Payments for Personal Training (Robert and Vojislav)
('robert', 75.00, 'Strength Training with Andrew Proshare', CURRENT_TIMESTAMP - INTERVAL '3 day', FALSE),
('vojislav', 75.00, 'Endurance Training with Hitori Bocchi', CURRENT_TIMESTAMP - INTERVAL '3 day', TRUE);