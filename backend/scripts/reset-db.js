const sql = require("mssql");
const fs = require("fs");
const path = require("path");
require("dotenv").config();
const { connectDb } = require("../src/config/db.ts");

async function resetDatabase() {
  try {
    console.log("🔄 Connecting to database...");
    await connectDb();

    console.log("📁 Reading SQL script...");
    const sqlPath = path.join(process.cwd(), "data", "reset_database.sql");
    const sqlScript = fs.readFileSync(sqlPath, "utf8");

    console.log("⚡ Executing database reset...");
    // Split script by GO statements and execute each batch
    const batches = sqlScript.split(/\bGO\b/i);

    for (const batch of batches) {
      if (batch.trim()) {
        await sql.query(batch);
      }
    }

    console.log("✅ Database reset completed successfully!");
    console.log("📊 New data has been inserted:");
    console.log("   - 5 customers");
    console.log("   - 8 costumes");
    console.log("   - 4 rental orders");
    console.log("   - 1 penalty config");
    console.log("   - 3 users");

  } catch (error) {
    console.error("❌ Database reset failed:", error);
    process.exit(1);
  } finally {
    await sql.close();
  }
}

// Run if called directly
if (require.main === module) {
  resetDatabase();
}

module.exports = { resetDatabase };