// DB schema for mongodb task

// 1. Users Collection
db.users.insertMany([
    {
        name: "John Doe",
        email: "john@example.com",
        batch: "Batch1",
        attendance: [
            { date: ISODate("2024-10-15"), status: "present" },
            { date: ISODate("2024-10-16"), status: "absent" }
        ],
        tasks: [
            { task_id: ObjectId("task1"), submitted: true },
            { task_id: ObjectId("task2"), submitted: false }
        ],
        codekata_problems_solved: 45
    }
]);

// 2. CodeKata Collection
db.codekata.insertMany([
    {
        problem_name: "Array Rotation",
        difficulty: "Easy",
        solved_by_users: [ObjectId("user1"), ObjectId("user2")]
    }
]);

// 3. Attendance Collection
db.attendance.insertMany([
    { user_id: ObjectId("user1"), date: ISODate("2024-10-15"), status: "present" },
    { user_id: ObjectId("user1"), date: ISODate("2024-10-16"), status: "absent" }
]);

// 4. Topics Collection
db.topics.insertMany([
    { topic_name: "Introduction to MongoDB", date: ISODate("2024-10-10") },
    { topic_name: "Advanced Aggregation", date: ISODate("2024-10-20") }
]);

// 5. Tasks Collection
db.tasks.insertMany([
    { task_name: "Build a REST API", topic_id: ObjectId("topic1"), date: ISODate("2024-10-11") },
    { task_name: "Design Schema", topic_id: ObjectId("topic2"), date: ISODate("2024-10-21") }
]);

// 6. Company Drives Collection
db.company_drives.insertMany([
    { company_name: "Google", drive_date: ISODate("2020-10-16"), students_appeared: [ObjectId("user1")] },
    { company_name: "Amazon", drive_date: ISODate("2020-10-25"), students_appeared: [ObjectId("user2")] }
]);

// 7. Mentors Collection
db.mentors.insertMany([
    { name: "Alice", mentees: [ObjectId("user1"), ObjectId("user2"), ObjectId("user3")] },
    { name: "Bob", mentees: [ObjectId("user4"), ObjectId("user5")] }
]);

// Queries

// 1. Find all topics and tasks which are taught in the month of October
db.topics.aggregate([
    {
        $lookup: {
            from: "tasks",
            localField: "_id",
            foreignField: "topic_id",
            as: "related_tasks"
        }
    },
    {
        $match: {
            date: {
                $gte: ISODate("2024-10-01"),
                $lte: ISODate("2024-10-31")
            }
        }
    }
]);

// 2. Find all the company drives which appeared between 15-Oct-2020 and 31-Oct-2020
db.company_drives.find({
    drive_date: {
        $gte: ISODate("2020-10-15"),
        $lte: ISODate("2020-10-31")
    }
});

// 3. Find all the company drives and students who appeared for the placement
db.company_drives.aggregate([
    {
        $lookup: {
            from: "users",
            localField: "students_appeared",
            foreignField: "_id",
            as: "students"
        }
    }
]);

// 4. Find the number of problems solved by the user in CodeKata
db.users.find({}, { name: 1, codekata_problems_solved: 1 });

// 5. Find all the mentors who have mentee counts more than 15
db.mentors.find({
    $expr: { $gt: [{ $size: "$mentees" }, 15] }
});

// 6. Find the number of users who are absent and tasks not submitted between 15-Oct-2020 and 31-Oct-2020
db.users.aggregate([
    {
        $match: {
            "attendance": {
                $elemMatch: {
                    date: {
                        $gte: ISODate("2020-10-15"),
                        $lte: ISODate("2020-10-31"),
                    },
                    status: "absent"
                }
            },
            "tasks": {
                $elemMatch: {
                    submitted: false
                }
            }
        }
    },
    {
        $count: "users_absent_tasks_not_submitted"
    }
]);
