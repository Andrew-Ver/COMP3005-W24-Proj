-- Adding an administrator
INSERT INTO account (account_id, name, password, user_type) VALUES ('admin', 'admin', 'admin', 'Administrator');
INSERT INTO administrator (administrator_id) VALUES ('admin');

-- Adding trainers
INSERT INTO account (account_id, name, password, user_type) VALUES ('Andrew Proshare', 'Andrew Proshare', 'password', 'Trainer');
INSERT INTO trainer (trainer_id) VALUES ('Andrew Proshare');
INSERT INTO trainer_specialty (trainer_id, specialty) VALUES ('Andrew Proshare', 'mewing'), ('Andrew Proshare', 'bonesmashing');

INSERT INTO account (account_id, name, password, user_type) VALUES ('Hitori Bocchi', 'Hitori Bocchi', 'password', 'Trainer');
INSERT INTO trainer (trainer_id) VALUES ('Hitori Bocchi');
INSERT INTO trainer_specialty (trainer_id, specialty) VALUES ('Hitori Bocchi', 'crawling'), ('Hitori Bocchi', 'dooming');

INSERT INTO account (account_id, name, password, user_type) VALUES ('JY', 'JY', 'password', 'Trainer');
INSERT INTO trainer (trainer_id) VALUES ('JY');

-- Adding Trainer Availability
INSERT INTO trainer_availability (trainer_id, begin_time, end_time) VALUES
('Andrew Proshare', '2024-04-23 09:00', '2024-04-23 11:00'),  -- availability_id = 1
('Hitori Bocchi', '2024-04-23 12:00', '2024-04-23 14:00'),  -- availability_id = 2
('JY', '2024-04-23 15:00', '2024-04-23 17:00'),  -- availability_id = 3
('Andrew Proshare', '2024-04-24 09:00', '2024-04-24 11:00'),  -- availability_id = 4
('Hitori Bocchi', '2024-04-24 12:00', '2024-04-24 14:00'),  -- availability_id = 5
('JY', '2024-04-24 15:00', '2024-04-24 17:00');  -- availability_id = 6

-- Adding Members
INSERT INTO account (account_id, name, password, user_type) VALUES ('Robert Prolog', 'Robert Prolog', 'password', 'Member');
INSERT INTO member (member_id) VALUES ('Robert Prolog');
INSERT INTO health_metric (member_id, metric_timestamp, weight, body_fat_percentage, systolic_pressure, diastolic_pressure) VALUES
('Robert Prolog', '2024-03-22 08:00', 70, 15, 120, 80),
('Robert Prolog', '2024-03-15 08:00', 71, 16, 122, 82);
INSERT INTO member_goal (member_id, goal_type) VALUES ('Robert Prolog', 'Lose Weight'), ('Robert Prolog', 'Gain Muscle'), ('Robert Prolog', 'Increase Stamina');

INSERT INTO account (account_id, name, password, user_type) VALUES ('Vojislav Kewtee', 'Vojislav Kewtee', 'password', 'Member');
INSERT INTO member (member_id) VALUES ('Vojislav Kewtee');
INSERT INTO health_metric (member_id, metric_timestamp, weight, body_fat_percentage, systolic_pressure, diastolic_pressure) VALUES
('Vojislav Kewtee', '2024-03-22 08:00', 80, 20, 125, 85),
('Vojislav Kewtee', '2024-03-15 08:00', 82, 21, 128, 87);
INSERT INTO member_goal (member_id, goal_type) VALUES ('Vojislav Kewtee', 'Run Marathon'), ('Vojislav Kewtee', 'Reduce Body Fat'), ('Vojislav Kewtee', 'Improve Flexibility');

INSERT INTO account (account_id, name, password, user_type) VALUES ('Patrick Skip-List', 'Patrick Skip-List', 'password', 'Member');
INSERT INTO member (member_id) VALUES ('Patrick Skip-List');

-- Creating personal training sessions
INSERT INTO personal_training_session (member_id, availability_id, description, completed) VALUES
('Robert Prolog', 1, 'Strength Training with Andrew Proshare', FALSE),
('Vojislav Kewtee', 2, 'Endurance Training with Hitori Bocchi', FALSE);

-- Creating group classes
INSERT INTO group_class (availability_id, description, completed) VALUES
(3, 'Cardio Session with JY', FALSE);  -- class_id = 1

INSERT INTO class_member (class_id, member_id) VALUES
(1, 'Robert Prolog'),
(1, 'Vojislav Kewtee'),
(1, 'Patrick Skip-List');