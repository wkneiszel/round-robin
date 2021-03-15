// To run this file, need to install node.js and then run on the command prompt:
// npm install express
// node server.js

//Middleware for serving up pages, etc.
var express = require("express");
//Need for processing POST requests
var bodyParser = require("body-parser");

const boardStates = {
    draw: "Draw",
    win: "Win",
    loss: "Loss",
    none: "-"
};

var board = [
    [boardStates.none, boardStates.none, boardStates.none, boardStates.none],
    [boardStates.none, boardStates.none, boardStates.none, boardStates.none],
    [boardStates.none, boardStates.none, boardStates.none, boardStates.none],
    [boardStates.none, boardStates.none, boardStates.none, boardStates.none]
];

var teamNames = ["Team 0", "Team 1", "Team 2", "Team 3"];

var password = "password123";

var app = express(); //gets an instance of express.

app.use(bodyParser.urlencoded({extended: true})); //for POST requests.
app.use(express.static("pub")); //serve up static files publicly (.html, .jpg, .css, etc.)

app.post("/getBoard", function(req, res) {
    res.setHeader("Content-Type", "application/json");
    res.write(JSON.stringify(board));
    res.end();
});

app.post("/getTeamNames", function(req, res) {
    res.setHeader("Content-Type", "application/json");
    res.write(JSON.stringify(teamNames));
    res.end();
});

app.post("/authenticate", function(req, res) {
    if(req.body.password != password){
        res.sendStatus(401);
        return;
    }
    res.setHeader("Content-Type", "application/json");
    res.write(JSON.stringify({authenticated: true}));
    res.end();
});

app.post("/resetPassword", function(req, res) {
    if(req.body.password != password){
        res.sendStatus(401);
        return;
    }
    password = req.body.newPassword;
    res.sendStatus(200);
});

app.post("/clearBoard", function(req, res) {
    if(req.body.password != password){
        res.sendStatus(401);
        return;
    }
    for(let r = 0; r < board.length; r++){
        for(let c = 0; c < board[r].length; c++){
            board[r][c] = boardStates.none;
        }
    }
    res.setHeader("Content-Type", "application/json");
    res.write(JSON.stringify(board));
    res.end();
});

app.post("/setState", function(req, res) {
    if(req.body.password != password){
        res.sendStatus(401);
        return;
    }
    board[req.body.rowIndex][req.body.colIndex] = req.body.state;
    res.setHeader("Content-Type", "application/json");
    res.write(JSON.stringify(board));
    res.end();
});

app.post("/setTeamName", function(req, res) {
    if(req.body.password != password){
        res.sendStatus(401);
        return;
    }
    teamNames[req.body.index] = req.body.name;
    res.setHeader("Content-Type", "application/json");
    res.write(JSON.stringify(teamNames));
    res.end();
});

app.post("/deleteTeam", function(req, res) {
    if(req.body.password != password){
        res.sendStatus(401);
        return;
    }
    teamNames.splice(req.body.index, 1);
    board.splice(req.body.index, 1);
    for(let boardRow of board){
        boardRow.splice(req.body.index, 1);
    }
    let returnData = {
        teamNames: teamNames,
        results: board
    }
    res.setHeader("Content-Type", "application/json");
    res.write(JSON.stringify(returnData));
    res.end();
});

app.post("/newTeam", function(req, res) {
    if(req.body.password != password){
        res.sendStatus(401);
        return;
    }
    teamNames.push(req.body.name);
    let statesArray = [];
    for(let boardRow of board){
        boardRow.push(boardStates.none)
        statesArray.push(boardStates.none);
    }
    statesArray.push(boardStates.none);
    board.push(statesArray)
    let returnData = {
        teamNames: teamNames,
        results: board
    }
    res.setHeader("Content-Type", "application/json");
    res.write(JSON.stringify(returnData));
    res.end();
});

app.listen(80, function() {
    console.log("Server is now running.");
});
