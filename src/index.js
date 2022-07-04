const TelegramBot = require('node-telegram-bot-api')
const mongoose = require('mongoose')
const config = require('./config')
const helper = require('./helpers')
const kb = require('./keyboard-buttons')
const keyboard = require('./keyboard')
const database = require('../database.json')

helper.logStart()

mongoose.Promise = global.Promise
mongoose.connect(config.DB_URL)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.log(err))

require('./models/memes.model')
require('./models/user.model')

const Memes = mongoose.model('memes')
const User = mongoose.model('users')

//database.memes.forEach(w => new Memes(w).save())

const ACTION_TYPE = {
    TOGGLE_FAV_MEM: 'tfm',
    STOP: 'stop'
}

const bot = new TelegramBot(config.TOKEN, {
    polling: true
});

bot.on('message', msg => {

    const chatId = helper.getChatId(msg)

    console.log("Bot is working");

    switch (msg.text){
        case kb.timeCount.fiveSeconds:
            sendMemes(chatId,10)
            break

        case kb.timeCount.oneMinute:
            sendMemes(chatId, 60)
            break

        case kb.timeCount.tenMinutes:
            sendMemes(chatId, 600)
            break

        case kb.timeCount.oneHour:
            sendMemes(chatId, 3600)
            break

        case kb.timeCount.twoTimesInDay:
            sendMemes(chatId, 43200)
            break

        case kb.timeCount.oneInDay:
            sendMemes(chatId, 86400)
            break

        case kb.home.seeMemes:
            bot.sendMessage(chatId, "Виберіть частоту генерування мемів:", {
                reply_markup: {
                    keyboard: keyboard.timeCount
                }
            })
            break
        case kb.home.memesSettings:
            bot.sendMessage(chatId, "Виберіть категорію мемів:", {
                reply_markup:{
                    keyboard: keyboard.memes
                }
            })
            break

        case kb.memesCategory.warMemes:
            sendMemesByQuery(chatId, {type: 'warMemes'})
            break
        case kb.memesCategory.studentsMemes:
            sendMemesByQuery(chatId, {type: 'studentsMemes'})
            break
        case kb.memesCategory.aboutPersonMemes:
            sendMemesByQuery(chatId, {type: 'programmingMemes'})
            break
        case kb.memesCategory.onPetsMemes:
            sendMemesByQuery(chatId, {type: 'petsMemes'})
            break

        case kb.home.checkFavourites:
            break
        case kb.back:
            bot.sendMessage(chatId, "Виберіть наступну дію:", {
                reply_markup:{
                    keyboard: keyboard.home
                }
            })
    }
})

bot.on('callback_query', (query, msg) => {
    const userId = query.from.id
    const chatId = helper.getChatId(msg)

    let data

    try{
        data = JSON.parse(query.data)
    }catch(e){
        throw new Error('Data is not an object')
    }

    const {type} = data

    if(type === ACTION_TYPE.TOGGLE_FAV_MEM){

    }
    if(type === ACTION_TYPE.STOP){
        bot.sendMessage(chatId, "Виберіть наступну дію:", {
            reply_markup:{
                keyboard: keyboard.home
            }
        })
    }
})

bot.onText(/\/start/, msg => {
    const text = `Привіт ${msg.from.first_name}\nВиберіть наступну дію:`;

    bot.sendMessage(helper.getChatId(msg), text, {
        reply_markup: {
            keyboard: keyboard.home
        }
    })

})

const sendMemes = (chatId, time) => {
        Memes.find({}).then(memes => {
            memes.map((mem,i) => {
                setTimeout(() => {
                    return bot.sendPhoto(chatId, mem.picture, {
                        caption: mem.capture,
                        reply_markup: {
                            inline_keyboard: [
                                [
                                ]
                            ]
                        }
                    })
                }, (time * 1000) * (i + 1))
            })
    })
}

const sendMemesByQuery = (chatId, query) => {
        Memes.find(query).then(memes => {
            memes.forEach((mem, i) => {
                setTimeout(() => {
                    return bot.sendPhoto(chatId, mem.picture, {
                        caption: mem.capture,
                        reply_markup: {
                            inline_keyboard: [
                                []
                            ]
                        }
                    })
                }, 1000 * (i + 1))
            })
        })
}


const sendHTML = (chatId, html, kbName = null) => {
    const options = {
        parse_mode: 'HTML'
    }

    if(kbName){
        options['reply_markup'] = {
            keyboard: keyboard[kbName]
        }
    }

    bot.sendMessage(chatId, html, options)
}

const toggleFavouriteMem = (userId, queryId, {memId,isFav}) => {

    let userPromise

    User.findOne({telegramId: userId})
        .then(user => {
            if(user){
                if(isFav){
                    user.memes = user.memes.filter(m => m !== memId)
                }
                else{
                    user.memes.push(memId)
                }
                userPromise = user
            }
            else{
                userPromise = new User({
                    telegramId: userId,
                    memes: [memId]
                })
            }

            const answerText = isFav ? "Видалено" : "Додано"

            userPromise.save().then(_ => {
                bot.answerCallbackQuery({
                    callback_query_id: queryId,
                    text: answerText
                }).catch(err => console.log(err))
            }).catch(err => console.log(err))
        })
}