import { NowRequest, NowResponse } from '@now/node'
const axios = require("axios");

function sendMessage(url, chat_id, reply) {
    axios.post(url, {
        chat_id: chat_id,
        text: reply
    }).then(() => {
        console.log("Message posted");
    }).catch(error => {
        console.log(error);
    });
}
let telegram_url = "https://api.telegram.org/bot" + process.env.TOKEN + "/sendMessage";

;
export default (req:NowRequest, res:NowResponse) => { 

    const { message } = req.body;
    if (message.text.toLowerCase().indexOf("/getbdlist") != -1) {
        sendMessage(telegram_url, message.chat.id, "message_bd_list");

    }
    else sendMessage(telegram_url, message.chat.id, message.text);
    res.status(200).send(`ок!`)   
}