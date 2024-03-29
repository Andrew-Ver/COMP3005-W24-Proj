/*  Backend query functions by Zhenxuan Ding, Jiayu Hu and Andrew Verbovsky  */

const {Pool} = require('pg');

// Assuming you have a Pool instance created for your database connection
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'test',
    password: 'postgres',
    port: 5432,
});

// Query for inserting data into the account table
const insertAccountQuery = `INSERT INTO account(username, name, password, user_type) VALUES ($1, $2, $3, $4)`;
// Query for inserting data into the bill table
const insertBillQuery = `INSERT INTO bill(member_username, amount, description) VALUES ($1, $2, $3)`;
// Query for checking trainer availability and booking a session
const availabilityQueryQuery = `SELECT trainer_username, begin_time, end_time FROM trainer_availability WHERE availability_id = $1 AND is_booked = FALSE`;
// Query for updating the availability status after booking a session
const updateAvailabilityQuery = `UPDATE trainer_availability SET is_booked = TRUE WHERE availability_id = $1`;

// Function to register a new member (registration page or by an administrator)
async function registerMember(username, name, password, age, gender) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN'); // Start transaction
        // Insert into account table
        await client.query(insertAccountQuery, [username, name, password, 'Member']);
        // Insert into member table
        const insertMemberQuery = `
            INSERT INTO member(member_username, age, gender)
            VALUES ($1, $2, $3)
        `;
        await client.query(insertMemberQuery, [username, age, gender]);
        // Insert an unpaid bill for $100.00
        await client.query(insertBillQuery, [username, 100.00, 'Membership purchase']);
        await client.query('COMMIT'); // Commit the transaction
        console.log('Member registered successfully with initial bill.');
    } catch (err) {
        await client.query('ROLLBACK'); // Rollback in case of error
        throw err;
    } finally {
        client.release(); // Release the client back to the pool
    }
}

// Function to register a new trainer (by an administrator)
async function registerTrainer(username, name, password, rate_per_hour) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN'); // Start transaction
        // Insert into account table
        await client.query(insertAccountQuery, [username, name, password, 'Trainer']);
        // Insert into trainer table
        const insertTrainerQuery = `
            INSERT INTO trainer(trainer_username, rate_per_hour)
            VALUES ($1, $2)
        `;
        await client.query(insertTrainerQuery, [username, rate_per_hour]);
        await client.query('COMMIT'); // Commit the transaction
        console.log('Trainer registered successfully.');
    } catch (err) {
        await client.query('ROLLBACK'); // Rollback in case of error
        throw err;
    } finally {
        client.release(); // Release the client back to the pool
    }
}

// Function to register a new administrator (by an existing administrator)
async function registerAdministrator(username, name, password) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN'); // Start transaction
        // Insert into account table
        await client.query(insertAccountQuery, [username, name, password, 'Administrator']);
        // Insert into administrator table
        const insertAdminQuery = `
            INSERT INTO administrator(admin_username)
            VALUES ($1)
        `;
        await client.query(insertAdminQuery, [username]);
        await client.query('COMMIT'); // Commit the transaction
        console.log('Administrator registered successfully.');
    } catch (err) {
        await client.query('ROLLBACK'); // Rollback in case of error
        throw err;
    } finally {
        client.release(); // Release the client back to the pool
    }
}

// Function to create a new, extra bill for a member (by an administrator)
async function createBill(member_username, amount, description) {
    const client = await pool.connect();
    try {
        await client.query(insertBillQuery, [member_username, amount, description]);
        console.log('Bill created successfully.');
    } catch (err) {
        throw err;
    } finally {
        client.release();
    }
}

// Function to pay a bill (by a member or administrator)
async function payBill(bill_id) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        // Check if the bill is already paid
        const checkBillQuery = `SELECT cleared FROM bill WHERE bill_id = $1`;
        const res = await client.query(checkBillQuery, [bill_id]);
        if (res.rows.length === 0) {
            throw new Error('Bill not found.');
        } else if (res.rows[0].cleared) {
            console.log('Bill is already paid.');
            await client.query('ROLLBACK'); // No changes to commit, so rollback
            return;
        }
        // If the bill is not already paid, update it to cleared
        const updateBillQuery = `UPDATE bill SET cleared = true WHERE bill_id = $1`;
        await client.query(updateBillQuery, [bill_id]);
        await client.query('COMMIT');
        console.log('Bill paid successfully.');
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}

// Function to add a specialty to a trainer (by a trainer)
async function addTrainerSpecialty(trainer_username, specialty) {
    const client = await pool.connect();
    try {
        const insertSpecialtyQuery = `
            INSERT INTO trainer_specialty(trainer_username, specialty)
            VALUES ($1, $2)
        `;
        await client.query(insertSpecialtyQuery, [trainer_username, specialty]);
        console.log('Trainer specialty added successfully.');
    } catch (err) {
        console.error('Failed to add trainer specialty:', err.message);
        throw err;
    } finally {
        client.release();
    }
}

// Function to add availability for a trainer (by a trainer), begin_time and end_time must be timestamps
async function addTrainerAvailability(trainer_username, begin_time, end_time) {
    const client = await pool.connect();
    try {
        // Check for time conflict with existing availability
        const conflictCheckQuery = `
            SELECT 1
            FROM trainer_availability
            WHERE trainer_username = $1
            AND (
                begin_time < $3
                AND end_time > $2
            )
        `;
        const conflictResult = await client.query(conflictCheckQuery, [trainer_username, begin_time, end_time]);
        if (conflictResult.rows.length > 0) {
            console.log('Trainer has an existing availability that conflicts with the provided time.');
            return;
        }

        // Add the new availability if there is no conflict
        const insertAvailabilityQuery = `
            INSERT INTO trainer_availability(trainer_username, begin_time, end_time)
            VALUES ($1, $2, $3)
        `;
        await client.query(insertAvailabilityQuery, [trainer_username, begin_time, end_time]);
        console.log('Trainer availability added successfully.');
    } catch (err) {
        console.error('Failed to add trainer availability:', err.message);
        throw err;
    } finally {
        client.release();
    }
}

// Function to add a goal to a member (by a member)
async function addMemberGoal(member_username, goal_type) {
    const client = await pool.connect();
    try {
        const insertGoalQuery = `
            INSERT INTO member_goal(member_username, goal_type)
            VALUES ($1, $2)
        `;
        await client.query(insertGoalQuery, [member_username, goal_type]);
        console.log('Member goal added successfully.');
    } catch (err) {
        console.error('Failed to add member goal:', err.message);
        throw err;
    } finally {
        client.release();
    }
}

async function markGoalAchieved(member_username, goal_type) {
    const client = await pool.connect();
    try {
        const updateGoalQuery = `
            UPDATE member_goal
            SET achieved = true
            WHERE member_username = $1 AND goal_type = $2
        `;
        await client.query(updateGoalQuery, [member_username, goal_type]);
        console.log('Member goal marked as complete.');
    } catch (err) {
        console.error('Failed to mark member goal as complete:', err.message);
        throw err;
    } finally {
        client.release();
    }
}

// Function to add an exercise routine to a member (by a member)
async function addExerciseRoutine(member_username, description) {
    const client = await pool.connect();
    try {
        const insertRoutineQuery = `
            INSERT INTO exercise_routine(member_username, description)
            VALUES ($1, $2)
        `;
        await client.query(insertRoutineQuery, [member_username, description]);
        console.log('Exercise routine added successfully.');
    } catch (err) {
        console.error('Failed to add exercise routine:', err.message);
        throw err;
    } finally {
        client.release();
    }
}

// Function to add a health metric to a member (by a member)
async function addHealthMetric(member_username, weight, body_fat_percentage, systolic_pressure, diastolic_pressure) {
    const client = await pool.connect();
    try {
        const insertMetricQuery = `
            INSERT INTO health_metric(member_username, weight, body_fat_percentage, systolic_pressure, diastolic_pressure)
            VALUES ($1, $2, $3, $4, $5)
        `;
        await client.query(insertMetricQuery, [member_username, weight, body_fat_percentage, systolic_pressure, diastolic_pressure]);
        console.log('Health metric added successfully.');
    } catch (err) {
        console.error('Failed to add health metric:', err.message);
        throw err;
    } finally {
        client.release();
    }
}

// Function to add a personal training session for a member (by a member or administrator)
async function addPersonalTrainingSession(member_username, availability_id, description) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { rows: availability } = await client.query(availabilityQueryQuery, [availability_id]);
        if (availability.length === 0) {
            throw new Error('Availability not found or already booked.');
        }
        const { trainer_username, begin_time, end_time } = availability[0];

        // Create the bill based on the duration of the session
        const duration = (end_time - begin_time) / (1000 * 3600);
        const rateQuery = `
            SELECT rate_per_hour
            FROM trainer
            WHERE trainer_username = $1
        `;
        const { rows: rateRows } = await client.query(rateQuery, [trainer_username]);
        if (rateRows.length === 0) {
            throw new Error('Trainer not found.');
        }
        const { rate_per_hour } = rateRows[0];
        const amount = rate_per_hour * duration;
        await client.query(insertBillQuery, [member_username, amount, description]);

        // Insert the session
        const insertSessionQuery = `
            INSERT INTO personal_training_session(member_username, availability_id, description)
            VALUES ($1, $2, $3)
            RETURNING session_id
        `;
        await client.query(insertSessionQuery, [member_username, availability_id, description]);

        // Mark the availability as booked
        await client.query(updateAvailabilityQuery, [availability_id]);
        await client.query('COMMIT'); // Commit transaction
        console.log('Personal training session added and billed successfully.');
    } catch (err) {
        await client.query('ROLLBACK'); // Rollback in case of any error
        console.error('Failed to add personal training session and bill:', err.message);
        throw err;
    } finally {
        client.release();
    }
}

// Function to mark a personal training session as completed (by a trainer)
async function markSessionCompleted(session_id) {
    const client = await pool.connect();
    try {
        const updateSessionQuery = `
            UPDATE personal_training_session
            SET completed = TRUE
            WHERE session_id = $1
        `;
        await client.query(updateSessionQuery, [session_id]);
        console.log('Personal training session marked as completed.');
    } catch (err) {
        console.error('Failed to mark personal training session as completed:', err.message);
        throw err;
    } finally {
        client.release();
    }
}

// Function to add a group class (by a trainer or administrator)
async function addGroupClass(availability_id, description, fee) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { rows: availability } = await client.query(availabilityQueryQuery, [availability_id]);
        if (availability.length === 0) {
            throw new Error('Availability not found or already booked.');
        }

        // Insert the group class
        const insertClassQuery = `
            INSERT INTO group_class(availability_id, description, fee)
            VALUES ($1, $2, $3)
            RETURNING class_id
        `;
        await client.query(insertClassQuery, [availability_id, description, fee]);

        // Update the trainer_availability to mark as booked
        await client.query(updateAvailabilityQuery, [availability_id]);
        await client.query('COMMIT'); // Commit transaction
        console.log('Group class added successfully.');
    } catch (err) {
        await client.query('ROLLBACK'); // Rollback in case of an error
        console.error('Failed to add group class:', err.message);
        throw err;
    } finally {
        client.release();
    }
}

// Function to mark a group class as completed (by a trainer)
async function markClassCompleted(class_id) {
    const client = await pool.connect();
    try {
        const updateClassQuery = `
            UPDATE group_class
            SET completed = TRUE
            WHERE class_id = $1
        `;
        await client.query(updateClassQuery, [class_id]);
        console.log('Group class marked as completed.');
    } catch (err) {
        console.error('Failed to mark group class as completed:', err.message);
        throw err;
    } finally {
        client.release();
    }
}

// Function to register a member for a group class (by a member)
async function registerClassMember(class_id, member_username) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Check if the class exists and is not completed
        const classQuery = `
            SELECT fee, completed, description
            FROM group_class
            WHERE class_id = $1
        `;
        const { rows: classRow } = await client.query(classQuery, [class_id]);
        if (classRow.length === 0) throw new Error('Class not found.');
        if (classRow[0].completed) throw new Error('Class is already completed.');

        // Register the member for the class
        const insertMemberQuery = `
            INSERT INTO class_member(class_id, member_username)
            VALUES ($1, $2)
        `;
        await client.query(insertMemberQuery, [class_id, member_username]);

        // Create a bill for the class registration
        await client.query(insertBillQuery, [member_username, classRow[0].fee, classRow[0].description]);
        await client.query('COMMIT'); // Commit transaction
        console.log('Class member registered and billed successfully.');
    } catch (err) {
        await client.query('ROLLBACK'); // Rollback in case of an error
        console.error('Failed to register class member and create bill:', err.message);
        throw err;
    } finally {
        client.release();
    }
}

// Function to add a room for booking (by an administrator)
async function addRoom(description) {
    const client = await pool.connect();
    try {
        const insertRoomQuery = `
            INSERT INTO room(description)
            VALUES ($1)
        `;
        await client.query(insertRoomQuery, [description]);
        console.log('Room added successfully.');
    } catch (err) {
        console.error('Failed to add room:', err.message);
        throw err;
    } finally {
        client.release();
    }
}

// Function to book a room or edit the booking for a class (by an administrator)
async function bookRoomForClass(class_id, room_id) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Check if the class exists and is not completed
        const classQuery = `
            SELECT g.fee, g.completed, g.description, a.begin_time, a.end_time
            FROM group_class g
            JOIN trainer_availability a ON g.availability_id = a.availability_id
            WHERE g.class_id = $1
        `;
        const { rows: classRows } = await client.query(classQuery, [class_id]);
        if (classRows.length === 0) throw new Error('Class not found.');
        if (classRows[0].completed) throw new Error('Class is already completed.');

        // Check if the room is active
        const roomActiveQuery = `SELECT is_deleted FROM room WHERE room_id = $1`;
        const { rows: roomRows } = await client.query(roomActiveQuery, [room_id]);
        if (roomRows.length === 0 || roomRows[0].is_deleted) throw new Error('Room is inactive or not found.');

        // Check for room availability conflicts
        const conflictQuery = `
            SELECT c.class_id
            FROM group_class c
            JOIN trainer_availability a ON c.availability_id = a.availability_id
            WHERE c.room_id = $1 AND c.class_id != $2 AND (
                a.begin_time < $4 AND a.end_time > $3
            )
        `;
        const conflictRows = await client.query(conflictQuery, [room_id, class_id, classRows[0].begin_time, classRows[0].end_time]);
        if (conflictRows.rows.length > 0) throw new Error('Room booking conflicts with an existing class.');

        // Book the room for the class
        const updateRoomQuery = `UPDATE group_class SET room_id = $1 WHERE class_id = $2`;
        await client.query(updateRoomQuery, [room_id, class_id]);

        await client.query('COMMIT');
        console.log(`Room ${room_id} booked for class ${class_id} successfully.`);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Failed to book room for class:', err.message);
        throw err;
    } finally {
        client.release();
    }
}

// Function to return all rooms with no booking conflict with a given class
// Parts of the bookRoomForClass may be deleted because this function already checks for room availability conflicts
async function getAvailableRoomsForClass(class_id) {
    const client = await pool.connect();
    try {
        // Ensure you retrieve the begin_time and end_time correctly
        const timeQuery = `
            SELECT a.begin_time, a.end_time
            FROM trainer_availability a
            JOIN group_class g ON a.availability_id = g.availability_id
            WHERE g.class_id = $1
        `;
        const { rows: timeRows } = await client.query(timeQuery, [class_id]);
        if (timeRows.length === 0) {
            throw new Error('Class not found or has no set availability.');
        }

        // The query checks for available rooms (not out of service) that do not have a time conflict with the given class
        const availableRoomsQuery = `
            SELECT DISTINCT r.room_id
            FROM room r
            WHERE r.is_deleted = FALSE AND NOT EXISTS (
                SELECT 1
                FROM group_class gc
                JOIN trainer_availability ta ON gc.availability_id = ta.availability_id
                WHERE gc.room_id = r.room_id
                AND (
                    ta.begin_time < $2
                    AND ta.end_time > $1
                )
                AND gc.completed = FALSE
            )
            ORDER BY r.room_id
        `;
        const { rows: availableRooms } = await client.query(availableRoomsQuery, [timeRows[0].begin_time, timeRows[0].end_time]);
        console.log('Available rooms:', availableRooms.map(row => row.room_id));

        return availableRooms.map(row => row.room_id); // Return the list of available room IDs
    } catch (err) {
        console.error('Failed to retrieve available rooms:', err.message);
        throw err;
    } finally {
        client.release();
    }
}

// Function to add equipment to a room (by an administrator)
async function addEquipment(description, room_id) {
    const client = await pool.connect();
    try {
        const insertEquipmentQuery = `
            INSERT INTO equipment(description, room_id)
            VALUES ($1, $2)
        `;
        await client.query(insertEquipmentQuery, [description, room_id]);
        console.log('Equipment added successfully.');
    } catch (err) {
        console.error('Failed to add equipment:', err.message);
        throw err;
    } finally {
        client.release();
    }
}

// Function to request maintenance for a piece of equipment (by a trainer or administrator)
async function requestMaintenance(equipment_id) {
    const client = await pool.connect();
    try {
        const updateQuery = `
            UPDATE equipment
            SET needs_maintenance = TRUE
            WHERE equipment_id = $1
        `;
        await client.query(updateQuery, [equipment_id]);
        console.log(`Equipment with ID ${equipment_id} marked as needing maintenance.`);
    } catch (err) {
        console.error('Failed to mark equipment as needing maintenance:', err.message);
        throw err;
    } finally {
        client.release();
    }
}

// Function to mark equipment as maintained (by an administrator)
async function maintainEquipment(equipment_id) {
    const client = await pool.connect();
    try {
        const updateQuery = `
            UPDATE equipment
            SET needs_maintenance = FALSE,
                last_maintained_at = NOW()
            WHERE equipment_id = $1
        `;
        await client.query(updateQuery, [equipment_id]);
        console.log(`Maintenance completed for equipment with ID ${equipment_id}.`);
    } catch (err) {
        console.error('Failed to perform maintenance on equipment:', err.message);
        throw err;
    } finally {
        client.release();
    }
}

// Function to search for members by username or name (by a trainer or administrator)
async function searchMembers(searchString) {
    const client = await pool.connect();
    try {
        const fuzzySearchString = `%${searchString}%`;
        const searchMemberQuery = `
            SELECT a.username, a.name, m.age, m.gender
            FROM account a
            JOIN member m ON a.username = m.member_username
            WHERE a.is_deleted = FALSE
            AND a.user_type = 'Member'
            AND (a.username ILIKE $1 OR a.name ILIKE $1)
            ORDER BY a.name;
        `;

        const { rows } = await client.query(searchMemberQuery, [fuzzySearchString]);
        if (rows.length === 0) {
            console.log('No matching members found.');
        } else {
            console.log('Matching members:', rows);
        }
        return rows;
    } catch (err) {
        console.error('Failed to search for members:', err);
        throw err;
    } finally {
        client.release();
    }
}

async function getMemberGoals(member_username) {
    const client = await pool.connect();
    try {
        const query = `
            SELECT goal_type, achieved
            FROM member_goal
            WHERE member_username = $1;
        `;
        const { rows } = await client.query(query, [member_username]);
        if (rows.length === 0) {
            console.log('No goals found for member.');
        } else {
            console.log('Member goals:', rows);
        }
        return rows;
    } catch (err) {
        console.error('Failed to get member goals:', err);
        throw err;
    } finally {
        client.release();
    }
}

async function getExerciseRoutines(member_username) {
    const client = await pool.connect();
    try {
        const query = `
            SELECT description
            FROM exercise_routine
            WHERE member_username = $1;
        `;
        const { rows } = await client.query(query, [member_username]);
        if (rows.length === 0) {
            console.log('No exercise routines found for member.');
        } else {
            console.log('Exercise routines:', rows);
        }
        return rows;
    } catch (err) {
        console.error('Failed to get exercise routines:', err);
        throw err;
    } finally {
        client.release();
    }
}

async function getHealthMetrics(member_username) {
    const client = await pool.connect();
    try {
        const query = `
            SELECT metric_timestamp, weight, body_fat_percentage, systolic_pressure, diastolic_pressure
            FROM health_metric
            WHERE member_username = $1
            ORDER BY metric_timestamp DESC;
        `;
        const { rows } = await client.query(query, [member_username]);
        if (rows.length === 0) {
            console.log('No health metrics found for member.');
        } else {
            console.log('Health metrics:', rows);
        }
        return rows;
    } catch (err) {
        console.error('Failed to get health metrics:', err);
        throw err;
    } finally {
        client.release();
    }
}


async function main() {
    // Register member and perform related operations
    await registerMember('userid123', 'John Doe', 'password123', 25, 'Male');
    await registerMember('userid456', 'Jane Smith', 'password123', 22, 'Female');
    await createBill('userid123', 50.00, 'Personal Training Session Fee');
    await payBill(1);
    await payBill(1); // Attempt to pay the bill a second time as in the original example
    await addMemberGoal('userid123', 'Lose Weight');
    await addExerciseRoutine('userid123', 'Morning jog for 30 minutes');
    await addHealthMetric('userid123', 180, 20, 120, 80);
    // Assuming markGoalAchieved function exists and is intended to be called here
    await markGoalAchieved('userid123', 'Lose Weight');

    // Register trainer and perform related operations
    await registerTrainer('trainerid123', 'Alex Smith', 'password456', 75);
    await addTrainerSpecialty('trainerid123', 'Weightlifting');
    await addTrainerAvailability('trainerid123', '2021-12-01 10:00:00', '2021-12-01 12:00:00');//1
    await addTrainerAvailability('trainerid123', '2021-12-01 11:00:00', '2021-12-02 16:00:00');
    await addTrainerAvailability('trainerid123', '2021-12-02 14:00:00', '2021-12-02 16:00:00');//2
    await addTrainerAvailability('trainerid123', '2021-12-01 12:00:00', '2021-12-01 14:00:00');//3
    await addPersonalTrainingSession('userid123', 2, 'Weightlifting session');
    await markSessionCompleted(1);
    await registerTrainer('trainerid456', 'Sarah Johnson', 'password456', 60);
    await addTrainerSpecialty('trainerid456', 'Cardio');
    await addTrainerAvailability('trainerid456', '2021-12-01 08:00:00', '2021-12-01 11:00:00');//4

    // Add room and book room for class
    await addGroupClass(1, 'Yoga class', 20.00);
    await addGroupClass(3, 'Weightlifting session', 30.00);
    await addGroupClass(4, 'Cardio session', 20.00);
    await registerClassMember(1, 'userid123');
    await addRoom('Room 1');
    await addRoom('Room 2');
    await addRoom('Room 3');
    await bookRoomForClass(1, 1);
    await bookRoomForClass(2, 2);
    await bookRoomForClass(3, 3);
    let result = await getAvailableRoomsForClass(1);
    console.log(result);
    result = await getAvailableRoomsForClass(2);
    console.log(result);
    result = await getAvailableRoomsForClass(3);
    console.log(result);
    await markClassCompleted(1);
    await addEquipment('Treadmill', 1);
    await addEquipment('Dumbbells', 1);
    let treadmill = await pool.query('SELECT * FROM equipment WHERE description = $1', ['Treadmill']);
    console.log(treadmill);
    await requestMaintenance(1);
    treadmill = await pool.query('SELECT * FROM equipment WHERE description = $1', ['Treadmill']);
    console.log(treadmill);
    await maintainEquipment(1);
    treadmill = await pool.query('SELECT * FROM equipment WHERE description = $1', ['Treadmill']);
    console.log(treadmill);

    await searchMembers('jane');


    // Register administrator
    await registerAdministrator('adminid123', 'Sam Lee', 'password789');
}

async function overlapTest() {
    await registerTrainer('trainerid123', 'Alex Smith', 'password456', 75);
    await addTrainerAvailability('trainerid123', '2021-12-01 10:00:00', '2021-12-01 12:00:00');
    await addTrainerAvailability('trainerid123', '2021-12-01 08:00:00', '2021-12-01 11:00:00');
    await addTrainerAvailability('trainerid123', '2021-12-01 11:00:00', '2021-12-02 16:00:00');
    await addTrainerAvailability('trainerid123', '2021-12-01 10:00:00', '2021-12-01 12:00:00');
    await addTrainerAvailability('trainerid123', '2021-12-01 10:30:00', '2021-12-01 11:30:00');
    await addTrainerAvailability('trainerid123', '2021-12-02 14:00:00', '2021-12-02 16:00:00');
    await addTrainerAvailability('trainerid123', '2021-12-01 12:00:00', '2021-12-01 14:00:00');
}

async function roomConflictTest() {
    await addRoom('Room 1');
    await addRoom('Room 2');
    await addRoom('Room 3');
    await registerTrainer('trainerid123', 'Alex Smith', 'password456', 75);
    await addTrainerAvailability('trainerid123', '2021-12-01 10:00:00', '2021-12-01 12:00:00');
    await registerTrainer('trainerid456', 'Sarah Johnson', 'password456', 60);
    await addTrainerAvailability('trainerid456', '2021-12-01 08:00:00', '2021-12-01 11:00:00');

    await addGroupClass(1, 'Yoga class', 20.00);
    await addGroupClass(2, 'Weightlifting session', 30.00);
    await bookRoomForClass(2, 1);
    await bookRoomForClass(1, 1);
}

main().finally(() => pool.end());
//overlapTest().finally(() => pool.end());
//roomConflictTest().finally(() => pool.end());