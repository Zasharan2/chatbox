// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.4/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.8.4/firebase-auth.js";
import { getDatabase, ref, set, onDisconnect, onValue, onChildAdded, onChildRemoved } from "https://www.gstatic.com/firebasejs/9.8.4/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDm-Je7iI-Nh1wtNaR3UwyzMR1LgciRZbU",
    authDomain: "chat-a10b9.firebaseapp.com",
    databaseURL: "https://chat-a10b9-default-rtdb.firebaseio.com",
    projectId: "chat-a10b9",
    storageBucket: "chat-a10b9.appspot.com",
    messagingSenderId: "1032811906518",
    appId: "1:1032811906518:web:1df866ea269fbf6ecb9077"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Initialize Realtime Database and get a reference to the service
const database = getDatabase(app);

var nd = document.getElementById("nickdisplay");
var pc = document.getElementById("prevChat");
var smf;
var nick = "Anonymous User";
var send;
var chatRef;

window.messageSent = function messageSent() {
    smf = String(document.forms["sendmessageform"]["sendmessage"].value);
    send = "<b>" + nick + ":</b> " + smf;
    set(chatRef, {
        recentMessage: send
    });
    document.getElementById("sendmessageform").reset();
}

window.nickChanged = function nickChanged() {
    nick = String(document.forms["changenickform"]["changenick"].value);
    nd.innerHTML = "Current Nickname: <b>" + nick + "</b>";
}

function init() {
    
    onAuthStateChanged(auth, (user) => {
        if (user) {

            chatRef = ref(database, `recentMessage`);

            // callback will occur whenever player ref changes
            onValue(chatRef, (snapshot) => {
                for (var key in (snapshot.val() || {})) {
                    pc.innerHTML += "<br></br>" + snapshot.val()[key];
                }
                // for (var key in (snapshot.val() || {})) {
                //     gamePlayers[key].name = snapshot.val()[key].name;
                //     gamePlayers[key].x = snapshot.val()[key].x;
                //     gamePlayers[key].y = snapshot.val()[key].y;
                // }
            });
        
            // callback will occur whenever (relative to the client) a new player joins
            // (this means even if people were playing before a new client joins, to the client the other people will have just joined and this function will fire for all of them)
            onChildAdded(chatRef, (snapshot) => {
                // var addedPlayer = snapshot.val();
        
                // if (addedPlayer.id === playerID) {
                //     gamePlayer = new Player(addedPlayer.name, addedPlayer.x, addedPlayer.y, true);
                //     gamePlayers[addedPlayer.id] = gamePlayer;
                // } else {
                //     var p = new Player(addedPlayer.name, addedPlayer.x, addedPlayer.y, false);
                //     gamePlayers[addedPlayer.id] = p;
                // }
            });
        
            onChildRemoved(chatRef, (snapshot) => {
                // delete(gamePlayers[snapshot.val().id]);
            })
        } else {
            // logged out
        }
    });

    signInAnonymously(auth).catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        
        console.log(errorCode, errorMessage);
    });
}

init()