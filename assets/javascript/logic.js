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

//   var starCountRef = firebase.database().ref('posts/' + postId + '/starCount');
//   starCountRef.on('value', function(snapshot) {
//     updateStarCount(postElement, snapshot.val());
//   });

// var userId = firebase.auth().currentUser.uid;
// return firebase.database().ref('/users/' + userId).once('value').then(function(snapshot) {
//   var username = (snapshot.val() && snapshot.val().username) || 'Anonymous';
//   // ...
// });
// firebase.database().ref().update(updates);