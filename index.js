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

app.use(express.static('public'));
app.use(logger('dev'))
app.use(favicon(path.join(__dirname, 'public', 'crest.svg')));
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
}));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Load DataBase from db.json.
let DB_DATA = JSON.parse(fs.readFileSync('db.json'));

// Add a new log with the passed data.
app.post("/logs", (req, res) => {
    let newLog = req.body;
    // Verify proper parameters were sent
    if(!(newLog.courseId && newLog.uvuId && newLog.date && newLog.text)){
        res.status(400).send({
            message: 'Insufficient parameters passed.'
        });
        return;
    }
    // Generate log id
    newLog.id = uuidv4();
    // Write new log to database
    DB_DATA.logs.push(newLog);
    // Persist database to disk
    writeDataToFile();
});

// Update the log with the given log id
app.put("/logs/:id", (req, res) => {
    let logWritten = false;
    let log = req.body;
    // Verify passed parameters
    if(!(log.courseId && log.uvuId && log.date && log.text)){
        res.status(400).send({
            message: 'Insufficient parameters passed.'
        });
        return;
    }
    // Find the log and update
    for(let logIndex in DB_DATA.logs){
        if(DB_DATA.logs[logIndex].id === log.id){
            DB_DATA.logs.splice(logIndex, 1);
            DB_DATA.logs.push(log);
            logWritten = true;
            break;
        }
    }
    // Send an error if the log was not written meaning the log was not found.
    if(!logWritten){
        res.status(400).send({
            message: 'Log not found.'
        });
        return;
    }
    // Persist database to disk
    writeDataToFile();
});

// Get all logs for the given course and student id
app.get("/logs",  (req, res) => {
    // Query String example: 'http://localhost:3000/logs?courseId=' + course + '&uvuId=' + id
    let logs = [];
    // Iterate over database and add to logs array if courseId and uvuId match.
    for(let log of DB_DATA["logs"]){
        if(log["courseId"] == req.query["courseId"] && log["uvuId"] == req.query["uvuId"]){
            logs.push(log);
        }
    }
    // Send results
    res.send(logs);
});

// Retrieve all courses
app.get("/api/v1/courses", (req, res) => {
    res.send(DB_DATA['courses']);
});

// If page doesn't exist, send 404.html page
app.get('*', (req, res) => {
	res.sendFile(`${__dirname}/public/404.html`); 
});

// Start server
server.listen(3000, () => {
    console.log('listening on *:3000');
});

// Write database to file
function writeDataToFile(){
    let db_string = JSON.stringify(DB_DATA, null, 2);
    fs.writeFile('db.json', db_string, (error) => {
        if(error){
            console.log("DB could not be persisted.");
        }
    });
}
