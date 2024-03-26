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
const insertAccountText = `INSERT INTO account(account_id, name, password, user_type) VALUES ($1, $2, $3, $4)`;
// Query for inserting data into the bill table
const insertBillText = `INSERT INTO bill(member_id, amount, description) VALUES ($1, $2, $3)`;
// Query for checking trainer availability and booking a session
const availabilityQueryText = `SELECT trainer_id, begin_time, end_time FROM trainer_availability WHERE availability_id = $1 AND is_booked = FALSE`;
// Query for updating the availability status after booking a session
const updateAvailabilityText = `UPDATE trainer_availability SET is_booked = TRUE WHERE availability_id = $1`;

// Function to register a new member (registration page or by an administrator)
async function registerMember(account_id, name, password, age, gender) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN'); // Start transaction
        // Insert into account table
        await client.query(insertAccountText, [account_id, name, password, 'Member']);
        // Insert into member table
        const insertMemberText = `
            INSERT INTO member(member_id, age, gender)
            VALUES ($1, $2, $3)
        `;
        await client.query(insertMemberText, [account_id, age, gender]);
        // Insert an unpaid bill for $100.00
        await client.query(insertBillText, [account_id, 100.00, 'Membership purchase']);
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
async function registerTrainer(account_id, name, password, rate_per_hour) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN'); // Start transaction
        // Insert into account table
        await client.query(insertAccountText, [account_id, name, password, 'Trainer']);
        // Insert into trainer table
        const insertTrainerText = `
            INSERT INTO trainer(trainer_id, rate_per_hour)
            VALUES ($1, $2)
        `;
        await client.query(insertTrainerText, [account_id, rate_per_hour]);
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
async function registerAdministrator(account_id, name, password) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN'); // Start transaction
        // Insert into account table
        await client.query(insertAccountText, [account_id, name, password, 'Administrator']);
        // Insert into administrator table
        const insertAdminText = `
            INSERT INTO administrator(administrator_id)
            VALUES ($1)
        `;
        await client.query(insertAdminText, [account_id]);
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
async function createBill(member_id, amount, description) {
    const client = await pool.connect();
    try {
        await client.query(insertBillText, [member_id, amount, description]);
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
        const checkBillText = `SELECT cleared FROM bill WHERE bill_id = $1`;
        const res = await client.query(checkBillText, [bill_id]);
        if (res.rows.length === 0) {
            throw new Error('Bill not found.');
        } else if (res.rows[0].cleared) {
            console.log('Bill is already paid.');
            await client.query('ROLLBACK'); // No changes to commit, so rollback
            return;
        }
        // If the bill is not already paid, update it to cleared
        const updateBillText = `UPDATE bill SET cleared = true WHERE bill_id = $1`;
        await client.query(updateBillText, [bill_id]);
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
async function addTrainerSpecialty(trainer_id, specialty) {
    const client = await pool.connect();
    try {
        const insertSpecialtyText = `
            INSERT INTO trainer_specialty(trainer_id, specialty)
            VALUES ($1, $2)
        `;
        await client.query(insertSpecialtyText, [trainer_id, specialty]);
        console.log('Trainer specialty added successfully.');
    } catch (err) {
        console.error('Failed to add trainer specialty:', err.message);
        throw err;
    } finally {
        client.release();
    }
}

// Function to add availability for a trainer (by a trainer), begin_time and end_time must be timestamps
async function addTrainerAvailability(trainer_id, begin_time, end_time) {
    const client = await pool.connect();
    try {
        const insertAvailabilityText = `
            INSERT INTO trainer_availability(trainer_id, begin_time, end_time)
            VALUES ($1, $2, $3)
        `;
        await client.query(insertAvailabilityText, [trainer_id, begin_time, end_time]);
        console.log('Trainer availability added successfully.');
    } catch (err) {
        console.error('Failed to add trainer availability:', err.message);
        throw err;
    } finally {
        client.release();
    }
}

// Function to add a goal to a member (by a member)
async function addMemberGoal(member_id, goal_type) {
    const client = await pool.connect();
    try {
        const insertGoalText = `
            INSERT INTO member_goal(member_id, goal_type)
            VALUES ($1, $2)
        `;
        await client.query(insertGoalText, [member_id, goal_type]);
        console.log('Member goal added successfully.');
    } catch (err) {
        console.error('Failed to add member goal:', err.message);
        throw err;
    } finally {
        client.release();
    }
}

async function markGoalAchieved(member_id, goal_type) {
    const client = await pool.connect();
    try {
        const updateGoalText = `
            UPDATE member_goal
            SET achieved = true
            WHERE member_id = $1 AND goal_type = $2
        `;
        await client.query(updateGoalText, [member_id, goal_type]);
        console.log('Member goal marked as complete.');
    } catch (err) {
        console.error('Failed to mark member goal as complete:', err.message);
        throw err;
    } finally {
        client.release();
    }
}

// Function to add an exercise routine to a member (by a member)
async function addExerciseRoutine(member_id, description) {
    const client = await pool.connect();
    try {
        const insertRoutineText = `
            INSERT INTO exercise_routine(member_id, description)
            VALUES ($1, $2)
        `;
        await client.query(insertRoutineText, [member_id, description]);
        console.log('Exercise routine added successfully.');
    } catch (err) {
        console.error('Failed to add exercise routine:', err.message);
        throw err;
    } finally {
        client.release();
    }
}

// Function to add a health metric to a member (by a member)
async function addHealthMetric(member_id, weight, body_fat_percentage, systolic_pressure, diastolic_pressure) {
    const client = await pool.connect();
    try {
        const insertMetricText = `
            INSERT INTO health_metric(member_id, weight, body_fat_percentage, systolic_pressure, diastolic_pressure)
            VALUES ($1, $2, $3, $4, $5)
        `;
        await client.query(insertMetricText, [member_id, weight, body_fat_percentage, systolic_pressure, diastolic_pressure]);
        console.log('Health metric added successfully.');
    } catch (err) {
        console.error('Failed to add health metric:', err.message);
        throw err;
    } finally {
        client.release();
    }
}

// Function to add a personal training session for a member (by a member or administrator)
async function addPersonalTrainingSession(member_id, availability_id, description) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { rows: availability } = await client.query(availabilityQueryText, [availability_id]);
        if (availability.length === 0) {
            throw new Error('Availability not found or already booked.');
        }
        const { trainer_id, begin_time, end_time } = availability[0];

        // Create the bill based on the duration of the session
        const duration = (end_time - begin_time) / (1000 * 3600);
        const rateQuery = `
            SELECT rate_per_hour
            FROM trainer
            WHERE trainer_id = $1
        `;
        const { rows: rateRows } = await client.query(rateQuery, [trainer_id]);
        if (rateRows.length === 0) {
            throw new Error('Trainer not found.');
        }
        const { rate_per_hour } = rateRows[0];
        const amount = rate_per_hour * duration;
        await client.query(insertBillText, [member_id, amount, description]);

        // Insert the session
        const insertSessionText = `
            INSERT INTO personal_training_session(member_id, availability_id, description)
            VALUES ($1, $2, $3)
            RETURNING session_id
        `;
        await client.query(insertSessionText, [member_id, availability_id, description]);

        // Mark the availability as booked
        await client.query(updateAvailabilityText, [availability_id]);
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
        const updateSessionText = `
            UPDATE personal_training_session
            SET completed = TRUE
            WHERE session_id = $1
        `;
        await client.query(updateSessionText, [session_id]);
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
        const { rows: availability } = await client.query(availabilityQueryText, [availability_id]);
        if (availability.length === 0) {
            throw new Error('Availability not found or already booked.');
        }

        // Insert the group class
        const insertClassText = `
            INSERT INTO group_class(availability_id, description, fee)
            VALUES ($1, $2, $3)
            RETURNING class_id
        `;
        await client.query(insertClassText, [availability_id, description, fee]);

        // Update the trainer_availability to mark as booked
        await client.query(updateAvailabilityText, [availability_id]);
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
        const updateClassText = `
            UPDATE group_class
            SET completed = TRUE
            WHERE class_id = $1
        `;
        await client.query(updateClassText, [class_id]);
        console.log('Group class marked as completed.');
    } catch (err) {
        console.error('Failed to mark group class as completed:', err.message);
        throw err;
    } finally {
        client.release();
    }
}



async function main() {
    // Register member and perform related operations
    await registerMember('userid123', 'John Doe', 'password123', 25, 'Male');
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
    await addTrainerAvailability('trainerid123', '2021-12-01 10:00:00', '2021-12-01 12:00:00');
    await addTrainerAvailability('trainerid123', '2021-12-02 14:00:00', '2021-12-02 16:00:00');
    await addPersonalTrainingSession('userid123', 1, 'Weightlifting session');
    await addGroupClass(2, 'Yoga class', 20.00);
    await markSessionCompleted(1);
    await markClassCompleted(1);

    // Register administrator
    await registerAdministrator('adminid123', 'Sam Lee', 'password789');
}

main().finally(() => pool.end());
