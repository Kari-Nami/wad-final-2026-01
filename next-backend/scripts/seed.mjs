import bcrypt from "bcrypt";
import { MongoClient } from "mongodb";

const STUDENT_ROLE = "Student";
const TEACHER_ROLE = "Teacher";

const mongoUri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;
const studentPassword = process.env.SEED_STUDENT_PASSWORD;
const teacherPassword = process.env.SEED_TEACHER_PASSWORD;

if (!mongoUri) {
  throw new Error("MONGODB_URI is required in .env.local before seeding.");
}

if (!dbName) {
  throw new Error("DB_NAME is required in .env.local before seeding.");
}

if (!studentPassword || !teacherPassword) {
  throw new Error(
    "SEED_STUDENT_PASSWORD and SEED_TEACHER_PASSWORD are required in .env.local.",
  );
}

const testUsers = [
  {
    username: "student1",
    email: "student1@example.com",
    role: STUDENT_ROLE,
    password: studentPassword,
  },
  {
    username: "student2",
    email: "student2@example.com",
    role: STUDENT_ROLE,
    password: studentPassword,
  },
  {
    username: "student3",
    email: "student3@example.com",
    role: STUDENT_ROLE,
    password: studentPassword,
  },
  {
    username: "teacher1",
    email: "teacher1@example.com",
    role: TEACHER_ROLE,
    password: teacherPassword,
  },
  {
    username: "teacher2",
    email: "teacher2@example.com",
    role: TEACHER_ROLE,
    password: teacherPassword,
  },
  {
    username: "teacher3",
    email: "teacher3@example.com",
    role: TEACHER_ROLE,
    password: teacherPassword,
  },
];

const client = new MongoClient(mongoUri);

try {
  await client.connect();

  const db = client.db(dbName);
  const users = db.collection("user");
  const courses = db.collection("course");
  const now = new Date();

  await users.createIndex({ email: 1 }, { unique: true });
  await users.createIndex({ username: 1 }, { unique: true });
  await courses.createIndex({ teacherId: 1 });
  await courses.createIndex({ status: 1, name: 1 });
  await courses.createIndex({ enrolledStudentIds: 1 });

  const operations = await Promise.all(
    testUsers.map(async ({ password, ...user }) => ({
      updateOne: {
        filter: { email: user.email },
        update: {
          $set: {
            ...user,
            password: await bcrypt.hash(password, 12),
            updatedAt: now,
          },
          $setOnInsert: { createdAt: now },
        },
        upsert: true,
      },
    })),
  );

  const result = await users.bulkWrite(operations);

  console.log(`Database: ${dbName}`);
  console.log(`Inserted users: ${result.upsertedCount}`);
  console.log(`Updated users: ${result.modifiedCount}`);
  console.log(`Test users ready: ${testUsers.length}`);
} catch (error) {
  console.error("Seed failed:", error.message);
  process.exitCode = 1;
} finally {
  await client.close();
}
