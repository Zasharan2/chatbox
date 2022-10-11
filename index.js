// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.4/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.8.4/firebase-auth.js";
import { getDatabase, ref, set, onDisconnect, onValue, onChildAdded, onChildRemoved, get, child, update, remove } from "https://www.gstatic.com/firebasejs/9.8.4/firebase-database.js";

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
var ownerpass = null;

function loadcreateroom() {
    cont.innerHTML = '<form id = "createroomform"><input type = "text", id = "roomnameinput", name = "roomnameinput", placeholder = "Room code", required, autocomplete = "off", size = "30px"/><input type = "text", id = "roomnamepass", name = "roomnamepass", placeholder = "Owner password", required, autocomplete = "off", size = "30px"/><input type = "submit", id = "cr", name = "button", value = "Create Room", required/></form>'

    crform = document.getElementById("createroomform");
    crform.addEventListener("submit", (e) => {
        var joinCode = sanitise(String(document.forms["createroomform"]["roomnameinput"].value));
        ownerpass = sanitise(String(document.forms["createroomform"]["roomnamepass"].value));
        if ((joinCode.length > 0) && (ownerpass.length > 0)) {
            e.preventDefault();
            e.stopImmediatePropagation();
            get(child(ref(database), `chats/${joinCode}`)).then((snapshot) => {
                if (!snapshot.exists()) {
                    e.preventDefault();
                    e.stopImmediatePropagation();

                    loadchatroom(joinCode, 1);
        
                    crform.reset();
                }
            });
            crform.reset();
        }
    });
}

var jrform;

function loadjoinroom() {
    cont.innerHTML = '<form id = "joinroomform"><input type = "text", id = "roomnameinput", name = "roomnameinput", placeholder = "Room code", required, autocomplete = "off", size = "30px"/><input type = "text", id = "roomnamepass", name = "roomnamepass", placeholder = "Owner password (optional)", required, autocomplete = "off", size = "30px"/><input type = "submit", id = "cr", name = "button", value = "Join Room", required/></form>'

    jrform = document.getElementById("joinroomform");
    jrform.addEventListener("submit", (e) => {
        var joinCode = sanitise(String(document.forms["joinroomform"]["roomnameinput"].value));
        var potentialOwnerpassconsole = sanitise(String(document.forms["joinroomform"]["roomnamepass"].value));
        if ((joinCode.length > 0)) {
            e.preventDefault();
            e.stopImmediatePropagation();
            get(child(ref(database), `chats/${joinCode}`)).then((snapshot) => {
                if (snapshot.exists()) {
                    if (potentialOwnerpassconsole == snapshot.val()["ownerPass"]) {
                        ownerpass = potentialOwnerpassconsole;
                    }
                    loadchatroom(joinCode, 0);
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
var chatValid;
var today;
var lastmessagesenttime = new Date();
var options;
var smform;
var smerror;
var ncform;
var ccform;
var ccdform;
var dform;
var logform;
var logtext;
var logdownloadelement;
var toreplace;
var colour = "ffffff";
var focused = true;
var icon = document.getElementById("icon");
var title = document.getElementById("title");

function loadchatroom(chatName, createorjoin) {
    chatValid = true;

    // set chat contents
    if (ownerpass == null) {
        cont.innerHTML = '<b>Please note that you will not be able to see messages sent before the tab was opened. It is therefore recommended to keep this tab running in the background.</b><p id = "chat"></p><form id = "sendmessageform"><input type = "text", id = "sendmessage", name = "sendmessage", placeholder = "Message here...", required, autocomplete = "off"><input type = "submit", id = "smbutton", name = "button", value = "Send Message", required> <span style = "color: #ff0000", id = "smerror"></span></form><form id = "changenickform"><input type = "text", id = "changenick", name = "changenick", placeholder = "Set nickname...", required, autocomplete = "off"><input type = "submit", id = "cnbutton", name = "button", value = "Set Nickname", required></form><form id = "changecolourform"><input type = "text", id = "changecolour", name = "changecolour", placeholder = "Set colour (hex)...", required, autocomplete = "off"><input type = "submit", id = "ccbutton", name = "button", value = "Set Colour", required></form><p id = "nickdisplay">Current Nickname: <span style = "color: #' + colour + '"><b>' + nick + '</b></span></p><p id = "codedisplay"></p><form id = "logbuttonform"><input type = "submit", id = "logbutton", name = "button", value = "Download log", required></form>';
    } else {
        cont.innerHTML = '<b>Please note that you will not be able to see messages sent before the tab was opened. It is therefore recommended to keep this tab running in the background.</b><p id = "chat"></p><form id = "sendmessageform"><input type = "text", id = "sendmessage", name = "sendmessage", placeholder = "Message here...", required, autocomplete = "off"><input type = "submit", id = "smbutton", name = "button", value = "Send Message", required> <span style = "color: #ff0000", id = "smerror"></span></form><form id = "changenickform"><input type = "text", id = "changenick", name = "changenick", placeholder = "Set nickname...", required, autocomplete = "off"><input type = "submit", id = "cnbutton", name = "button", value = "Set Nickname", required></form><form id = "changecolourform"><input type = "text", id = "changecolour", name = "changecolour", placeholder = "Set colour (hex)...", required, autocomplete = "off"><input type = "submit", id = "ccbutton", name = "button", value = "Set Colour", required></form><p id = "nickdisplay">Current Nickname: <span style = "color: #' + colour + '"><b>' + nick + '</b></span></p><p id = "codedisplay"></p><form id = "changecodeform"><input type = "text", id = "changecode", name = "changecode", placeholder = "Set new code", required, autocomplete = "off"><input type = "submit", id = "ccdbutton", name = "button", value = "Change code (members need new code)", required></form><br><form id = "logbuttonform"><input type = "submit", id = "logbutton", name = "button", value = "Download log", required></form><br><form id = "delbuttonform"><input type = "submit", id = "delbutton", name = "button", value = "Delete Chatroom", style = "color: #ff0000", required></form>';
    }

    // set title to chat name
    title.innerHTML = chatName;

    nd = document.getElementById("nickdisplay");
    cd = document.getElementById("codedisplay");
    smerror = document.getElementById("smerror");
    chat = document.getElementById("chat");
    
    // send message handling
    smform = document.getElementById("sendmessageform");
    smform.addEventListener("submit", (e) => {
        // prevents page from reloading
        e.preventDefault();

        // prevents double submissions from one click
        e.stopImmediatePropagation();

        // get value submitted, sanitise and linkify it
        smf = linkify(sanitise(String(document.forms["sendmessageform"]["sendmessage"].value)));

        // get date to append to text
        today = new Date();
        options = { weekday: undefined, year: 'numeric', month: 'numeric', day: 'numeric', hour: "numeric", minute: "numeric", second: "numeric" };

        // check the user hasn't sent anything within the second (if so they are likely spamming)
        if (today.toLocaleDateString("en-US", options) != lastmessagesenttime.toLocaleDateString("en-US", options)) {
            lastmessagesenttime = today;

            // cap message length limit (unless it is a link or image)
            if ((smf.includes("<img") || smf.includes("<a")) || (smf.length < 401)) {
                if (chatValid == true) {
                    // format and send the message
                    send = today.toLocaleDateString("en-US", options) + ' <span style = "color: #' + colour + '"><b>' + nick + ':</b></span> ' + smf;
                    update(chatRef, {
                        recentMessage: send
                    });
                    
                    // clear error display
                    smerror.innerHTML = "";
                    
                    // clear input field
                    smform.reset();
                } else {
                    // display room not found error
                    smerror.innerHTML = "Error: The room you are trying to talk in no longer exists. This could be due to a code change or full deletion of the room."
                }
            } else {
                // display character limit error
                smerror.innerHTML = "Error: The message you have tried to send is " + String(smf.length - 400) + " characters over the character limit (400)."
                // unitary case
                if (smf.length - 400 == 1) {
                    smerror.innerHTML = "Error: The message you have tried to send is " + String(smf.length - 400) + " character over the character limit (400)."
                }
            }

        }
    });

    // nickname form handling
    ncform = document.getElementById("changenickform");
    ncform.addEventListener("submit", (e) => {
        // prevents page from reloading
        e.preventDefault();

        // prevents double submissions from one click
        e.stopImmediatePropagation();

        // get value submitted, sanitise it
        nick = sanitise(String(document.forms["changenickform"]["changenick"].value));

        if (nick.length > 40) {
            nick = nick.substring(0, 40);
        }

        // set client variable
        localStorage.setItem("nicknamepreference", nick);

        // display nickname
        nd.innerHTML = 'Current Nickname: <span style = "color: #' + colour + '"><b>' + nick + '</b></span>';

        // clear input field
        ncform.reset();
    });

    // colour change form handling
    ccform = document.getElementById("changecolourform");
    ccform.addEventListener("submit", (e) => {
        // prevents page from reloading
        e.preventDefault();

        // prevents double submissions from one click
        e.stopImmediatePropagation();

        // get value submitted, sanitise it
        colour = sanitise(String(document.forms["changecolourform"]["changecolour"].value));

        // set client variable
        localStorage.setItem("colourpreference", colour);

        // display colour
        nd.innerHTML = 'Current Nickname: <span style = "color: #' + colour + '"><b>' + nick + '</b></span>';

        // clear input field
        ccform.reset();
    });

    if (ownerpass != null) {
        // code change form handling
        ccdform = document.getElementById("changecodeform");
        ccdform.addEventListener("submit", (e) => {
            // prevents page from reloading
            e.preventDefault();

            // prevents double submissions from one click
            e.stopImmediatePropagation();

            var newCode = sanitise(String(document.forms["changecodeform"]["changecode"].value));

            remove(chatRef);
            
            loadchatroom(newCode, 1);

            // clear input field
            ccdform.reset();
        });

        // code change form handling
        dform = document.getElementById("delbuttonform");
        dform.addEventListener("submit", (e) => {
            // prevents double submissions from one click
            e.stopImmediatePropagation();

            remove(chatRef);

            // clear input field
            dform.reset();
        });
    }

    // log button handling
    logform = document.getElementById("logbuttonform");
    logform.addEventListener("submit", (e) => {
        // prevents page from reloading
        e.preventDefault();

        // prevents double submissions from one click
        e.stopImmediatePropagation();

        // create html element
        logdownloadelement = document.createElement("a");

        // replace html element <br> with \n
        logtext = chat.innerHTML.replace(/<br>/g,"\n");

        // loop until there are no more html tags (checked by searching for < and >)
        while (!(logtext.indexOf("<") == -1 && logtext.indexOf(">") == -1)) {
            // locate image tags and replace them with the image source link
            toreplace = "";
            if ((logtext.indexOf('<img src="') != -1) && (logtext.indexOf('<img src="') == logtext.indexOf("<"))) {
                toreplace = logtext.substring(logtext.indexOf('<img src="') + 10, logtext.indexOf('"', logtext.indexOf('"') + 1));
            }
            logtext = logtext.replace(logtext.substring(logtext.indexOf("<"), logtext.indexOf(">") + 1), toreplace);
        }
        // remove first two \n characters
        logtext = logtext.slice(2);
        // unsanitise text (so that they show up better in the logs)
        logtext = logtext.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'");
        // give the html element a source to the logtext
        logdownloadelement.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(logtext));
        // make the html element a download
        logdownloadelement.setAttribute("download", chatName + ".txt");
        // set the html element to not display
        logdownloadelement.style.display = "none";
        // add the element to the dom
        document.body.appendChild(logdownloadelement);
        // click the element
        logdownloadelement.click();
        // remove the element from the dom
        document.body.removeChild(logdownloadelement);

        // reset the form? idr what this code does lmao
        logform.reset();
    });

    // display room code at the bottom
    cd.innerHTML = "Room code: <b>" + chatName + "</b>";

    // connect to firebase
    init(chatName, createorjoin);
}

// get client variable for preferred nickname
if (!(localStorage.getItem("nicknamepreference") == null)) {
    nick = localStorage.getItem("nicknamepreference");
}

// get client variable for preferred colour
if (!(localStorage.getItem("colourpreference") == null)) {
    colour = localStorage.getItem("colourpreference");
}

function init(chatName, createorjoin) {
    onAuthStateChanged(auth, (user) => {
        if (user) {

            chatRef = ref(database, `chats/${chatName}`);

            if (createorjoin == 1) {
                // create
                set(chatRef, {
                    recentMessage: "",
                    ownerPass: ownerpass
                });
            }

            // callback will occur whenever chat ref changes
            onValue(chatRef, (snapshot) => {
                if (snapshot.exists()) {
                    if ("recentMessage" in (snapshot.val())) {
                        chat.innerHTML += "<br></br>" + snapshot.val()["recentMessage"];
                        if (!focused) {
                            icon.href = "kijetesantakalu_notif.png";
                        }
                        document.getElementById("sendmessage").scrollIntoView();
                    }
                } else {
                    chatValid = false;
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
        /*
            onChildRemoved(allRef, (snapshot) => {
                if (snapshot.val() == chatName) {
                    //chatValid = false;
                }
                // delete(gamePlayers[snapshot.val().id]);
            })*/
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

// theme form handling
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

// get client variable for preferred theme
if (!(localStorage.getItem("themepreference") == null)) {
    if (localStorage.getItem("themepreference") == "Light Mode") {
        tcss.href = "theme_light.css";
        ts.value = "1";
    } else if (localStorage.getItem("themepreference") == "Dark Mode") {
        tcss.href = "theme_dark.css";
        ts.value = "0";
    }
}

// font form handling
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

// get client variable for preferred font
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
        case "Wire One": {
            fcss.href = "font_wo.css";
            fs.value = "4";
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
    // set icon based on browser theme
    icon.href = "kijetesantakalu_black.png";
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        icon.href = "kijetesantakalu_white.png";
    }
}

function sanitise(dirty) {
    return dirty.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

var img;
var imgw;
var imgh;

function linkify(text) {
    var urlRegex =/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    return text.replace(urlRegex, function(url) {
        if (url.match(/\.(jpeg|jpg|svg|webp|tif|heic|gif|png)$/) == null) {
            // sending link
            return '<a style = "color: #0066cc;", href ="' + url + '">' + url + '</a>';
        } else {
            // sending image
            img = new Image();
            img.src = url;
            imgw = img.width;
            imgh = img.height;
            // height cap (480)
            if (img.height > 480) {
                imgw = Math.round(imgw * 480 / img.height);
                imgh = 480;
            }
            return '<img src="' + url + '", width = "' + imgw + 'px", height = "' + imgh + 'px">';
        }
    });
}

function checkImg(url) {
    img = new Image();
    img.src = url;
    return new Promise((resolve) => {
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
    });
}

function checkUrl(supposed) {
    try {
        new URL(supposed);
        return true;
    } catch (err) {
        return false;
    }
}

setkijetesantakalu();