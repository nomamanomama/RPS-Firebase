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

    // Add user to the connections list.
    var con = connectionsRef.push(true);

    // Remove user from the connection list when they disconnect.
    con.onDisconnect().remove();
  }
});

// When first loaded or when the connections list changes...
playersRef.on("value", function (snapshot) {
  if (snapshot.child('1').exists() && snapshot.child('2').exists()) {
    gameOpen = false;
    // //update local object player 1 values
    // p1.name = p1Data.name;
    // p1.wins = p1Data.wins;
    // p1.losses = p1Data.losses;
    // p1.choice = p1Data.choice;

    // //update local object player 2 values
    // p2.name = p2Data.name;
    // p2.wins = p2Data.wins;
    // p2.losses = p2Data.losses;
    // p2.choice = p2Data.choice;
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

var myPlayerIndex;

var turn = 0;

var gameOpen = true;

$(document).ready(function () {
  
  $("#player1-buttons").hide();
  $("#player2-buttons").hide();


  db.ref().on("value", function (snapshot){
    var data = snapshot.val();
    console.log(data);
    //if the database is not NULL
    if(data){
 
    }
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

      var player1Ref = db.ref('/players/1');
      var player2Ref = db.ref('/players/2');

      var player1exists = false;
      console.log(playerName + " signed in");
    if (gameOpen && playerName != "") {
      //if playersRef not null check to see if "1" exists
      //else check to see if "2" exists
      db.ref('/players').once("value")
        .then (function (snapshot) {
          console.log(snapshot.val());
          console.log(snapshot.child('1').exists());
          if (snapshot.child('1').exists()) {
            player2Ref.set({
              name: playerName,
              wins: 0,
              losses: 0,
              choice: ""
            },function (error){
              console.log("Error: " + error.code);
            });
            myPlayerIndex = 2;
            
          }
          else{
            player1Ref.set({
              name: playerName,
              wins: 0,
              losses: 0,
              choice: ""
            }, function (error) {
              console.log("Error: " + error.code);
            });
            myPlayerIndex = 1;
          }
          displayNewPlayerBox(false, "Welcome to the game " + playerName + "! You're Player " + myPlayerIndex);
        });

      }

  });

  db.ref('/players').on("value", function (snapshot) {
    //when a child is added update the player display
    //after both players exist, start the game
    console.log("players values changed");
    if (snapshot.child('1').exists() && snapshot.child('2').exists()){
      gameOpen = false;
      initGame();
    }

  });

  db.ref('/players/1/choice').on("value", function (snapshot) {
    //when a child is added update the player display
    //after both players exist, start the game
    console.log("players 1 made choice - move to player 2 choice");
    setCurrentPlayerDisplay(2);

  });

// $(document).on("close", function () {
//   database.ref().onDisconnect();
// }

  //function to remove a player by index from database
  function removePlayer(index) { 
    db.ref('players/' + index).remove()
      .then(function() {
        console.log("removed player " + index);
      })
      .catch(function (error) {
        console.log("remove player " + index + " failed: " + error.code);
      })
  }

  //create playerDisplay() function for Playerbox content
  function setCurrentPlayerDisplay(index) {

    if (myPlayerIndex === index)
    {
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

  }

  function newTurn() {
    turn++;
    db.ref('turn').set({
      turn: turn
    });
    //highlight player 1 box
  }

  function initGame() {
    //start a new turn
    newTurn();
    //display buttons for Player 1 to choose
    setCurrentPlayerDisplay(1);

  }

  //on $(#newPlayer) click, assign Player number and display welcome message
  $(".rpsButton").on("click", function () {
    db.ref('players/' + myPlayerIndex).update({
      choice: $(this).val()
    })
    //if I'm player 2, evaluate the choices for both players
    if (myPlayerIndex === 2)
      calculateResult();
    else if (myPlayerIndex === 1)
      setCurrentPlayerDisplay(2);  
  });

  function calculateResult() {
    //insert logic for RPS
    var winnerIndex;
    var ref = db.ref();
    ref.once("value")
      .then(function (snapshot) {
        var player1 = snapshot.child('players/1');
        var player2 = snapshot.child('players/2');
        //check for tie game
        if (player1.choice === player2.choice){
          $("#result").text("Tie!");
        }  
        //test for player 1 wins  
        else if(player1.choice === "rock" && player2.choice === "scissors"){
          winnerIndex = 1;  
          $("#result").text(player1.name + " Wins! Rock beats Scissors!");
        }
        else if (player1.choice === "scissors" && player2.choice === "paper"){
          winnerIndex = 1;
          $("#result").text(player1.name + " Wins! Scissors cut Paper!");      
        }
        else if (player1.choice === "paper" && player2.choice === "rock"){
          winnerIndex = 1;
          $("#result").text(player1.name + " Wins! Paper covers Rock!");
        }
        //test for player 2 wins
        else if (player1.choice === "paper" && player2.choice === "scissors"){
          winnerIndex = 2;
          $("#result").text(player2.name + " Wins! Scissors cut Paper!");
        }
        else if (player1.choice === "scissor" && player2.choice === "rock"){
          winnerIndex = 2;
          $("#result").text(player2.name + " Wins! Rock beats Scissors!");
        }
        else if (player1.choice === "rock" && player2.choice === "paper"){
          winnerIndex = 2;
          $("#result").text(player2.name + " Wins! Paper covers Rock!");
        }
      });
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