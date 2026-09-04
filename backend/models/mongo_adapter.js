/**
 * MONGODB ADAPTER — drop-in replacement for backend/models/index.js
 * 1. npm install mongoose
 * 2. Add DB_URL=mongodb://localhost:27017/sentriroad to .env
 * 3. In backend/models/index.js, replace: const db = require("./db");
 *    with: const db = require("./mongo_adapter");
 */
const mongoose = require("mongoose");
const { createModels } = require("./mongoose_schemas");
let models = null;
async function connect(dbUrl) { if (mongoose.connection.readyState >= 1) return models; await mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true }); models = createModels(mongoose.connection); console.log("[MONGODB] Connected:", dbUrl); return models; }
function clean(doc) { if (!doc) return null; const obj = doc.toObject ? doc.toObject() : doc; if (obj._id) obj.id = obj._id.toString(); delete obj._id; delete obj.__v; return obj; }
function cleanList(docs) { return docs.map(clean); }
const Users = { async findByEmail(email) { return clean(await models.User.findOne({ email })); }, async findById(id) { return clean(await models.User.findById(id)); }, async findByRole(role) { return cleanList(await models.User.find({ role })); }, async create({ name, email, phone, role, password_hash }) { return clean(await models.User.create({ name, email, phone, role, password_hash })); } };
const Reports = { async all() { return cleanList(await models.Report.find()); }, async findById(id) { return clean(await models.Report.findById(id)); }, async findByCitizen(citizenId) { return cleanList(await models.Report.find({ citizen_id: citizenId })); }, async findByAssignedCrew(crewId) { const wos = await models.WorkOrder.find({ assigned_crew_id: crewId }); const reportIds = wos.map(w => w.report_id); return cleanList(await models.Report.find({ _id: { $in: reportIds } })); }, async create(data) { return clean(await models.Report.create(data)); }, async updateStatus(reportId, status) { return clean(await models.Report.findByIdAndUpdate(reportId, { status }, { new: true })); } };
const Detections = { async findByReport(reportId) { return cleanList(await models.Detection.find({ report_id: reportId })); }, async findById(id) { return clean(await models.Detection.findById(id)); }, async create(data) { return clean(await models.Detection.create(data)); } };
const Scores = { async findByDetection(detectionId) { return clean(await models.Score.findOne({ detection_id: detectionId })); }, async findById(id) { return clean(await models.Score.findById(id)); }, async create(data) { return clean(await models.Score.create(data)); } };
const WorkOrders = { async all() { return cleanList(await models.WorkOrder.find()); }, async findById(id) { return clean(await models.WorkOrder.findById(id)); }, async findByReport(reportId) { return clean(await models.WorkOrder.findOne({ report_id: reportId })); }, async findByCrew(crewId) { return cleanList(await models.WorkOrder.find({ assigned_crew_id: crewId })); }, async create(data) { return clean(await models.WorkOrder.create(data)); }, async update(id, patch) { return clean(await models.WorkOrder.findByIdAndUpdate(id, { ...patch, updated_at: new Date() }, { new: true })); } };
const Verifications = { async findByWorkOrder(workOrderId) { return clean(await models.Verification.findOne({ work_order_id: workOrderId })); }, async create(data) { return clean(await models.Verification.create(data)); } };
const Feedback = { async findByReport(reportId) { return clean(await models.Feedback.findOne({ report_id: reportId })); }, async create(data) { return clean(await models.Feedback.create(data)); } };
module.exports = { connect, Users, Reports, Detections, Scores, WorkOrders, Verifications, Feedback };
