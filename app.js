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

let activePlayer = 0;
let currentScore = 0;
const scoresArray = [0, 0];


io.on('connection', (socket) => {

    //console.log(socket.id);

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

})
