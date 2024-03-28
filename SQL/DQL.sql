/*  DQL script to check correctness, you can run this after DDL and DML
    Zhenxuan Ding, Jiayu Hu and Andrew Verbovsky  */

SELECT * FROM account ORDER BY user_type, username;
SELECT * FROM administrator ORDER BY administrator_id;
SELECT * FROM trainer ORDER BY trainer_id;
SELECT * FROM member ORDER BY member_id;
SELECT * FROM trainer_specialty ORDER BY trainer_id, specialty;
SELECT * FROM trainer_availability ORDER BY availability_id;
SELECT * FROM member_goal ORDER BY member_id, goal_type;
SELECT * FROM exercise_routine ORDER BY member_id, description;
SELECT * FROM health_metric ORDER BY member_id, metric_timestamp;
SELECT * FROM personal_training_session ORDER BY session_id;
SELECT * FROM group_class ORDER BY class_id;
SELECT * FROM class_member ORDER BY class_id, member_id;
SELECT * FROM bill ORDER BY bill_id;
SELECT * FROM room ORDER BY room_id;
SELECT * FROM equipment ORDER BY equipment_id;