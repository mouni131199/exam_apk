const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const SuperAdmin = require("./models/superadmin.model");

dotenv.config();

const createSuperAdmin = async () => {
  try {
    await connectDB(); // ✅ Wait for DB connection FIRST

    const existing = await SuperAdmin.findOne({ email: process.env.SUPERADMIN_EMAIL });
    if (existing) {
      console.log("✅ Super Admin already exists.");
    } else {
      const hashedPassword = await bcrypt.hash(process.env.SUPERADMIN_PASSWORD, 10);
      const superAdmin = new SuperAdmin({
        username: process.env.SUPERADMIN_USERNAME,
        email: process.env.SUPERADMIN_EMAIL,
        password: hashedPassword,
      });

      await superAdmin.save();
      console.log("🎉 Super Admin created successfully.");
    }
  } catch (err) {
    console.error("❌ Error creating Super Admin:", err.message);
  } finally {
    mongoose.connection.close();
  }
};

createSuperAdmin();
