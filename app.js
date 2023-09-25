'use strict';

// DOM Elements
const scoresEL = [document.querySelector('#score--0'), document.querySelector('#score--1')];
const currentScoresEL = [document.querySelector('#current--0'), document.querySelector('#current--1')];
const diceEl = document.querySelector('.dice');
const rollDiceBtn = document.querySelector('.btn.btn--roll');
const holdScoreBtn = document.querySelector('.btn.btn--hold');
const newGameBtn = document.querySelector('.btn.btn--new'); 

// Variables
let activePlayer = 0;
let currentScore = 0;
const scoresArray = [0, 0];

// Initialize pig game
scoresEL[0].textContent = 0;
scoresEL[1].textContent = 0;
diceEl.classList.add('hidden');

// Initialize Event handlers
rollDiceBtn.addEventListener('click', rollDice);
holdScoreBtn.addEventListener('click', holdScore);
newGameBtn.addEventListener('click', newGame); 

// Functions
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
  