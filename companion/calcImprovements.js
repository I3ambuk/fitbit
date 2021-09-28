/**
 * Diese Datei enthält alle Funktionen die zum Berechnen 
 * einer Korrelation zwischen Schlafscore und Habit nötig sind
 */

import { settingsStorage } from "settings";
import { localStorage } from "local-storage";

const OAUTH = "oauth";
const LOCAL_HABIT_LIST = "local-habit-list";
/**
* Funktion die aufgerufen wird, wenn eine neue Gewhonheit hinzugefügt wird
* fetched die Schlafdaten des letzten Monats
*/
export function calcAndSetAvgSleepscoreLastMonth(habit_name) {

  //Prüfen ob mit Fitbit-Cloud verbunden:
  
  if (settingsStorage.getItem(OAUTH) === null) {
    return new Promise(function(resolve) {
      resolve(false);
    });
  }
  let accessToken = JSON.parse(settingsStorage.getItem(OAUTH)).access_token;
  var today = new Date(new Date() - (1000 * 60 * 60 * 24));
  var xDaysAgo = new Date(today - (1000 * 60 * 60 * 24) * 30);

  let todayDate = convertDateFormat(today); //YYYY-MM-DD
  let beforeDate = convertDateFormat(xDaysAgo);;

  // Sleep API docs - https://dev.fitbit.com/reference/web-api/sleep/
  return fetch(`https://api.fitbit.com/1.2/user/-/sleep/date/${beforeDate}/${todayDate}.json`, {
  method: "GET",
  headers: {
    "Authorization": `Bearer ${accessToken}`
  }
  })
  .then(function(res) {
  return res.json();
  })
  .then(function(data) {
    processSleepScoreDataLastMonth(data.sleep, habit_name);
    return true;
  })
  .catch(err => console.log('[FETCH]: ' + err));
}
/**
* Wertet die Schlafdaten der letzten 30-Tage aus und schreibt den durchschnittlichen Schlafscore 
* zum Habit-Score OHNE Habit. 
* Dieser Score gilt als Vergleich für die spätere Auswertung der Schlafverbesserung
* @param {*} sleep_log_array 
*/
function processSleepScoreDataLastMonth(sleep_log_array, habit_name) {

  if (sleep_log_array != null) {
    var sumEfficiency = 0,
        sumDeep = 0,
        sumLight = 0,
        sumRem= 0,
        sumWake = 0;

    var avgEfficiency = 0,
        avgDeep = 0,
        avgLight = 0,
        avgRem= 0,
        avgWake = 0;

    var counter = 0;

    console.log(sleep_log_array[1]);
    //Calc AvgScore for all data
    for (var i = 0; i < sleep_log_array.length; i++) {
      if (sleep_log_array[i].type === "stages") {
        sumEfficiency += sleep_log_array[i].efficiency;
        sumDeep += sleep_log_array[i].levels.summary.deep.minutes;
        sumLight += sleep_log_array[i].levels.summary.light.minutes;
        sumRem += sleep_log_array[i].levels.summary.rem.minutes;
        sumWake += sleep_log_array[i].levels.summary.wake.minutes;
        counter++;
      }
    }

    avgEfficiency = sumEfficiency/counter;
    avgDeep = sumDeep/counter;
    avgLight = sumLight/counter;
    avgRem = sumRem/counter;
    avgWake = sumWake/counter;
    console.log(counter);
    console.log(sumEfficiency + " "+ avgEfficiency);
    console.log(sumDeep + " "+ avgDeep);
    console.log(sumLight + " "+ avgLight);
    console.log(sumRem + " "+ avgRem);
    console.log(sumWake + " "+ avgWake);

    var dbObject = JSON.parse(localStorage.getItem(habit_name));

    dbObject.compareData.counter = counter;
    dbObject.compareData.efficiencyScore = avgEfficiency;
    dbObject.compareData.deepScore = avgDeep;
    dbObject.compareData.lightScore = avgLight;
    dbObject.compareData.remScore = avgRem;
    dbObject.compareData.wakeScore = avgWake;

    console.log(JSON.stringify(dbObject));
    localStorage.setItem(habit_name, JSON.stringify(dbObject));
  }
}

/**
 * Funktion die regelmäßig täglich aufgerufen wird und 
 * die Schlafdaten der letzten Nacht auswertet und entsprechend die Informationen der
 * Gewohnheiten aktualisiert:
 * 1.Falls checked:
 *  1.1 Aktualisieren des avgHabitScore
 *  1.2 Erhöhen des finishedCounters
 *  1.3 Zurücksetzten auf checked=false
 * 2.ELSE:
 *  2.1 Aktualisieren des avgStdScore
 */
export function calcAndSetAvgSleepscore() {

  //Prüfen ob mit Fitbit-Cloud verbunden: 
  console.log(settingsStorage.getItem(OAUTH));
  if (settingsStorage.getItem(OAUTH) === null) {
    return new Promise(function(resolve) {
      resolve(false);
    });
  }
  let accessToken = JSON.parse(settingsStorage.getItem(OAUTH)).access_token;
  var today = new Date(new Date() - (1000 * 60 * 60 * 24));

  let todayDate = convertDateFormat(today); //YYYY-MM-DD

  // Sleep API docs - https://dev.fitbit.com/reference/web-api/sleep/
  return fetch(`https://api.fitbit.com/1.2/user/-/sleep/date/${todayDate}.json`, {
  method: "GET",
  headers: {
    "Authorization": `Bearer ${accessToken}`
  }
  })
  .then(function(res) {
  return res.json();
  })
  .then(function(data) {
    if (!data.success) {
      console.log(data);
      refreshToken();
    } else {
      processSleepScoreData(data.sleep);
      return true;
    }
  })
  .catch(err => console.log('[FETCH]: ' + err));
}

function  processSleepScoreData(sleep_log_array) {
  if (sleep_log_array != null) {
    var rawHabits = localStorage.getItem(LOCAL_HABIT_LIST);
    var habits = [];
    if (rawHabits != null) {
      habits = rawHabits.split(",");
    }

    for (var k = 0; k < habits.length; k++) {
      var habit_name = habits[k];
      var dbObject = JSON.parse(localStorage.getItem(habit_name));
      
      if (dbObject != null) {
        var efficiency,
            deep,
            light,
            rem,
            wake;

        for (var i = 0; i < sleep_log_array.length; i++) {
          if (sleep_log_array[i].type === "stages") {
            efficiency = sleep_log_array[i].efficiency;
            deep = sleep_log_array[i].levels.summary.deep.minutes;
            light = sleep_log_array[i].levels.summary.light.minutes;
            rem = sleep_log_array[i].levels.summary.rem.minutes;
            wake = sleep_log_array[i].levels.summary.wake.minutes;
            break;
          }
        }

        var counter;

        if (dbObject.checked.today) {
          counter = dbObject.sleepData.counter;

          dbObject.sleepData.efficiencyScore  = updateScore(dbObject.sleepData.efficiencyScore , counter, efficiency);
          dbObject.sleepData.deepScore = updateScore(dbObject.sleepData.deepScore , counter, deep);
          dbObject.sleepData.lightScore = updateScore(dbObject.sleepData.lightScore , counter, light);
          dbObject.sleepData.remScore = updateScore(dbObject.sleepData.remScore , counter, rem);
          dbObject.sleepData.wakeScore = updateScore(dbObject.sleepData.wakeScore , counter, wake);
          dbObject.sleepData.counter = counter + 1;
        } else {
          counter = dbObject.compareData.counter;

          dbObject.compareData.efficiencyScore  = updateScore(dbObject.sleepData.efficiencyScore , counter, efficiency);
          dbObject.compareData.deepScore = updateScore(dbObject.sleepData.deepScore , counter, deep);
          dbObject.compareData.lightScore = updateScore(dbObject.sleepData.lightScore , counter, light);
          dbObject.compareData.remScore = updateScore(dbObject.sleepData.remScore , counter, rem);
          dbObject.compareData.wakeScore = updateScore(dbObject.sleepData.wakeScore , counter, wake);
          dbObject.compareData.counter = counter + 1;
        }

        console.log(JSON.stringify(dbObject));
        localStorage.setItem(habit_name, JSON.stringify(dbObject));
      }
    }
  }
}

/**
 * Konvertiert das Datum "date" zu einem für Fitbit passenden Format
 * @param {*} date 
 * @returns Datum-String von der Form YYYY-MM-DD
 */
function convertDateFormat(date) {
  var month = '' + (date.getMonth() + 1),
  day = '' + date.getDate(),
  year = date.getFullYear();

  if (month.length < 2) 
    month = '0' + month;
  if (day.length < 2) 
    day = '0' + day;

  return year + "-" + month + "-" + day; //YYYY-MM-DD
}
/**
 * Hilfsmethode die einen alten Score aktualisieren
 * @param {*} oldScore 
 * @param {*} counter 
 * @param {*} newValue 
 * @returns 
 */
function updateScore(oldScore, oldCounter, newValue) {
  return ((oldScore * oldCounter) + newValue)/(oldCounter + 1);
}

function refreshToken() {
  let refreshToken = settingsStorage.getItem(OAUTH).refresh_token;
  let userid = settingsStorage.getItem(OAUTH).user_id;
  console.log(new URLSearchParams({
    "grant_type": 'refresh_token',
    "refresh_token": "" + refreshToken,
    "user_id":"" + userid
  }) );
  fetch('https://api.fitbit.com/oauth2/authorize', {
    method: "POST",
    headers: {
      "Authorization": `Basic MjNCOUtDOjI0YTRkYjBlNzBhYTY2MWFiN2Y3NTIwZGU0ODNkZTMw`,
      "Content-Type": `application/x-www-form-urlencoded`
    },
    body: new URLSearchParams({
      "grant_type": 'refresh_token',
      "refresh_token": "" + refreshToken,
      "user_id":"" + userid
    }) 
    //`user_id=${userid}&grant_type=refresh_token&refresh_token=${refreshToken}`
    })
    .then(function(response) {
      console.log(response.json());
    })
    .catch(err => console.log('[FETCH]: ' + err));
}