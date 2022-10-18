// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.4/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged, GoogleAuthProvider, signInWithRedirect, getRedirectResult, signOut, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/9.8.4/firebase-auth.js";
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

const provider = new GoogleAuthProvider();
const auth = getAuth();
setPersistence(auth, browserLocalPersistence).catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
});

init();

// Initialize Realtime Database and get a reference to the service
const database = getDatabase(app);

// get login state
var loggedIn = localStorage.getItem("kijeLoggedIn");

// display correct text on login/signout button
var lsobutton = document.getElementById("lsobutton");
if (loggedIn == "true") {
    lsobutton.value = "Sign Out";
} else {
    lsobutton.value = "Log In";
}

var lsoform = document.getElementById("loginsignoutform");
lsoform.addEventListener("submit", (e) => {
    e.preventDefault();
    e.stopImmediatePropagation();

    if (loggedIn == "true") {
        localStorage.setItem("kijeLoggedIn", "false");
        loggedIn = "false";
        lsobutton.value = "Log In";
        signout();
    } else {
        signInWithRedirect(auth, provider);
    }

    lsoform.reset();
})

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
    cont.innerHTML = '<form id = "createroomform"><input type = "text", id = "roomnameinput", name = "roomnameinput", placeholder = "Room code", required, autocomplete = "off", size = "30px"/><br><input type = "text", id = "roomnamepass", name = "roomnamepass", placeholder = "Owner password", required, autocomplete = "off", size = "30px"/><br><input type = "submit", id = "cr", name = "button", value = "Create Room", required/></form><p style = "color: #ff0000", id = "createroomerror"></p>'

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

                    // connect to firebase
                    /*
                    localStorage.setItem("kijeredirected", "true");
                    localStorage.setItem("kijejc", joinCode);
                    localStorage.setItem("kijecoj", "1");
                    localStorage.setItem("kijeop", ownerpass);
                    signInWithRedirect(auth, provider);*/
                    if (loggedIn == "true") {
                        initChat(joinCode, 1);
                        loadchatroom(joinCode, 1);
                    } else {
                        document.getElementById("createroomerror").innerHTML = "You are not logged in!";
                    }
        
                    crform.reset();
                }
            });
            crform.reset();
        }
    });
}

var jrform;

function loadjoinroom() {
    cont.innerHTML = '<form id = "joinroomform"><input type = "text", id = "roomnameinput", name = "roomnameinput", placeholder = "Room code", required, autocomplete = "off", size = "30px"/><br><input type = "text", id = "roomnamepass", name = "roomnamepass", placeholder = "Owner password (optional)", required, autocomplete = "off", size = "30px"/><br><input type = "submit", id = "cr", name = "button", value = "Join Room", required/></form><p style = "color: #ff0000", id = "joinroomerror"></p>'

    jrform = document.getElementById("joinroomform");
    jrform.addEventListener("submit", (e) => {
        var joinCode = sanitise(String(document.forms["joinroomform"]["roomnameinput"].value));
        var potentialOwnerpassconsole = sanitise(String(document.forms["joinroomform"]["roomnamepass"].value));
        if ((joinCode.length > 0)) {
            e.preventDefault();
            e.stopImmediatePropagation();
            get(child(ref(database), `chats/${joinCode}`)).then((snapshot) => {
                if (snapshot.exists()) {
                    /*
                    if (potentialOwnerpassconsole == snapshot.val()["ownerPass"]) {*/
                        ownerpass = potentialOwnerpassconsole;/*
                        localStorage.setItem("kijeop", ownerpass);
                    } else {
                        localStorage.setItem("kijeop", "");
                    }
                    // connect to firebase
                    localStorage.setItem("kijeredirected", "true");
                    localStorage.setItem("kijejc", joinCode);
                    localStorage.setItem("kijecoj", "0");
                    signInWithRedirect(auth, provider);*/
                    if (loggedIn == "true") {
                        initChat(joinCode, 0);
                        loadchatroom(joinCode, 0);
                    } else {
                        document.getElementById("joinroomerror").innerHTML = "You are not logged in!";
                    }
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
var smfMatch;
var smfNew;
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
var sopform;
var logform;
var logtext;
var logdownloadelement;
var toreplace;
var colour = "ffffff";
var focused = true;
var icon = document.getElementById("icon");
var title = document.getElementById("title");
var rm; // recent message
var userEmail;

// get client variable for preferred nickname
if (!(localStorage.getItem("nicknamepreference") == null)) {
    nick = localStorage.getItem("nicknamepreference");
}

// get client variable for preferred colour
if (!(localStorage.getItem("colourpreference") == null)) {
    colour = localStorage.getItem("colourpreference");
}
/*
if (localStorage.getItem("kijeredirected") == "true") {
    localStorage.setItem("kijeredirected", "false");
    ownerpass = localStorage.getItem("kijeop");
    localStorage.setItem("kijeop", "");
    initChat(localStorage.getItem("kijejc"), Number(localStorage.getItem("kijecoj")));
    loadchatroom(localStorage.getItem("kijejc"), Number(localStorage.getItem("kijecoj")));
    localStorage.setItem("kijejc", "");
    localStorage.setItem("kijecoj", "");
}*/

function loadchatroom(chatName, createorjoin) {
    chatValid = true;

    // set chat contents
    if (ownerpass == null || !(ownerpass.length > 0)) {
        cont.innerHTML = '<b>Please note that you will not be able to see messages sent before the tab was opened. It is therefore recommended to keep this tab running in the background.</b><p id = "chat"></p><form id = "sendmessageform"><input type = "text", id = "sendmessage", name = "sendmessage", placeholder = "Message here...", required, autocomplete = "off"><input type = "submit", id = "smbutton", name = "button", value = "Send Message", required> <span style = "color: #ff0000", id = "smerror"></span></form><form id = "changenickform"><input type = "text", id = "changenick", name = "changenick", placeholder = "Set nickname...", required, autocomplete = "off"><input type = "submit", id = "cnbutton", name = "button", value = "Set Nickname", required></form><form id = "changecolourform"><input type = "text", id = "changecolour", name = "changecolour", placeholder = "Set colour (hex)...", required, autocomplete = "off"><input type = "submit", id = "ccbutton", name = "button", value = "Set Colour", required></form><p id = "nickdisplay">Current Nickname: <span style = "color: #' + colour + '"><b>' + nick + '</b></span></p><p id = "codedisplay"></p><form id = "logbuttonform"><input type = "submit", id = "logbutton", name = "button", value = "Download log", required></form>';
    } else {
        cont.innerHTML = '<b>Please note that you will not be able to see messages sent before the tab was opened. It is therefore recommended to keep this tab running in the background.</b><p id = "chat"></p><form id = "sendmessageform"><input type = "text", id = "sendmessage", name = "sendmessage", placeholder = "Message here...", required, autocomplete = "off"><input type = "submit", id = "smbutton", name = "button", value = "Send Message", required> <span style = "color: #ff0000", id = "smerror"></span></form><form id = "changenickform"><input type = "text", id = "changenick", name = "changenick", placeholder = "Set nickname...", required, autocomplete = "off"><input type = "submit", id = "cnbutton", name = "button", value = "Set Nickname", required></form><form id = "changecolourform"><input type = "text", id = "changecolour", name = "changecolour", placeholder = "Set colour (hex)...", required, autocomplete = "off"><input type = "submit", id = "ccbutton", name = "button", value = "Set Colour", required></form><p id = "nickdisplay">Current Nickname: <span style = "color: #' + colour + '"><b>' + nick + '</b></span></p><p id = "codedisplay"></p><form id = "changecodeform"><input type = "text", id = "changecode", name = "changecode", placeholder = "Set new code", required, autocomplete = "off"><input type = "submit", id = "ccdbutton", name = "button", value = "Change code (members need new code)", required></form><form id = "setownerpassform"><input type = "text", id = "setownerpass", name = "setownerpass", placeholder = "Set new ownerpass", required, autocomplete = "off"><input type = "submit", id = "sopbutton", name = "button", value = "Set ownerpass", required></form><br><form id = "logbuttonform"><input type = "submit", id = "logbutton", name = "button", value = "Download log", required></form><br><form id = "delbuttonform"><input type = "submit", id = "delbutton", name = "button", value = "Delete Chatroom", style = "color: #ff0000", required></form>';
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
        smf = stylify(linkify(sanitise(String(document.forms["sendmessageform"]["sendmessage"].value))));

        // get date to append to text
        today = new Date();
        options = { weekday: undefined, year: 'numeric', month: 'numeric', day: 'numeric', hour: "numeric", minute: "numeric", second: "numeric" };

        // check the user hasn't sent anything within the second (if so they are likely spamming)
        if (today.toLocaleDateString("en-US", options) != lastmessagesenttime.toLocaleDateString("en-US", options)) {
            lastmessagesenttime = today;

            // check the length of message without counting length of image or link
            smfNew = smf;
            smfMatch = [];
            if (smf.includes("<")) {
                // match anything inside <>
                smfMatch = smf.match(/(<[^<>]+>)+/g);
                for (var i = 0; i < smfMatch.length; i++) {
                    // replace each item inside <> with nothingness
                    smfNew = smfNew.replace(smfMatch[i], "");
                }

                // reset smfMatch to exclusively match img and a tags (for later use with link and image limits)
                if (smf.includes("<img") || smf.includes("<a")) {
                    // if there are such tags, identify those ones only
                    smfMatch = smf.match(/(<img [^<>]*>)|(<a [^<>]*>)+/g);
                } else {
                    // if there are no such tags, revert back to empty list once more
                    smfMatch = [];
                }
            }

            // cap message length limit
            if (smfNew.length < 401 && smfMatch.length < 4) {
                if (chatValid == true) {
                    // format and send the message
                    send = today.toLocaleDateString("en-US", options) + ' <span class = "userhover", style = "color: #' + colour + '"><b>' + nick + ':</b></span> ' + smf + '<div class = "emailhover">' + userEmail + '</div>';
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
                if (smfMatch.length < 4) {
                    // display character limit error
                    smerror.innerHTML = "Error: The message you have tried to send is " + String(smfNew.length - 400) + " characters over the character limit (400)."
                    // unitary case
                    if (smfNew.length - 400 == 1) {
                        smerror.innerHTML = "Error: The message you have tried to send is " + String(smfNew.length - 400) + " character over the character limit (400)."
                    }
                } else {
                    // display more than 3 image limit error
                    smerror.innerHTML = "Error: The message you have tried to send contains " + String(smfMatch.length - 3) + " more images/links than the image/link limit allows (3)."
                    // unitary case
                    if (smfMatch.length - 3 == 1) {
                        smerror.innerHTML = "Error: The message you have tried to send contains " + String(smfMatch.length - 3) + " more image/link than the image/link limit allows (3)."
                    }
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

    if (!(ownerpass == null || !(ownerpass.length > 0))) {
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

        // set ownerpass form handling
        sopform = document.getElementById("setownerpassform");
        sopform.addEventListener("submit", (e) => {
            // prevents page from reloading
            e.preventDefault();

            // prevents double submissions from one click
            e.stopImmediatePropagation();

            ownerpass = sanitise(String(document.forms["setownerpassform"]["setownerpass"].value));

            update(chatRef, {
                ownerPass: ownerpass
            });

            // clear input field
            sopform.reset();
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
}

function init() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            localStorage.setItem("kijeLoggedIn", "true");
            loggedIn = "true";
            lsobutton.value = "Sign Out";
        } else {
            // logged out
        }
    })
}

function initChat(chatName, createorjoin) {
//    signout();

    onAuthStateChanged(auth, (user) => {
        if (user) {
            localStorage.setItem("kijeLoggedIn", "true");
            loggedIn = "true";
            lsobutton.value = "Sign Out";

            userEmail = user.email;

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
                        // check to make sure it is infact the recentMessage changing (and not the ownerPass for instance)
                        if (!(rm == snapshot.val()["recentMessage"])) {
                            chat.innerHTML += "<br><br>" + snapshot.val()["recentMessage"];
                            if (!focused) {
                                icon.href = "kijetesantakalu_notif.png";
                            }
                            document.getElementById("sendmessage").scrollIntoView();
                            
                            rm = snapshot.val()["recentMessage"];
                        }
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
/*
    getRedirectResult(auth).then((result) => {
        // This gives you a Google Access Token. You can use it to access Google APIs.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;

        // The signed-in user info.
        const user = result.user;
    }).catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        //const email = error.customData.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);
        // ...
    })*/

/*    signInAnonymously(auth).catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        
        console.log(errorCode, errorMessage);
    });*/
}

function signout() {
    signOut(auth).then(() => {
        // Sign-out successful.
    }).catch((error) => {
        // An error happened.
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
        case "Lobster": {
            fcss.href = "font_lb.css";
            localStorage.setItem("fontpreference", "Lobster");
            break;
        }
        case "Courier New": {
            fcss.href = "font_cn.css";
            localStorage.setItem("fontpreference", "Courier New");
            break;
        }
        case "Dosis": {
            fcss.href = "font_dss.css";
            localStorage.setItem("fontpreference", "Dosis");
            break;
        }
        case "Bad Script": {
            fcss.href = "font_bs.css";
            localStorage.setItem("fontpreference", "Bad Script");
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
        case "Lobster": {
            fcss.href = "font_lb.css";
            fs.value = "5";
            break;
        }
        case "Courier New": {
            fcss.href = "font_cn.css";
            fs.value = "6";
            break;
        }
        case "Dosis": {
            fcss.href = "font_dss.css";
            fs.value = "7";
            break;
        }
        case "Bad Script": {
            fcss.href = "font_bs.css";
            fs.value = "8";
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

var urlRegex =/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
var imgRegex = /(~[^~]+~)+/g;
function linkify(text) {
    return text.replace(imgRegex, function(url) {
        is_image(url.slice(1, -1), function(){return '<img src="' + url.slice(1, -1) + '">';}, function(){return '';}));
    });
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

function is_image(url, callback, errorcallback) {
    var img = new Image();
    if (typeof(errorcallback) === "function") {
        img.onerror = function() { errorcallback(); }
    } else {
        img.onerror = function() { return false; }
    }
    if (typeof(callback) === "function") {
        img.onload = function() { callback(); }
    } else {
        img.onload = function() { return true; }
    }
    img.src = url;
}

function checkUrl(supposed) {
    try {
        new URL(supposed);
        return true;
    } catch (err) {
        return false;
    }
}

var cancelledAsterisk = /\\\*/g;
var cancelledUnderscore = /\\\_/g;
var cancelledTilde = /\\~/g;
var cancelledBackslash = /\\\\/g;
var boldRegex = /(\*\*[^\*]+\*\*)+/g;
var italicRegex1 = /(\*[^\*]+\*)+/g;
var underlineRegex = /(\_\_[^\_]+\_\_)+/g;
var italicRegex2 = /(\_[^\_]+\_)+/g;
var strikethroughRegex = /(~~[^~]+~~)+/g;
function stylify(text) {
    return text.replace(cancelledAsterisk, "&#42;").replace(cancelledUnderscore, "&#95;").replace(cancelledTilde, "&#126;").replace(cancelledBackslash, "&#92;").replace(boldRegex, function(matched) {
        return "<b>" + matched.substring(2, matched.length - 2) + "</b>";
    }).replace(italicRegex1, function (matched) {
        return "<i>" + matched.substring(1, matched.length - 1) + "</i>";
    }).replace(underlineRegex, function (matched) {
        return "<u>" + matched.substring(2, matched.length - 2) + "</u>";
    }).replace(italicRegex2, function (matched) {
        return "<i>" + matched.substring(1, matched.length - 1) + "</i>";
    }).replace(strikethroughRegex, function (matched) {
        return "<del>" + matched.substring(2, matched.length - 2) + "</del>";
    });
}

setkijetesantakalu();
