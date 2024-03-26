const {Pool} = require('pg');

// Assuming you have a Pool instance created for your database connection
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'test',
    password: 'postgres',
    port: 5432,
});


const insertAccountText = `INSERT INTO account(account_id, name, password, user_type) VALUES ($1, $2, $3, $4)`;
const insertBillText = `INSERT INTO bill(member_id, amount, description) VALUES ($1, $2, $3)`;

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




registerMember('userid123', 'John Doe', 'password123', 25, 'Male')
    .then(() => console.log('Registration successful.'))
    .catch(err => console.error('Registration failed:', err))
    .finally(() => createBill('userid123', 50.00, 'Personal Training Session Fee')
        .then(() => console.log('Bill creation successful.'))
        .catch(err => console.error('Bill creation failed:', err))
        .finally(() => payBill(1)
            .then(() => console.log('Bill payment successful.'))
            .catch(err => console.error('Bill payment failed:', err))
            .finally(() => payBill(1)
                .then(() => console.log('Bill payment successful.'))
                .catch(err => console.error('Bill payment failed:', err))
                .finally(() => addMemberGoal('userid123', 'Lose Weight')
                    .then(() => console.log('Member goal added successfully.'))
                    .catch(err => console.error('Failed to add member goal:', err))
                    .finally(() => addExerciseRoutine('userid123', 'Morning jog for 30 minutes')
                        .then(() => console.log('Exercise routine added successfully.'))
                        .catch(err => console.error('Failed to add exercise routine:', err))
                        .finally(() => addHealthMetric('userid123', 180, 20, 120, 80)
                            .then(() => console.log('Health metric added successfully.'))
                            .catch(err => console.error('Failed to add health metric:', err))
                            .finally(() => markGoalAchieved('userid123', 'Lose Weight'))))))));
registerTrainer('trainerid123', 'Alex Smith', 'password456', 75)
    .then(() => console.log('Trainer registration successful.'))
    .catch(err => console.error('Trainer registration failed:', err))
    .finally(() => addTrainerSpecialty('trainerid123', 'Weightlifting')
        .then(() => console.log('Trainer specialty added successfully.'))
        .catch(err => console.error('Failed to add trainer specialty:', err))
        .finally(() => addTrainerAvailability('trainerid123', '2021-12-01 10:00:00', '2021-12-01 12:00:00')
            .then(() => console.log('Trainer availability added successfully.'))
            .catch(err => console.error('Failed to add trainer availability:', err))));
registerAdministrator('adminid123', 'Sam Lee', 'password789')
    .then(() => console.log('Administrator registration successful.'))
    .catch(err => console.error('Administrator registration failed:', err));

