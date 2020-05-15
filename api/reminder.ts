import { NowRequest, NowResponse } from '@now/node'
const getTomorrowData = require(".././DB_modules/get_tomorrow_bd");
const axios = require("axios");
const dotenv = require('dotenv');

dotenv.config();

async function sendMessage(url, chat_id, reply) {
    await axios.post(url, {
        chat_id: chat_id,
        text: reply
    }).then(() => {
        console.log("Message posted");
    }).catch(error => {
        console.log(error);
    });
}

const outputHelper = function (num) {
    if (num < 10) {
        return ("0" + num).slice(-2)
    } else {
        return num;
    }
}

let scheduleFunc =  async function () {
    let current_date = new Date();
    let tomorrow_date = new Date(Date.UTC(0, current_date.getUTCMonth(), current_date.getUTCDate() + 1))
    let tomorrow_list = await getTomorrowData(tomorrow_date);
    console.log(tomorrow_list);
    for (let i = 0; i < tomorrow_list.length; i++) {
    await  sendMessage(telegram_url, tomorrow_list[i].user_id, `У ${tomorrow_list[i].username} завтра, ${outputHelper(tomorrow_list[i].date.getUTCDate())}.${outputHelper(tomorrow_list[i].date.getUTCMonth() + 1)}, День рождения. Не забудьте поздравить!`);
    }
};
let telegram_url = "https://api.telegram.org/bot" + process.env.TOKEN + "/sendMessage";


export default async (req: NowRequest, res: NowResponse) => {
await scheduleFunc();  
}
