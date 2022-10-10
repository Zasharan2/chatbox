// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.4/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.8.4/firebase-auth.js";
import { getDatabase, ref, set, onDisconnect, onValue, onChildAdded, onChildRemoved, get, child } from "https://www.gstatic.com/firebasejs/9.8.4/firebase-database.js";

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

var cont = document.getElementById("pagecontainer");

var crbform = document.getElementById("createroombuttonform");
crbform.addEventListener("submit", (e) => {
    e.preventDefault();
    e.stopImmediatePropagation();

    loadcreateroom();
//    loadchatroom(Date.now());

    crbform.reset();
});

var jrbform = document.getElementById("joinroombuttonform");
jrbform.addEventListener("submit", (e) => {
    e.preventDefault();
    e.stopImmediatePropagation();

    loadjoinroom();

    jrbform.reset();
});

var crform;

function loadcreateroom() {
    cont.innerHTML = '<form id = "createroomform"><input type = "text", id = "roomnameinput", name = "roomnameinput", placeholder = "Room code", required, autocomplete = "off", size = "30px"/><input type = "submit", id = "cr", name = "button", value = "Create Room", required/></form>'

    crform = document.getElementById("createroomform");
    crform.addEventListener("submit", (e) => {
        var joinCode = sanitise(String(document.forms["createroomform"]["roomnameinput"].value));
        if ((joinCode.length > 0)) {
            e.preventDefault();
            e.stopImmediatePropagation();
            get(child(ref(database), `chats/${joinCode}`)).then((snapshot) => {
                if (!snapshot.exists()) {
                    e.preventDefault();
                    e.stopImmediatePropagation();

                    loadchatroom(joinCode);
        
                    crform.reset();
                }
            });
            crform.reset();
        }
    });
}

var jrform;

function loadjoinroom() {
    cont.innerHTML = '<form id = "joinroomform"><input type = "text", id = "roomnameinput", name = "roomnameinput", placeholder = "Room code", required, autocomplete = "off", size = "30px"/><input type = "submit", id = "cr", name = "button", value = "Join Room", required/></form>'

    jrform = document.getElementById("joinroomform");
    jrform.addEventListener("submit", (e) => {
        var joinCode = sanitise(String(document.forms["joinroomform"]["roomnameinput"].value));
        if ((joinCode.length > 0)) {
            e.preventDefault();
            e.stopImmediatePropagation();
            get(child(ref(database), `chats/${joinCode}`)).then((snapshot) => {
                if (snapshot.exists()) {
                    e.preventDefault();
                    e.stopImmediatePropagation();

                    loadchatroom(joinCode);
        
                    jrform.reset();
                }
            });
            jrform.reset();
        }
    });
}

var nd;
var cd;
var chat;
var smf;
var nick = "Anonymous User";
var send;
var chatRef;
var today;
var options;
var smform;
var ncform;
var ccform;
var logform;
var logtext;
var logdownloadelement;
var toreplace;
var colour = "ffffff";
var focused = true;
var icon = document.getElementById("icon");
var title = document.getElementById("title");

function loadchatroom(chatName) {
    cont.innerHTML = '<p id = "chat"><b>Please note that you will not be able to see messages sent before the tab was opened. It is recommended to keep this tab running in the background, if you do not wish to miss out.</b></p><form id = "sendmessageform"><input type = "text", id = "sendmessage", name = "sendmessage", placeholder = "Message here...", required, autocomplete = "off"><input type = "submit", id = "smbutton", name = "button", value = "Send Message", required></form><form id = "changenickform"><input type = "text", id = "changenick", name = "changenick", placeholder = "Set nickname...", required, autocomplete = "off"><input type = "submit", id = "cnbutton", name = "button", value = "Set Nickname", required></form><form id = "changecolourform"><input type = "text", id = "changecolour", name = "changecolour", placeholder = "Set colour (hex)...", required, autocomplete = "off"><input type = "submit", id = "ccbutton", name = "button", value = "Set Colour", required></form><p id = "nickdisplay">Current Nickname: <span style = "color: #' + colour + '"><b>' + nick + '</b></span></p><p id = "codedisplay"></p><form id = "logbuttonform"><input type = "submit", id = "logbutton", name = "button", value = "Download log", required></form>';

    title.innerHTML = chatName;

    nd = document.getElementById("nickdisplay");
    cd = document.getElementById("codedisplay");
    chat = document.getElementById("chat");
    
    smform = document.getElementById("sendmessageform");
    smform.addEventListener("submit", (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();
        smf = linkify(sanitise(String(document.forms["sendmessageform"]["sendmessage"].value)));
        today  = new Date();
        options = { weekday: undefined, year: 'numeric', month: 'numeric', day: 'numeric', hour: "numeric", minute: "numeric", second: "numeric" };
        send = today.toLocaleDateString("en-US", options) + ' <span style = "color: #' + colour + '"><b>' + nick + ':</b></span> ' + smf;
        set(chatRef, {
            recentMessage: send
        });
        smform.reset();
    });

    ncform = document.getElementById("changenickform");
    ncform.addEventListener("submit", (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();
        nick = sanitise(String(document.forms["changenickform"]["changenick"].value));
        localStorage.setItem("nicknamepreference", nick);
        nd.innerHTML = 'Current Nickname: <span style = "color: #' + colour + '"><b>' + nick + '</b></span>';
        ncform.reset();
    });

    ccform = document.getElementById("changecolourform");
    ccform.addEventListener("submit", (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();
        colour = sanitise(String(document.forms["changecolourform"]["changecolour"].value));
        localStorage.setItem("colourpreference", colour);
        nd.innerHTML = 'Current Nickname: <span style = "color: #' + colour + '"><b>' + nick + '</b></span>';
        ccform.reset();
    });

    logform = document.getElementById("logbuttonform");
    logform.addEventListener("submit", (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();
        logdownloadelement = document.createElement("a");
        logtext = chat.innerHTML.replace("<b>Please note that you will not be able to see messages sent before the tab was opened. It is recommended to keep this tab running in the background, if you do not wish to miss out.</b>","").replace(/<br>/g,"\n");
        while (!(logtext.indexOf("<") == -1 && logtext.indexOf(">") == -1)) {
            console.log("loop moment");
            console.log(logtext);
            toreplace = "";
            if ((logtext.indexOf('<img src="') != -1) && (logtext.indexOf('<img src="') == logtext.indexOf("<"))) {
                toreplace = logtext.substring(logtext.indexOf('<img src="') + 10, logtext.indexOf('">'));
            }
            logtext = logtext.replace(logtext.substring(logtext.indexOf("<"), logtext.indexOf(">") + 1), toreplace);
        }
        console.log("hwere");
        logtext = logtext.slice(2);
        logtext = logtext.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'");
        logdownloadelement.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(logtext));
        logdownloadelement.setAttribute("download", "log.txt");
        logdownloadelement.style.display = "none";
        document.body.appendChild(logdownloadelement);
        logdownloadelement.click();
        document.body.removeChild(logdownloadelement);
        logform.reset();
    });

    cd.innerHTML = "Room code: <b>" + chatName + "</b>";

    init(chatName);
}

if (!(localStorage.getItem("nicknamepreference") == null)) {
    nick = localStorage.getItem("nicknamepreference");
}

if (!(localStorage.getItem("colourpreference") == null)) {
    colour = localStorage.getItem("colourpreference");
}

function init(chatName) {
    
    onAuthStateChanged(auth, (user) => {
        if (user) {

            chatRef = ref(database, `chats/${chatName}`);

            // callback will occur whenever player ref changes
            onValue(chatRef, (snapshot) => {
                for (var key in (snapshot.val() || {})) {
                    chat.innerHTML += "<br></br>" + snapshot.val()[key];
                    if (!focused) {
                        icon.href = "kijetesantakalu_notif.png";
                    }
                    document.getElementById("sendmessage").scrollIntoView();
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

var tcss = document.getElementById("themecss");
var tsform = document.getElementById("themeselectform");
var ts = document.getElementById("themeselect");
tsform.addEventListener("submit", (e) => {
    e.preventDefault();
    e.stopImmediatePropagation();

    if (ts.options[ts.selectedIndex].text == "Light Mode") {
        tcss.href = "theme_light.css";
        localStorage.setItem("themepreference", "Light Mode");
    } else if (ts.options[ts.selectedIndex].text == "Dark Mode") {
        tcss.href = "theme_dark.css";
        localStorage.setItem("themepreference", "Dark Mode");
    }
});

if (!(localStorage.getItem("themepreference") == null)) {
    if (localStorage.getItem("themepreference") == "Light Mode") {
        tcss.href = "theme_light.css";
        ts.value = "1";
    } else if (localStorage.getItem("themepreference") == "Dark Mode") {
        tcss.href = "theme_dark.css";
        ts.value = "0";
    }
}

var fcss = document.getElementById("fontcss");
var fsform = document.getElementById("fontselectform");
var fs = document.getElementById("fontselect");
fsform.addEventListener("submit", (e) => {
    e.preventDefault();
    e.stopImmediatePropagation();

    switch(fs.options[fs.selectedIndex].text) {
        case "Arial": {
            fcss.href = "font_arial.css";
            localStorage.setItem("fontpreference", "Arial");
            break;
        }
        case "Times New Roman": {
            fcss.href = "font_tnr.css";
            localStorage.setItem("fontpreference", "Times New Roman");
            break;
        }
        case "Comic Sans MS": {
            fcss.href = "font_csms.css";
            localStorage.setItem("fontpreference", "Comic Sans MS");
            break;
        }
        case "Comfortaa": {
            fcss.href = "font_comf.css";
            localStorage.setItem("fontpreference", "Comfortaa");
            break;
        }
        case "Calibri": {
            fcss.href = "font_clb.css";
            localStorage.setItem("fontpreference", "Calibri");
            break;
        }
        case "Wire One": {
            fcss.href = "font_wo.css";
            localStorage.setItem("fontpreference", "Wire One");
            break;
        }
        default: {
            break;
        }
    }
});

if (!(localStorage.getItem("fontpreference") == null)) {
    switch(localStorage.getItem("fontpreference")) {
        case "Arial": {
            fcss.href = "font_arial.css";
            fs.value = "0";
            break;
        }
        case "Times New Roman": {
            fcss.href = "font_tnr.css";
            fs.value = "1";
            break;
        }
        case "Comic Sans MS": {
            fcss.href = "font_csms.css";
            fs.value = "2";
            break;
        }
        case "Comfortaa": {
            fcss.href = "font_comf.css";
            fs.value = "3";
            break;
        }
        case "Calibri": {
            fcss.href = "font_clb.css";
            fs.value = "4";
            break;
        }
        case "Wire One": {
            fcss.href = "font_wo.css";
            fs.value = "5";
            break;
        }
        default: {
            break;
        }
    }
}

window.onfocus = function () {
    focused = true;
    setkijetesantakalu();
};

window.onblur = function () {
    focused = false;
};

function setkijetesantakalu() {
    icon.href = "kijetesantakalu_black.png";
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        icon.href = "kijetesantakalu_white.png";
    }
}

function sanitise(dirty) {
    return dirty.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function linkify(text) {
    var urlRegex =/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    return text.replace(urlRegex, function(url) {
        if (url.match(/\.(jpeg|jpg|svg|webp|tif|heic|gif|png)$/) == null) {
            return '<a style = "color: #0066cc;", href ="' + url + '">' + url + '</a>';
        } else {
            return '<img src="' + url + '">';
        }
    });
}

setkijetesantakalu();