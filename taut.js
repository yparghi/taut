var SLACK_API_TOKEN = "TAUT_VAR_SLACK_API_TOKEN";

let channelsToRead = [ "eng", "general" ];


function tautStart() {
    doFetch(
        "https://slack.com/api/conversations.list",
        {},
        (json) => { fetchMessages(json); });
};


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
            console.log("Response error!: " + response);
        }
    });
};


// Thanks to: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Cyclic_object_value#Examples
const makeCircularReplacer = () => {
    const seen = new WeakSet();
    return (key, value) => {
        if (typeof value === "object" && value !== null) {
            if (seen.has(value)) {
                if (value.hasOwnProperty("shortName")) {
                    return "[Circular: " + value.shortName + "]";
                } else {
                    return "[Circular]";
                }
            }
            seen.add(value);
        }
        return value;
    };
};

function objToString(obj) {
    return JSON.stringify(obj, makeCircularReplacer(), 4);
}


// Thanks to: https://stackoverflow.com/questions/3043775/how-to-escape-html
function escapeHTML(str){
    var p = document.createElement("p");
    p.appendChild(document.createTextNode(str));
    return p.innerHTML;
}


function fetchMessages(conversationsJson) {
    conversationsJson.channels.forEach((channelObj) => {
        if (channelsToRead.includes(channelObj.name)) {

            let mainDiv = document.getElementById("main");
            let thisChannelDiv = document.createElement("div");
            thisChannelDiv.id = "channelDiv_" + channelObj.name;
            mainDiv.appendChild(thisChannelDiv);

            doFetch(
                "https://slack.com/api/conversations.history",
                {
                    "channel": channelObj.id,
                    "limit": 10,
                },
                (json) => { displayMessages(channelObj.name, json); });
        }
    });
};


function displayMessages(channelName, messagesJson) {
    let messagesArr = messagesJson.messages;
    messagesArr.sort((a, b) => {
        return -1 * (parseFloat(a.ts) - parseFloat(b.ts));
    });

    let thisChannelDiv = document.getElementById("channelDiv_" + channelName);

    let header = document.createElement("div");
    header.className = "channelHeader";
    header.innerHTML = `<h3>${escapeHTML("#" + channelName)}</h3>`;
    thisChannelDiv.appendChild(header);

    messagesArr.forEach((message) => {
				let messageStanza = document.createElement("p");
        messageStanza.className = "individualMessage";
        messageStanza.innerHTML = escapeHTML(message.text);
        thisChannelDiv.appendChild(messageStanza);
    });
}

