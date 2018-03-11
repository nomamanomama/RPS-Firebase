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
var db = firebase.database();

// playersRef references a specific location in our database.
// All players will be stored in this directory.
var playersRef = db.ref("/players");
var chatRef = db.ref("/chat");
var connectionsRef = db.ref("/connections");
// '.info/connected' is a special location provided by Firebase that is updated
// every time the client's connection state changes.
// '.info/connected' is a boolean value, true if the client is connected and false if they are not.
var connectedRef = db.ref(".info/connected");

// When the client's connection state changes...
connectedRef.on("value", function (snapshot) {

  // If they are connected..
  if (snapshot.val()) {
    console.log ("connected status: " + snapshot.val());
    // Add user to the connections list.
    var con = connectionsRef.push(true);

    // Remove user from the connection list when they disconnect.
    con.onDisconnect().remove();
      
  }
  
});

playersRef.on("value", function (snapshot) {
  if(snapshot.val()){
    //player value changed
    console.log("players values changed");
    var numPlayers = snapshot.numChildren();
    console.log(numPlayers);
    var player1connected = snapshot.child('1').exists();
    var player2connected = snapshot.child('2').exists();
    //after both players exist, close the game to new players
    if (player1connected && player2connected) {
      gameInSession = true;
      updateLocalPlayer(1, snapshot.child('1').val());
      updateLocalPlayer(2, snapshot.child('2').val());
    } 
    else{
      gameInSession = false;
      endRound();
      setCurrentPlayerDisplay(0);
      displayResult("");    
    }
  }
});

// -------------------------------------------------------------- (CRITICAL - BLOCK) 

//initial values
var p1 = {
  choice: "",
  name: "",
  wins: 0,
  losses: 0,
}

var p2 = {
  choice: "",
  name: "",
  wins: 0,
  losses: 0,
}

var players = [p1, p2];
var myPlayerIndex;
var turn = 0;
var gameInSession = false;

function updateLocalPlayer(index, player) {
  players[index - 1].wins = player.wins;
  players[index - 1].losses = player.losses;
  players[index - 1].name = player.name;
  players[index - 1].choice = player.choice;
}

function startNewRound() {
  turn = 1;
  db.ref('turn').set({ turn: turn });
  //highlight player 1 box
}

function nextTurn() {
  turn = 2;
  db.ref('turn').set({ turn: turn });
  //highlight player 2 box
}

function endRound() {
  turn = 0;
  db.ref('turn').set({ turn: turn });
  //display Results
}

//create playerDisplay() function for Playerbox content
function setCurrentPlayerDisplay(index) {

  if (myPlayerIndex === index) {
    //set current player name
    $("#player" + index + "-name").show();
    //show 3 buttons for: Rock, Paper and Scissors
    $("#player" + index + "-buttons").show();
  }
  else {
    $("#player" + myPlayerIndex).removeClass("active");
    //hide 3 buttons for: Rock, Paper and Scissors
    $("#player" + myPlayerIndex + "-buttons").hide();
  }

  $("#player" + index).addClass("active");
  displayResult("May the best player win.");

}

function isMyTurn() {
  return (myPlayerIndex === turn);
}

function calculateResult() {
  //insert logic for RPS
  var winnerIndex;
  var ref = db.ref();
  playersRef.once("value")
    .then(function (snapshot) {
      var player1 = snapshot.child('1').val();
      var player2 = snapshot.child('2').val();
      var message;
      //check for tie game
      if (player1.choice === player2.choice) {
        message = "Tie!"
      }
      //test for player 1 wins  
      else if (player1.choice === "rock" && player2.choice === "scissors") {
        winnerIndex = 1;
        message = player1.name + " Wins! Rock beats Scissors!";
      }
      else if (player1.choice === "scissors" && player2.choice === "paper") {
        winnerIndex = 1;
        message = player1.name + " Wins! Scissors cut Paper!";
      }
      else if (player1.choice === "paper" && player2.choice === "rock") {
        winnerIndex = 1;
        message = player1.name + " Wins! Paper covers Rock!";
      }
      //test for player 2 wins
      else if (player1.choice === "paper" && player2.choice === "scissors") {
        winnerIndex = 2;
        message = player2.name + " Wins! Scissors cut Paper!";
      }
      else if (player1.choice === "scissors" && player2.choice === "rock") {
        winnerIndex = 2;
        message = player2.name + " Wins! Rock beats Scissors!";
      }
      else if (player1.choice === "rock" && player2.choice === "paper") {
        winnerIndex = 2;
        message = player2.name + " Wins! Paper covers Rock!";
      }

      updatePlayerRecord(winnerIndex);
      displayResult(message);

    });
}

function updatePlayerRecord(winner) {
  if (winner === 1) {
    players[0].wins++;
    players[1].losses++;
  }
  else if (winner === 2) {
    players[0].losses++;
    players[1].wins++;
  }

  playersRef.update({ 1: p1, 2: p2 });

}

function displayResult(message) {
  $("#result").text(message);
}

$(document).ready(function () {

  $("#player1-buttons").hide();
  $("#player2-buttons").hide();

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

    var player1Ref = db.ref('/players/1');
    var player2Ref = db.ref('/players/2');

    var player1exists = false;
    console.log(playerName + " signed in");
    //if we don't have a game in session and player entered a name
    if (!gameInSession && playerName != "") {
      //get a snapshot of the playersRef
      playersRef.once("value")
        .then(function (snapshot) {
          console.log(snapshot.val());
          console.log(snapshot.child('1').exists());
          //if "1" exists, make this player 2
          if (snapshot.child('1').exists()) {
            player2Ref.set({
              name: playerName,
              wins: 0,
              losses: 0,
              choice: ""
            }, function (error) {
              console.log("Error: " + error);
            });
            myPlayerIndex = 2;
          }
          else {//else, make this player 1
            player1Ref.set({
              name: playerName,
              wins: 0,
              losses: 0,
              choice: ""
            }, function (error) {
              console.log("Error: " + error);
            });
            myPlayerIndex = 1;
          }
          //remove from db on disconnect
          var playerChild = playersRef.child(myPlayerIndex.toString());
         playerChild.onDisconnect().remove();
          
          //Welcome user
          var displayMessage = "Welcome to the game " + playerName + "! You're Player " + myPlayerIndex;
          
          displayNewPlayerBox(false, displayMessage);
          //get another snapshot of db to get player count
          playersRef.once("value")
            .then(function (snapshot) {
              console.log("player added. num children now: " + snapshot.numChildren());
              //if we have 2 players, flip the gamesession flag to true
              if (snapshot.numChildren() === 2){
                gameInSession = true;
                //start a new round using the turn flag in db
                startNewRound();
              }
            });

          displayNewPlayerBox(false, displayMessage);
        });

    }

    if (myPlayerIndex !== undefined) {
      var displayMessage = "Good Luck!";
      if (numPlayers === 1)
        displayMessage = "Waiting on another player.";

      displayNewPlayerBox(false, displayMessage);
    }

  });

  db.ref('turn').on("value", function (snapshot) {
    //get player choice info
    if(snapshot.child('turn').exists() && gameInSession){
      console.log("turn: " + snapshot.val().turn);
      turn = snapshot.val().turn;
      if (turn === 0) { //display results
        calculateResult();
        setTimeout(startNewRound, 1000);
      } 
      else {
        //changed turns
        setCurrentPlayerDisplay(turn);
      }
    }
  });

   //on $(#newPlayer) click, assign Player number and display welcome message
  $(".rpsButton").on("click", function () {
    db.ref('players/' + myPlayerIndex).update({
      choice: $(this).val()
    })
    //if I'm player 2, evaluate the choices for both players
    if (myPlayerIndex === 2)
      endRound();
    else if (myPlayerIndex === 1)
      nextTurn();
  });

  




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