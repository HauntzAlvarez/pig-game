const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {cors: {origin : "*"}});

app.use(express.static('public'))

app.get('/pigGame', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
})


server.listen(3000, () => {
    console.log("Server running...");
})


var player1 = null;
var player2 = null;
var playerArray = [];

let activePlayer = 0;
let currentScore = 0;
const scoresArray = [0, 0];

let leftPlayer = null;
let isStart = false;



io.on('connection', (socket) => {

    //console.log(socket.id);
    //reset players on refresh
    playerArray.push(socket.id);
    console.log(playerArray);
    console.log(playerArray.length);
    console.log(player1 + " " + player2);

    if(playerArray.length >= 2) {
        const playerIndex = playerArray.indexOf(socket.id);
        if(playerIndex >= 2) {
            socket.emit('gameOnSession');
        }
        else {
            //player1 = null;
            //player2 = null;
            clearData();
            io.emit('clearPlayerSpan');
            io.emit('enableSelection');
            console.log("G na!");
        }
    }

    /*
    if(playerArray.length == 2) {
        player1 = null;
        player2 = null;
        io.emit('enableSelection');
        console.log("G na!");
    }
    if(playerArray.length >= 3) {
        socket.emit('gameOnSession');
        const index = playerArray.indexOf(socket.id);
        playerArray.splice(index, 1);
        console.log(playerArray + "Hello");
    }
    */

    socket.emit('getId', socket.id);

    socket.on('playerSelect', (player, id) => {
        if(player1 == null || player2 == null) {
            if(player == 0) {
                player1 = id;
                socket.broadcast.emit('playerRegister', 0, id);
            }
            if(player == 1) {
                player2 = id;
                socket.broadcast.emit('playerRegister', 1, id);
            }
        }

        if(player1 != null && player2 != null) {
            console.log("Player 1: " + player1);
            console.log("Player 2: " + player2);
            activePlayer = 0;
            io.emit('startGame', activePlayer);
            isStart = true;
        }
    })


    socket.on('rollDice', () => {
        const diceNumber = Math.floor(Math.random() * 6) + 1;
        io.emit('showdice', diceNumber);

        if (diceNumber !== 1) {
            currentScore += diceNumber;
            io.emit('currentScore', currentScore, activePlayer);
        }
        else {
            currentScore = 0;
            io.emit('currentScore', currentScore, activePlayer);
            activePlayer = 1 - activePlayer;
            io.emit('endTurn', activePlayer);
            //switchActivePlayer();
        }
    });

    socket.on('holdScore', () => {
        scoresArray[activePlayer] += currentScore;
        io.emit('playerScore', scoresArray[activePlayer], activePlayer);

        currentScore = 0;
        io.emit('currentScore', currentScore, activePlayer);
        activePlayer = 1 - activePlayer;
        io.emit('endTurn', activePlayer);
    })


    socket.on('disconnect', () => {
        const index = playerArray.indexOf(socket.id);
        playerArray.splice(index, 1);

        if((index == 0 || index == 1) && isStart) {
            io.to(playerArray[0]).emit('playerLeft');
            leftPlayer = playerArray[0];

            isStart = false;
        }
        if(playerArray[1] != null && leftPlayer == null) {
            //player1 = null;
            //player2 = null;
            clearData();
            io.emit('clearPlayerSpan');
            io.emit('enableSelection');
        }
        if(playerArray[1] != null && leftPlayer != null) {
            if(leftPlayer == socket.id) {
                //player1 = null;
                //player2 = null;
                clearData();
                io.emit('clearPlayerSpan');
                leftPlayer = null;
                io.emit('enableSelection');
                console.log("Goooo na!");
            }
            else {
                leftPlayer = null;
                io.to(playerArray[1]).emit('waitPlayer');
                console.log('wahew');
            }
        }
        if(playerArray[1] == null) {
            io.to(playerArray[0]).emit('waitPlayer');
        }
        console.log(socket.id + " has left the game");
        console.log(playerArray);
    })


})


function clearData() {
    player1 = null;
    player2 = null;

    activePlayer = 0;
    currentScore = 0;
    scoresArray[0] = 0; 
    scoresArray[1] = 0;
}