/**
 * In-memory data store — seeded from mock-server fixture data.
 */
const path = require("path");
const fs = require("fs");
const DATA_DIR = path.resolve(__dirname, "../../mock-server/data");
function load(name) { return JSON.parse(fs.readFileSync(path.join(DATA_DIR, `${name}.json`), "utf-8")); }
const db = { users: load("users"), reports: load("reports"), detections: load("detections"), scores: load("scores"), workorders: load("workorders"), verifications: load("verifications"), feedback: load("feedback") };
module.exports = db;
