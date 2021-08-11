const { differenceInMinutes, subMinutes } = require("date-fns");

const {
  MAX_LIFE,
  LIFE_INCREASE_MINUTE,
} = require("../hardcoded/generalConstants");

module.exports = function (life, lifeTimestamp) {
  const now = new Date();
  let newLife = 0;

  let elapsedMinute = differenceInMinutes(now, Date.parse(lifeTimestamp));

  while (elapsedMinute >= LIFE_INCREASE_MINUTE) {
    newLife += 1;

    if (newLife === MAX_LIFE || life + newLife <= MAX_LIFE) {
      // Ekstra kalan zamanı mod alarak bul
      elapsedMinute %= LIFE_INCREASE_MINUTE;
      break;
    }

    elapsedMinute -= LIFE_INCREASE_MINUTE;
  }

  // yeni bir can kazanılmadı ise zamanı yenileme
  newlifeTimestamp = newLife ? subMinutes(now, elapsedMinute) : null;

  return { newLife, newlifeTimestamp };
};
