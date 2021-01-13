var SLACK_API_TOKEN = "TAUT_VAR_SLACK_API_TOKEN";

let channelsToRead = [ "eng", "general" ];


function tautStart() {
    doFetch(
        "https://slack.com/api/conversations.list",
        {},
        fetchMessages);
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


function fetchMessages(conversationsJson) {
    conversationsJson.channels.forEach((channelObj) => {
        if (channelsToRead.includes(channelObj.name)) {
            doFetch(
                "https://slack.com/api/conversations.history",
                {
                    "channel": channelObj.id,
                    "limit": 20,
                },
                displayMessages);
        }
    });
};


function displayMessages(messagesJson) {
    console.log("Got messages: " + objToString(messagesJson));
}

