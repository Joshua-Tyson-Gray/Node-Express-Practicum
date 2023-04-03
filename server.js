const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const logger = require('morgan');
const favicon = require('serve-favicon');
const path = require('path');
const helmet = require('helmet');
const mongoose = require("mongoose");
require('dotenv').config()

app.use(express.static('public'));
app.use(logger('dev'))
app.use(favicon(path.join(__dirname, 'public', 'crest.svg')));
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
}));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Set up database connection
let dbUrl = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.u3w65xy.mongodb.net/studentlogs?retryWrites=true&w=majority`;
mongoose.connect(dbUrl);

// Define database schemas
let Schema = mongoose.Schema;
let courseSchema = new Schema({
    id: {
        type: String,
        required: true
    },
    display: {
        type: String,
        required: true
    }
});
let logSchema = new Schema({
    courseId: {
        type: String,
        required: true
    },
    uvuId: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    id: {
        type: String,
        required: true
    }
});

// Add a new log with the passed data.
app.post("/logs", async (req, res) => {
    let newLog = req.body;
    // Generate log id
    newLog.id = uuidv4();
    let LogEntry = mongoose.model(newLog.courseId, logSchema);
    try{
        // Create new log
        let logEntry = new LogEntry(newLog);
        // Save log to the database
        logEntry = await logEntry.save();
    }catch(err){
        res.status(400).json({
            status: 400,
            message: err.message
        });
    }
});

// Update the log with the given log id
app.put("/logs/:id", async (req, res) => {
    let log = req.body;
    let LogEntry = mongoose.model(log.courseId, logSchema);
    try{
        // Update data in database
        let logEntry = await LogEntry.findOneAndUpdate({id: req.params.id}, log, { new : true });
        if(logEntry){
            res.status(200).json({
                status: 200,
                data: logEntry
            });
        };
    }catch(err){
        res.status(400).json({
            status: 400,
            message: err.message
        });
    }
});

// Get all logs for the given course and student id
app.get("/logs",  async (req, res) => {

    // Query String example: 'http://localhost:3000/logs?courseId=' + course + '&uvuId=' + id
    let LogEntry = mongoose.model(req.query["courseId"], logSchema);
    let docs = null;
    let logs = [];
    try{
        // Retrieve data from atlas database
        docs = await LogEntry.find({uvuId : req.query["uvuId"]}, {_id:0, __v:0});
        // Extract each log and push it into an array
        for(doc of docs){
            logs.push(doc._doc);
        }
    }catch(err){
        res.status(400).json({
            status: 400,
            message: err.message
        });
    }
    // Send results
    res.send(logs);
});

// Retrieve all courses
app.get("/api/v1/courses", async (req, res) => {
    let LogEntry = mongoose.model("courses", courseSchema);
    // Retrieve data from atlas database
    let docs = await LogEntry.find({},{_id:0});
    let courses = [];
    // Extract each log and push it into an array
    for(doc of docs){
        courses.push(doc._doc);
    }
    res.send(courses);
});

// If page doesn't exist, send 404.html page
app.get('*', (req, res) => {
	res.sendFile(`${__dirname}/public/404.html`); 
});

// Start server
server.listen(3000, () => {
    console.log('listening on *:3000');
});

//loadDB();
async function loadDB(){
    // Load DataBase from db.json.
    let DB_DATA = JSON.parse(fs.readFileSync('db.json'));
    for(d of DB_DATA["logs"]){
        let newLog = d;
        // Generate log id
        newLog.id = uuidv4();
        let LogEntry = mongoose.model(newLog.courseId, logSchema);
        try{
            // Create new log
            let logEntry = new LogEntry(newLog);
            // Save log to the database
            logEntry = await logEntry.save();
        }catch(err){
            console.log("Could not push db to atlas")
        }
    }
}
