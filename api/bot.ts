import { NowRequest, NowResponse } from '@now/node'
const axios = require("axios");
const dotenv = require('dotenv');
const getUserData = require(".././DB_modules/get_user_bd");
const createNewData = require(".././DB_modules/create_data");
const delUserData = require(".././DB_modules/del_user_bd");

dotenv.config();
console.log("run");

const outputHelper = function (num) {
    if (num < 10) {
        return ("0" + num).slice(-2)
    } else {
        return num;
    }
}

async function getUserList(message) {
    let user_bd_list = await getUserData(message.chat.id);
    console.log(user_bd_list)
    let message_bd_list = "Ваш список друзей:\n"
    for (let i = 0; i < user_bd_list.length; i++) {
        message_bd_list += `${user_bd_list[i].username}:  ${outputHelper(user_bd_list[i].date.getUTCDate())}.${outputHelper(user_bd_list[i].date.getUTCMonth() + 1)}\n`
    }
    if (message_bd_list === "Ваш список друзей:\n") message_bd_list = "У Вас нет друзей в списке. Добавьте их!"
    return message_bd_list;
}

function checkAddBDMessage(message) {
    let message_data = message.text.replace(/\s+/g, ' ').split(" ");
    if (message_data.length !== 3) return null;
    let dateParams = message_data[message_data.length - 1].split(".");
    if (dateParams.length !== 2) return null;
    if (!(dateParams[0] >= 1 && dateParams[0] <= 31 && dateParams[1] >= 1 && dateParams[1] <= 12)) return null;
    let date = new Date(Date.UTC(0, dateParams[1] - 1, dateParams[0]));
    createNewData(message.chat.id, message_data[1], date);
    return date;
}
function checkDelBDMessage(message) {
    let message_data = message.text.replace(/\s+/g, ' ').split(" ");
    if (message_data.length !== 2) return false;
    console.log(message_data[1])
    delUserData(message.chat.id, message_data[1]);
    return true;
}

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
let telegram_url = "https://api.telegram.org/bot" + process.env.TOKEN + "/sendMessage";

export default async (req: NowRequest, res: NowResponse) => {
    const { message } = req.body;
    console.log(message)
    if (message.text.toLowerCase().indexOf("/start") != -1) {
        let infoMessage = `Привет! Я бот, который напоминает о ДР твоих друзей. Вот список моих команд:\nДобавить друга в список напоминания: "/setbirthday @username DD.MM"
Посмотреть список друзей и их ДР: "/getbdlist"\nУдалить друга из списка:"/delete @username"`
       await sendMessage(telegram_url, message.chat.id, infoMessage);

    } else if (message.text.toLowerCase().indexOf("/setbirthday") != -1) {
        let result = checkAddBDMessage(message);
        if (result !== null)
          await  sendMessage(telegram_url, message.chat.id, "Вы успешно добавили друга в список");
        else
          await  sendMessage(telegram_url, message.chat.id, `Дата должна быть в формате "/setbirthday @username DD.MM"`);

    } else if (message.text.toLowerCase().indexOf("/getbdlist") != -1) {
        let message_bd_list = await getUserList(message);
       await sendMessage(telegram_url, message.chat.id, message_bd_list);

    } else if (message.text.toLowerCase().indexOf("/delete") != -1) {
        if (checkDelBDMessage(message)) {
        await sendMessage(telegram_url, message.chat.id, "Удаление было совершено");
        }
    } else await sendMessage(telegram_url, message.chat.id, `${message.from.first_name}... Ти не то робиш`);
    res.status(200).send(`ок!`)
}