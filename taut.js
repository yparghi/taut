var SLACK_API_TOKEN = "TAUT_VAR_SLACK_API_TOKEN";

const formData = new FormData();
formData.append("token", SLACK_API_TOKEN);

let body = new URLSearchParams({
    "token": SLACK_API_TOKEN,
});

fetch("https://slack.com/api/conversations.list", {
    method: "POST",
    body: body,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    }
}).then(response => {
    console.log(response.json());
});

