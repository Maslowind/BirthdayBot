let express = require("express");
let app = express();
let request = require('request');
let bodyParser = require("body-parser");
let schedule = require('node-schedule');
const dotenv = require('dotenv');
const axios = require("axios");
const createNewData = require("./DB_modules/create_data.ts");
const getTomorrowData = require("./DB_modules/get_tomorrow_bd.ts");
const getUserData = require("./DB_modules/get_user_bd.ts");
const delUserData = require("./DB_modules/del_user_bd.ts");

app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: true
    })
);
dotenv.config();
console.log("run");


const outputHelper = function (num) {
    if (num < 10) {
        return ("0" + num).slice(-2)
    } else {
        return num;
    }
}

let j = schedule.scheduleJob('0 0 12 * * *', async function () {
    let current_date = new Date();
    let tomorrow_date = new Date(Date.UTC(0, current_date.getUTCMonth(), current_date.getUTCDate() + 1))
    let tomorrow_list = await getTomorrowData(tomorrow_date);
    for (let i = 0; i < tomorrow_list.length; i++) {
        sendMessage(telegram_url, tomorrow_list[i].user_id, `У ${tomorrow_list[i].username} завтра, ${outputHelper(tomorrow_list[i].date.getUTCDate())}.${outputHelper(tomorrow_list[i].date.getUTCMonth() + 1)}, День рождения. Не забудьте поздравить!`);
    }
});

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


app.post("/", async function (req, res) {
    console.log("startbot");
    const { message } = req.body;
    if (message.text != undefined) {
        console.log(message);
        if (message.text.toLowerCase().indexOf("/info") != -1) {
            let infoMessage = `Привет! Я бот, который напоминает о ДР твоих друзей. Вот список моих команд:\nДобавить друга в список напоминания: "/setbirthday @username DD.MM" \n
            Посмотреть список друзей и их ДР: "/getbdlist"\nУдалить друга из списка:"/delete @username"`
            sendMessage(telegram_url, message.chat.id, infoMessage);

        } else if (message.text.toLowerCase().indexOf("/setbirthday") != -1) {
            let result = checkAddBDMessage(message);
            if (result !== null)
                sendMessage(telegram_url, message.chat.id, "Вы успешно добавили друга в список");
            else
                sendMessage(telegram_url, message.chat.id, `Дата должна быть в формате "/setbirthday @username DD.MM"`);

        } else if (message.text.toLowerCase().indexOf("/getbdlist") != -1) {
            let message_bd_list = await getUserList(message);
            sendMessage(telegram_url, message.chat.id, message_bd_list);

        } else if (message.text.toLowerCase().indexOf("/delete") != -1) {
            if (checkDelBDMessage(message)) {
                sendMessage(telegram_url, message.chat.id,"Удаление было совершено");
            }
            else {
                sendMessage(telegram_url, message.chat.id, `Удаление должно быть в формате "/delete @username"`);
            }

        }
        else {
            sendMessage(telegram_url, message.chat.id, `${message.from.first_name}... Ти не то робиш`);
        }
    }
    res.send('ok');
});
let telegram_url = "https://api.telegram.org/bot" + process.env.TOKEN + "/sendMessage";
app.listen(8000, () => console.log("Telegram bot is listening on port 8000!"));