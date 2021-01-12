var SLACK_API_TOKEN = "TAUT_VAR_SLACK_API_TOKEN";

let channelsToRead = [ "eng", "general" ];

let body = new URLSearchParams({
    "token": SLACK_API_TOKEN,
});

function tautStart() {
    fetch("https://slack.com/api/conversations.list", {
        method: "POST",
        body: body,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        }
    }).then(response => {
        if (response.ok) {
            response.json().then(jsonBody => fetchMessages(jsonBody));
        } else {
            console.log("Response error!: " + response);
        }
    });
};


function fetchMessages(conversationsJson) {
    console.log(conversationsJson);
    conversationsJson.channels.forEach((channelObj) => {
        if (channelsToRead.includes(channelObj.name)) {
            console.log(channelObj);
        }
    });
};

