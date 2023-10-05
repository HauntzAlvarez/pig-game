'use strict';

// DOM Elements
const scoresEL = [document.querySelector('#score--0'), document.querySelector('#score--1')];
const currentScoresEL = [document.querySelector('#current--0'), document.querySelector('#current--1')];
const diceEl = document.querySelector('.dice');
const rollDiceBtn = document.querySelector('.btn.btn--roll');
const holdScoreBtn = document.querySelector('.btn.btn--hold');
const newGameBtn = document.querySelector('.btn.btn--new'); 

const playerOneButton = document.querySelector('#playerOneBtn'); 
const playerTwoButton = document.querySelector('#playerTwoBtn'); 

// Variables
//let activePlayer = 0;
//let currentScore = 0;
//const scoresArray = [0, 0];

var playerid = '';
var player = null;
//var player1 = '';
//var player2 = '';




const socket = io("http://localhost:3000");

//console.log(socket.io.socket.);
//console.log(playerTwoButton);

socket.on('getId', (messageId) => {
  console.log(messageId);
  playerid = messageId;
})

socket.on('enableSelection', ()=> {
  document.querySelector('#selection-overlay').style.display = 'flex';
  document.querySelector('#player-left-overlay').style.display = 'none';
  document.querySelector('#session-overlay').style.display = 'none';

  document.querySelector('.wait-player-label').style.display = 'none';
  document.querySelector('.selection-container').style.display = 'block';
})

socket.on('waitPlayer', () => {
  document.querySelector('#selection-overlay').style.display = 'flex';
  document.querySelector('#player-left-overlay').style.display = 'none';
  document.querySelector('#session-overlay').style.display = 'none';

  document.querySelector('.wait-player-label').style.display = 'block';
  document.querySelector('.selection-container').style.display = 'none';
})


//disable player button when selected
socket.on('playerRegister', (player, id) => {
  if(player == 0) {
    playerOneButton.disabled = true;
    document.getElementById("playerOneSpan").textContent = id;
  }
  if(player == 1) {
    playerTwoButton.disabled = true;
    document.getElementById("playerTwoSpan").textContent = id;
  }
})

//remove overlay and start game
socket.on('startGame', (turn) => {
  console.log("Start Game");
  document.querySelector('#selection-overlay').style.display = 'none';

  //disable buttons
  playerTurn(false);

  if(player == 0) {
    playerTurn(true);
  }
})

//show roll dice both sides
socket.on('showdice', (diceNumber) => {
  //console.log(diceNumber);
  diceEl.classList.remove('hidden');
  diceEl.src = `dice-${diceNumber}.png`;
});


//show current score 
socket.on('currentScore', (currentScore, activePlayer) => {
  currentScoresEL[activePlayer].textContent = currentScore;
})

//show player score
socket.on('playerScore', (playerScore, activePlayer) => {
  scoresEL[activePlayer].textContent = playerScore;
})

socket.on('endTurn', (activePlayer) => {
    if(activePlayer != player) {
      playerTurn(false);
    }
    else {
      playerTurn(true);
    }
    document.querySelectorAll('.player').forEach((player, index) => {
    player.classList.toggle('player--active', index === activePlayer);
  });
})

socket.on('connection', () => {
  console.log("Hi");
})

socket.on('clearPlayerSpan', () => {
  document.getElementById("playerOneSpan").textContent = 'Test player id';
  playerOneButton.disabled = false;
  document.getElementById("playerTwoSpan").textContent = 'Test player id';
  playerTwoButton.disabled = false;
})

socket.on('gameOnSession', () => {
  document.querySelector('#selection-overlay').style.display = 'none';
  document.querySelector('#player-left-overlay').style.display = 'none';
  document.querySelector('#session-overlay').style.display = 'flex';
})

socket.on('playerLeft', () => {
  document.querySelector('#selection-overlay').style.display = 'none';
  document.querySelector('#session-overlay').style.display = 'none';
  document.querySelector('#player-left-overlay').style.display = 'flex';
})

// Initialize pig game
scoresEL[0].textContent = 0;
scoresEL[1].textContent = 0;
diceEl.classList.add('hidden');

// Initialize Event handlers
//rollDiceBtn.addEventListener('click', rollDice);
//holdScoreBtn.addEventListener('click', holdScore);
newGameBtn.addEventListener('click', newGame); 

rollDiceBtn.addEventListener('click', () => {
  socket.emit('rollDice');
});

holdScoreBtn.addEventListener('click', () => {
  socket.emit('holdScore');
});

playerOneButton.addEventListener('click', () => {
  player = 0;
  document.getElementById("playerOneSpan").textContent = playerid;
  playerTwoButton.disabled = true;
  socket.emit('playerSelect', 0, playerid);
});

playerTwoButton.addEventListener('click', () => {
  player = 1;
  document.getElementById("playerTwoSpan").textContent = playerid;
  playerOneButton.disabled = true;
  socket.emit('playerSelect', 1, playerid);
});

// Functions
function playerTurn(turn) {
  if(turn) {
    rollDiceBtn.disabled = false;
    holdScoreBtn.disabled = false;
  }
  else {
    rollDiceBtn.disabled = true;
    holdScoreBtn.disabled = true;
  }
}

function rollDice() {
  const diceNumber = Math.floor(Math.random() * 6) + 1;
  showDice(diceNumber);

  if (diceNumber !== 1) {
    currentScore += diceNumber;
    currentScoresEL[activePlayer].textContent = currentScore;
  } else {
    switchActivePlayer();
  }
}

function showDice(number) {
  diceEl.classList.remove('hidden');
  diceEl.src = `dice-${number}.png`;
}

function switchActivePlayer() {
  currentScore = 0;
  currentScoresEL[activePlayer].textContent = currentScore;
  activePlayer = 1 - activePlayer; 
  document.querySelectorAll('.player').forEach((player, index) => {
    player.classList.toggle('player--active', index === activePlayer);
  });
}

function hideDice() {
  diceEl.classList.add('hidden');
}

function holdScore() {
  scoresArray[activePlayer] += currentScore;
  scoresEL[activePlayer].textContent = scoresArray[activePlayer];
  switchActivePlayer();
}

function newGame() {
    scoresArray[0] = 0;
    scoresArray[1] = 0;
    currentScore = 0;
    activePlayer = 0;
  
    // Reset the DOM to initial values
    scoresEL[0].textContent = 0;
    scoresEL[1].textContent = 0;
    currentScoresEL[0].textContent = 0;
    currentScoresEL[1].textContent = 0;
    diceEl.classList.add('hidden');
  
    document.querySelectorAll('.player').forEach((player, index) => {
      player.classList.remove('player--winner');
      player.classList.toggle('player--active', index === activePlayer);
    });
  }
  