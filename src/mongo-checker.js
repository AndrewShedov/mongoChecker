import { MongoClient } from "mongodb";
import { performance } from "perf_hooks";

/* --- core logic --- */
export async function runMongoChecker(config) {

  const requiredKeys = [
    "uri",
    "db",
    "collection",
    "field",
    "maxDuplicatesToShow",
    "allowDiskUse"
  ];

  for (const key of requiredKeys) {
    if (!config[key] && config[key] !== false) {
      console.error(`❌ Error: config missing required parameter - '${key}'.`);
      process.exit(1);
    }
  }

  if (
    !Number.isInteger(config.maxDuplicatesToShow) ||
    config.maxDuplicatesToShow <= 0
  ) {
    console.error("❌ Error: 'maxDuplicatesToShow' must be a positive integer.");
    process.exit(1);
  }

  if (typeof config.allowDiskUse !== "boolean") {
    console.error("❌ Error: 'allowDiskUse' must be a boolean (true/false).");
    process.exit(1);
  }

  const {
    uri,
    db,
    collection,
    field,
    maxDuplicatesToShow,
    allowDiskUse
  } = config;

  const client = new MongoClient(uri);

  console.log("🔌 Connecting to MongoDB...\n");
  console.log(`🌐 URI:                 ${uri}`);
  console.log(`🗄️ Database:            ${db}`);
  console.log(`📂 Collection:          ${collection}`);
  console.log(`🔑 Search field:        ${field}`);
  console.log(`💾 Allow disk use:      ${allowDiskUse}`);
  console.log(`👁️ Max show duplicates: ${maxDuplicatesToShow}\n`);

  const spinnerFrames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  let spinnerIndex = 0;

  const start = performance.now();

  const spinnerInterval = setInterval(() => {
    const frame = spinnerFrames[spinnerIndex % spinnerFrames.length];
    process.stdout.write(
      `\r${frame} Searching for duplicates by field "${field}"...`
    );
    spinnerIndex++;
  }, 100);

  try {
    await client.connect();
    const dbConn = client.db(db);
    const coll = dbConn.collection(collection);

    const duplicates = await coll
      .aggregate(
        [
          { $group: { _id: `$${field}`, count: { $sum: 1 } } },
          { $match: { count: { $gt: 1 } } },
          { $sort: { count: -1 } }
        ],
        { allowDiskUse }
      )
      .toArray();

    clearInterval(spinnerInterval);
    if (process.stdout.clearLine) process.stdout.clearLine(0);
    if (process.stdout.cursorTo) process.stdout.cursorTo(0);

    console.log(`✅ Found ${duplicates.length} duplicates for field "${field}".`);

    const shown = Math.min(maxDuplicatesToShow, duplicates.length);
    for (let i = 0; i < shown; i++) {
      const d = duplicates[i];
      let val;

      if (d._id instanceof Date) {
        val = d._id.toISOString();
      } else if (typeof d._id === "object" && d._id !== null) {
        val = JSON.stringify(d._id);
      } else {
        val = String(d._id);
      }

      console.log(`\n📌 ${val} — ${d.count} times`);
    }

    if (duplicates.length > shown) {
      console.log(`\n...and ${duplicates.length - shown} more duplicates`);
    }

    const duration = performance.now() - start;
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    const milliseconds = Math.floor(duration % 1000);

    let timeString = "";
    if (minutes > 0) timeString += `${minutes} min `;
    if (seconds > 0) timeString += `${seconds} sec `;
    timeString += `${milliseconds} ms`;

    console.log(`\n⏱️ Lead time: ${timeString}`);
  } finally {
    clearInterval(spinnerInterval);
    if (process.stdout.clearLine) process.stdout.clearLine(0);
    if (process.stdout.cursorTo) process.stdout.cursorTo(0);
    await client.close();
  }
}
