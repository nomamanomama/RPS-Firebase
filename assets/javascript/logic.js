// Initialize Firebase
var config = {
    apiKey: "AIzaSyAnsYirQz49BPtXfKAzdDER4n0T4dtTE8s",
    authDomain: "rps-multi-player-f545c.firebaseapp.com",
    databaseURL: "https://rps-multi-player-f545c.firebaseio.com",
    projectId: "rps-multi-player-f545c",
    storageBucket: "",
    messagingSenderId: "882906915418"
  };
  firebase.initializeApp(config);

// database
var database = firebase.database(); 

//initial values
var player1 = {
  choice: "",
  name: "",
  wins: 0,
  losses: 0,
}

var player2 = {
  choice: "",
  name: "",
  wins: 0,
  losses: 0,
}

var playerIndex;

var turn = 0;

var gameOpen = true;

$(document).ready(function () {
  
$("#player1-buttons").hide();
$("#player2-buttons").hide();


database.ref().on("value", function (snapshot){
  if(snapshot.child("1").exists() && snapshot.child("2").exists())
    gameOpen = false;
});

//function to display Player input field or playermessage
function displayNewPlayerBox(show, message) {
  if (show) {
    $("#newPlayerBox").show();
    $("#playerMessage").hide();
  }
  else {
    $("#newPlayerBox").hide();
    $("#playerMessage").show();
    $("#playerMessage").text(message);
  }
} 

//on $(#newPlayer) click, assign Player number and display welcome message
$("#newPlayer").on("click", function () {
    var playerName = $("#newPlayerName").val().trim();
    console.log(playerName + " signed in");
  if (gameOpen && playerName != "") {
    //if Player 1 exists, this is player 2
    var ref = firebase.database().ref();
    ref.once("value")
      .then(function (snapshot) 
      {
        if (snapshot.child('players').exists()) {
          database.ref('players/' + '2').set({
            name: playerName,
            wins: 0,
            losses: 0,
            choice: ""
          });
          playerIndex = 2;
        }
        else {
          //else this is player 1
          database.ref('players/' + '1').set({
            name: playerName,
            wins: 0,
            losses: 0,
            choice: ""
          });
          playerIndex = 1;
        }
      });
  }
  displayNewPlayerBox(false, "Welcome to the game " + playerName + "!");

});

database.ref('players').on("value", function (snapshot) {
  //when a child is added update the player display
  //after both players exist, start the game
  var ref = firebase.database().ref();
  ref.once("value")
    .then(function (snapshot) {
       if (snapshot.child("1").exists() && snapshot.child("2").exists()) {
        gameOpen = false;
        initGame();
       }
    });
});

// $(document).on("close", function () {
//   database.ref().onDisconnect();
// }

//function to remove a player by index from database
function removePlayer(index) { 
  database.ref('players/' + index).remove()
    .then(function() {
      console.log("removed player " + index);
    })
    .catch(function (error) {
      console.log("remove player " + index + " failed: " + error.message);
    })
}

//create playerDisplay() function for Playerbox content
function setPlayerDisplay(index) {
  //set current player name
  $("#player" + index + "-name").show();
  //show 3 buttons for: Rock, Paper and Scissors
  $("#player" + index + "-buttons").show();
}


function newTurn() {
  turn++;
  database.ref().set({
    turn: turn
  });
  //highlight player 1 box
}

function initGame() {
  //start a new turn
  newTurn();
  //display buttons for Player 1 to choose
  setPlayerDisplay(1);

}

database.ref('players/1').on("value", function (snapshot) {
  player1.name = snapshot.val().name;
  player1.wins = snapshot.val().wins;
  player1.losses = snapshot.val().losses;
  player1.choice = snapshot.val().choice;
});
database.ref('players/2').on("value", function (snapshot) {
  player2.name = snapshot.val().name;
  player2.wins = snapshot.val().wins;
  player2.losses = snapshot.val().losses;
  player2.choice = snapshot.val().choice;
  calculateResult();
});

//on $(#newPlayer) click, assign Player number and display welcome message
$(".rpsButton").on("click", function () {
  database.ref('players/' + playerIndex).set({
    choice: $(this).val()
  })
});

function calculateResult() {
  //insert logic for RPS
}

//handler function for Rock, Paper, Scissor button
//player1 select first
//set player2 active after player 1 selects
//player2 select
//on player2 selection, compare player choices
//display results in resultbox
//increment win/loss count for player1
//increment win/loss count for player2

//handle chatEnter

  
});