/*  DQL script to check correctness, you can run this after DDL and DML
    Zhenxuan Ding, Jiayu Hu and Andrew Verbovsky  */

<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 18b0ada (Create SQL Query functions)
SELECT * FROM account ORDER BY user_type, username;
SELECT * FROM administrator ORDER BY admin_username;
SELECT * FROM trainer ORDER BY trainer_username;
SELECT * FROM member ORDER BY member_username;
SELECT * FROM trainer_specialty ORDER BY trainer_username, specialty;
SELECT * FROM trainer_availability ORDER BY availability_id;
SELECT * FROM member_goal ORDER BY member_username, goal_type;
SELECT * FROM exercise_routine ORDER BY member_username, description;
SELECT * FROM health_metric ORDER BY member_username, metric_timestamp;
SELECT * FROM personal_training_session ORDER BY session_id;
SELECT * FROM group_class ORDER BY class_id;
SELECT * FROM class_member ORDER BY class_id, member_username;
SELECT * FROM bill ORDER BY bill_id;
SELECT * FROM room ORDER BY room_id;
<<<<<<< HEAD
SELECT * FROM equipment ORDER BY equipment_id;
=======
SELECT * FROM account;
SELECT * FROM administrator;
SELECT * FROM trainer;
SELECT * FROM member;
SELECT * FROM trainer_specialty;
SELECT * FROM trainer_availability;
SELECT * FROM member_goal;
SELECT * FROM exercise_routine;
SELECT * FROM health_metric;
SELECT * FROM personal_training_session;
SELECT * FROM group_class;
SELECT * FROM class_member;
SELECT * FROM bill;
SELECT * FROM room;
<<<<<<< HEAD
SELECT * FROM room_booking;
SELECT * FROM equipment;
>>>>>>> 084087d (add exercise routines)
=======
SELECT * FROM equipment;
>>>>>>> 4fec546 (most query functions are now complete)
=======
SELECT * FROM account ORDER BY user_type, username;
SELECT * FROM administrator ORDER BY admin_username;
SELECT * FROM trainer ORDER BY trainer_username;
SELECT * FROM member ORDER BY member_username;
SELECT * FROM trainer_specialty ORDER BY trainer_username, specialty;
SELECT * FROM trainer_availability ORDER BY availability_id;
SELECT * FROM member_goal ORDER BY member_username, goal_type;
SELECT * FROM exercise_routine ORDER BY member_username, description;
SELECT * FROM health_metric ORDER BY member_username, metric_timestamp;
SELECT * FROM personal_training_session ORDER BY session_id;
SELECT * FROM group_class ORDER BY class_id;
SELECT * FROM class_member ORDER BY class_id, member_username;
SELECT * FROM bill ORDER BY bill_id;
SELECT * FROM room ORDER BY room_id;
SELECT * FROM equipment ORDER BY equipment_id;
>>>>>>> fc1d559 (update account_id column to username)
=======
SELECT * FROM equipment ORDER BY equipment_id;
>>>>>>> 18b0ada (Create SQL Query functions)
