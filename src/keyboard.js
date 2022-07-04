const kb = require('./keyboard-buttons')

module.exports = {
    home: [
        [kb.home.seeMemes],
        [kb.home.memesSettings]
    ],
    memes: [
        [kb.memesCategory.warMemes, kb.memesCategory.studentsMemes],
        [kb.memesCategory.aboutPersonMemes, kb.memesCategory.onPetsMemes],
        [kb.back]
    ],
    timeCount: [
        [kb.timeCount.fiveSeconds, kb.timeCount.oneMinute],
        [kb.timeCount.tenMinutes, kb.timeCount.oneHour],
        [kb.timeCount.twoTimesInDay, kb.timeCount.oneInDay],
        [kb.back]
    ]
}