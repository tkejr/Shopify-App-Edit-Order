import axios from "axios";

const pushNotify = async (title, body, emoji) => {
  let data = JSON.stringify({
    apiKey: "aVaXvTkRIVXqDxQY2s91OK",
    userGroupKey: "gabHPnYeqQ_PDIWzC6CErs",
    title: title,
    body: body,
    emoji: emoji,
  });

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://api.usewuf.com/v1/push",
    headers: {
      "Content-Type": "application/json",
    },
    data: data,
  };

  axios
    .request(config)
    .then((response) => {
      console.log(JSON.stringify(response.data));
    })
    .catch((error) => {
      console.log(error);
    });
};

export { pushNotify };
