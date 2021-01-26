/* TODOs:
 * - Use 'conversations.mark' for the read/unread cursor?
 */

var SLACK_API_TOKEN = "TAUT_VAR_SLACK_API_TOKEN";

var UNREAD_THRESHOLD_MINUTES = 60 * 3;

var conversationUrlParams = null;

var channelsToRead = [];

// Maps conversation ID -> user name
var imIdsToNames = {};

var debugEnabled = false;


function tautStart() {
    setUpChannelDivs();

    doFetch(
        "https://slack.com/api/users.conversations",
        {
            "exclude_archived": true,
            "limit": 100,
            "types": "public_channel,private_channel,im",
        },
        (json) => { fetchMessages(json); });
};


function setUpChannelDivs() {

    let urlParams = new URLSearchParams(window.location.search);
    conversationUrlParams = urlParams.get("channels").split(",");

    let mainDiv = document.getElementById("main");

    conversationUrlParams.forEach((channelName) => {
        if (channelName.startsWith("im:")) {
            let parts = channelName.split(":")
            channelName = parts[1];
            imIdsToNames[parts[2]] = channelName;
        } else {
            channelsToRead.push(channelName);
        }

        let thisChannelDiv = document.createElement("div");
        thisChannelDiv.id = "channelDiv_" + channelName;
        thisChannelDiv.className = "channelSection";
        mainDiv.appendChild(thisChannelDiv);
    });
}


function doFetch(urlStr, paramsDict, callbackFun) {
    let body = new URLSearchParams({
        "token": SLACK_API_TOKEN,
        ...paramsDict,
    });

    fetch(urlStr, {
        method: "POST",
        body: body,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        }
    }).then(response => {
        if (response.ok) {
            response.json().then(jsonBody => callbackFun(jsonBody));
        } else {
            console.log("Response error!: " + objToString(response));
        }
    });
};


// Thanks to: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Cyclic_object_value#Examples
function makeCircularReplacer() {
    const seen = new WeakSet();
    return (key, value) => {
        if (typeof value === "object" && value !== null) {
            if (seen.has(value)) {
                  return "[Circular]";
            }
            seen.add(value);
        }
        return value;
    };
};

function objToString(obj) {
    return JSON.stringify(obj, makeCircularReplacer(), 2);
}


// Thanks to: https://stackoverflow.com/questions/3043775/how-to-escape-html
function escapeHTML(str){
    var p = document.createElement("p");
    p.appendChild(document.createTextNode(str));
    return p.innerHTML;
}

function debug(message) {
    if (!debugEnabled) {
        return;
    }
    console.log(message);
}


function fetchMessages(conversationsJson) {
    debug("Got conversations:\n" + objToString(conversationsJson));

    conversationsJson.channels.forEach((conversationObj) => {
        var conversationId = null;
        var channelName = null;
        var isIm = false;
        if (conversationObj.is_channel && channelsToRead.includes(conversationObj.name)) {
            conversationId = conversationObj.id;
            channelName = conversationObj.name;
        } else if (conversationObj.is_im && conversationObj.id in imIdsToNames) {
            conversationId = conversationObj.id;
            channelName = imIdsToNames[conversationId];
            isIm = true;
        }

        if (conversationId != null) {
            doFetch(
                "https://slack.com/api/conversations.history",
                {
                    "channel": conversationId,
                    "limit": 10,
                },
                (json) => { displayMessages(channelName, isIm, json); });
        }
    });
};


function classNameForMessage(messageObj) {
    let tsNow = (new Date().getTime()) / 1000.0;
    let tsMessage = parseFloat(messageObj.ts);
    let tsThreshold = tsNow - (UNREAD_THRESHOLD_MINUTES * 60);


    if (tsMessage > tsThreshold) {
        return "unreadMessage";
    } else {
        return "readMessage";
    }
};


function displayMessages(channelName, isIm, messagesJson) {
    let messagesArr = messagesJson.messages;
    messagesArr.sort((a, b) => {
        return -1 * (parseFloat(a.ts) - parseFloat(b.ts));
    });

    let thisChannelDiv = document.getElementById("channelDiv_" + channelName);

    let header = document.createElement("div");
    header.className = "channelHeader";
    if (isIm) {
        header.innerHTML = `<h3>${escapeHTML("@" + channelName)}</h3>`;
    } else {
        header.innerHTML = `<h3>${escapeHTML("#" + channelName)}</h3>`;
    }
    thisChannelDiv.appendChild(header);

    messagesArr.forEach((message) => {
				let messageStanza = document.createElement("p");
        messageStanza.className = classNameForMessage(message);
        // Note the 'text' field is already HTML-encoded.
        messageStanza.innerHTML = message.text;
        thisChannelDiv.appendChild(messageStanza);
    });
}

