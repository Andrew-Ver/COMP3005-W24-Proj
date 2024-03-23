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

-- Payments
INSERT INTO payment (member_id, amount, payment_timestamp, for_service) VALUES
-- Payments for Membership
('robert', 100.00, CURRENT_TIMESTAMP - INTERVAL '5 day', 'Membership'),  -- payment_id = 1
('vojislav', 100.00, CURRENT_TIMESTAMP - INTERVAL '5 day', 'Membership'),  -- payment_id = 2
('patrick', 100.00, CURRENT_TIMESTAMP - INTERVAL '5 day', 'Membership'),  -- payment_id = 3
-- Payments for Group Class
('robert', 50.00, CURRENT_TIMESTAMP - INTERVAL '4 day', 'GroupClass'),  -- payment_id = 4
('vojislav', 50.00, CURRENT_TIMESTAMP - INTERVAL '4 day', 'GroupClass'),  -- payment_id = 5
('patrick', 50.00, CURRENT_TIMESTAMP - INTERVAL '4 day', 'GroupClass'),  -- payment_id = 6
-- Payments for Personal Training (Robert and Vojislav)
('robert', 75.00, CURRENT_TIMESTAMP - INTERVAL '3 day', 'PersonalTraining'),  -- payment_id = 7
('vojislav', 75.00, CURRENT_TIMESTAMP - INTERVAL '3 day', 'PersonalTraining');  -- payment_id = 8

-- Linking group class enrollments with their payments
INSERT INTO class_member (class_id, member_id, payment_id) VALUES
(1, 'robert', 4),
(1, 'vojislav', 5),
(1, 'patrick', 6);

-- Creating personal training sessions with payment_id linkage
INSERT INTO personal_training_session (member_id, availability_id, description, payment_id) VALUES
('robert', 1, 'Strength Training with Andrew Proshare', 7), -- Link to Robert's Personal Training payment
('vojislav', 2, 'Endurance Training with Hitori Bocchi', 8); -- Link to Vojislav's Personal Training payment
UPDATE trainer_availability
SET is_booked = TRUE
WHERE availability_id IN (1, 2);

-- Creating rooms and equipment pieces
INSERT INTO room (description) VALUES
('Cardio Zone'),  -- room_id = 1
('Weight Training Area'),  -- room_id = 2
('Yoga Studio'),  -- room_id = 3
('Cycling Room');  -- room_id = 4

INSERT INTO equipment (description, room_id, needs_maintenance, last_maintained_by, last_maintained_at) VALUES
('Treadmill', 1, FALSE, 'admin', CURRENT_TIMESTAMP - INTERVAL '1 days'),
('Elliptical', 1, TRUE, NULL, NULL),
('Dumbbell Set', 2, FALSE, 'admin', CURRENT_TIMESTAMP - INTERVAL '2 days'),
('Adjustable Bench', 2, TRUE, NULL, NULL),
('Yoga Mat', 3, FALSE, NULL, NULL),
('Yoga Block', 3, FALSE, NULL, NULL),
('Spin Bike (Nokia brand)', 4, FALSE, 'admin', CURRENT_TIMESTAMP - INTERVAL '3 days'),
('Spin Bike (Ford brand)', 4, TRUE, 'admin', CURRENT_TIMESTAMP - INTERVAL '5 days');

-- Book 'Cardio Zone' for 'Cardio Session with JY' 
INSERT INTO room_booking (class_id, room_id, booked_by) VALUES
(1, 1, 'admin');