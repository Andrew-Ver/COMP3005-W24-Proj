/*  DML script, run this after DDL
    Zhenxuan Ding, Jiayu Hu and Andrew Verbovsky  */

-- Adding an administrator
INSERT INTO account (account_id, name, password, user_type) VALUES ('admin', 'Manager', 'admin', 'Administrator');
INSERT INTO administrator (administrator_id) VALUES ('admin');

-- Adding trainers
INSERT INTO account (account_id, name, password, user_type) VALUES ('andrew', 'Andrew Proshare', 'password', 'Trainer');
INSERT INTO trainer (trainer_id, rate_per_hour) VALUES ('andrew', 37.50);
INSERT INTO trainer_specialty (trainer_id, specialty) VALUES ('andrew', 'mewing'), ('andrew', 'bonesmashing');

INSERT INTO account (account_id, name, password, user_type) VALUES ('mark', 'Hitori Bocchi', 'password', 'Trainer');
INSERT INTO trainer (trainer_id, rate_per_hour) VALUES ('mark', 37.50);
INSERT INTO trainer_specialty (trainer_id, specialty) VALUES ('mark', 'crawling'), ('mark', 'dooming');

INSERT INTO account (account_id, name, password, user_type) VALUES ('JY', 'JY', 'password', 'Trainer');
INSERT INTO trainer (trainer_id, rate_per_hour) VALUES ('JY', 50.00);

-- Adding Trainer Availability
INSERT INTO trainer_availability (trainer_id, begin_time, end_time) VALUES
('andrew', '2024-04-23 09:00', '2024-04-23 11:00'),  -- availability_id = 1
('mark', '2024-04-23 12:00', '2024-04-23 14:00'),  -- availability_id = 2
('JY', '2024-04-23 15:00', '2024-04-23 17:00'),  -- availability_id = 3
('andrew', '2024-04-24 09:00', '2024-04-24 11:00'),  -- availability_id = 4
('mark', '2024-04-24 12:00', '2024-04-24 14:00'),  -- availability_id = 5
('JY', '2024-04-24 15:00', '2024-04-24 17:00');  -- availability_id = 6

-- Adding Members
INSERT INTO account (account_id, name, password, user_type) VALUES ('robert', 'Robert Prolog', 'password', 'Member');
INSERT INTO member (member_id, age, gender) VALUES ('robert', 40, 'Male');
INSERT INTO health_metric (member_id, metric_timestamp, weight, body_fat_percentage, systolic_pressure, diastolic_pressure) VALUES
('robert', '2024-03-22 08:00', 70, 15, 120, 80),
('robert', '2024-03-15 08:00', 71, 16, 122, 82);
INSERT INTO member_goal (member_id, goal_type) VALUES ('robert', 'Lose Weight'), ('robert', 'Gain Muscle'), ('robert', 'Increase Stamina');

INSERT INTO account (account_id, name, password, user_type) VALUES ('vojislav', 'Vojislav Kewtee', 'password', 'Member');
INSERT INTO member (member_id, age, gender) VALUES ('vojislav', 50, 'Male');
INSERT INTO health_metric (member_id, metric_timestamp, weight, body_fat_percentage, systolic_pressure, diastolic_pressure) VALUES
('vojislav', '2024-03-22 08:00', 80, 20, 125, 85),
('vojislav', '2024-03-15 08:00', 82, 21, 128, 87);
INSERT INTO member_goal (member_id, goal_type) VALUES ('vojislav', 'Run Marathon'), ('vojislav', 'Reduce Body Fat'), ('vojislav', 'Improve Flexibility');

INSERT INTO account (account_id, name, password, user_type) VALUES ('patrick', 'Patrick Skip-List', 'password', 'Member');
INSERT INTO member (member_id, age, gender) VALUES ('patrick', 45, 'Male');

-- Creating group classes
INSERT INTO group_class (availability_id, description, fee) VALUES
(3, 'Cardio Session with JY', 50.00);  -- class_id = 1
UPDATE trainer_availability
SET is_booked = TRUE
WHERE availability_id = 3;

-- Linking group class enrollments
INSERT INTO class_member (class_id, member_id) VALUES
(1, 'robert'),
(1, 'vojislav'),
(1, 'patrick');

-- Creating personal training sessions (Removed bill_id linkage as it does not exist in the schema)
INSERT INTO personal_training_session (member_id, availability_id, description) VALUES
('robert', 1, 'Strength Training with Andrew Proshare'), -- Link to Robert's Personal Training
('vojislav', 2, 'Endurance Training with Hitori Bocchi'); -- Link to Vojislav's Personal Training

-- Assuming trainer_availability table exists and is_booked is a valid column
UPDATE trainer_availability
SET is_booked = TRUE
WHERE availability_id IN (1, 2);

-- Payments
INSERT INTO bill (member_id, amount, description, bill_timestamp, for_service, cleared) VALUES
-- Payments for Membership
('robert', 100.00, 'Membership purchase', CURRENT_TIMESTAMP - INTERVAL '5 day', 'Membership', true),
('vojislav', 100.00, 'Membership purchase', CURRENT_TIMESTAMP - INTERVAL '5 day', 'Membership', true),
('patrick', 100.00, 'Membership purchase', CURRENT_TIMESTAMP - INTERVAL '5 day', 'Membership', true),
-- Payments for Group Class
('robert', 50.00, 'Cardio Session with JY', CURRENT_TIMESTAMP - INTERVAL '4 day', 'GroupClass', true),
('vojislav', 50.00, 'Cardio Session with JY', CURRENT_TIMESTAMP - INTERVAL '4 day', 'GroupClass', true),
('patrick', 50.00, 'Cardio Session with JY', CURRENT_TIMESTAMP - INTERVAL '4 day', 'GroupClass', true),
-- Payments for Personal Training (Robert and Vojislav)
('robert', 75.00, 'Strength Training with Andrew Proshare', CURRENT_TIMESTAMP - INTERVAL '3 day', 'PersonalTraining', true),
('vojislav', 75.00, 'Endurance Training with Hitori Bocchi', CURRENT_TIMESTAMP - INTERVAL '3 day', 'PersonalTraining', true);

-- Creating rooms and equipment pieces
INSERT INTO room (description) VALUES
('Cardio Zone'),  -- room_id = 1
('Weight Training Area'),  -- room_id = 2
('Yoga Studio'),  -- room_id = 3
('Cycling Room');  -- room_id = 4

INSERT INTO equipment (description, room_id, needs_maintenance, last_maintained_by) VALUES
('Treadmill', 1, FALSE, 'admin'),
('Elliptical', 1, TRUE, NULL),
('Dumbbell Set', 2, FALSE, 'admin'),
('Adjustable Bench', 2, TRUE, NULL),
('Yoga Mat', 3, FALSE, NULL),
('Yoga Block', 3, FALSE, NULL),
('Spin Bike (Nokia brand)', 4, FALSE, 'admin'),
('Spin Bike (Ford brand)', 4, TRUE, 'admin');

-- Book 'Cardio Zone' for 'Cardio Session with JY' 
INSERT INTO room_booking (class_id, room_id, booked_by) VALUES
(1, 1, 'admin');