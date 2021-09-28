/**
 * Startpunkt der Companion-app, 
 * Hört und sendet Messages zum Device, 
 * Aktualisiert das Device, falls sich etwas an den Einstellungen in der Handy-App ändert
 */
import * as messaging from "messaging";
import { settingsStorage } from "settings";
import { me as companion } from "companion";

import {updateHabitList, updateChecked} from "./habit.js";
import {sendHabits, sendErrorMes} from "./sendFunctions.js"

import {calcAndSetAvgSleepscore} from "./calcImprovements.js"

const SETTINGS_HABIT_LIST = "habit-list";

function init() {
  //Listener, welcher Kommandos und Daten vom Gerät verarbeitet
  messaging.peerSocket.addEventListener("message", (evt) => {
    if ( evt.data) {
      switch(evt.data.command) {
        case "getHabits":
          updateHabitList(JSON.parse(settingsStorage.getItem(SETTINGS_HABIT_LIST)));
          sendHabits();
          break;
        case "calcSleepScore":
          updateHabitList(JSON.parse(settingsStorage.getItem(SETTINGS_HABIT_LIST)));
          calcAndSetAvgSleepscore().then(
            function (res) {
              if (res) {
                sendHabits();
              } else {
                sendErrorMes();
              }
            })
          .catch(err => console.log(err));
                                                
          break;
        case "updatedChecked":
          updateChecked(JSON.parse(evt.data.value));
          console.log("checkedSEND");
      }
    }
  });
}

 // Listener, welcher aufgerufen wird, wenn sich etwas an den Einstellungen ändert
 settingsStorage.onchange = evt => {
  if (evt.key === SETTINGS_HABIT_LIST) {
    updateHabitList(JSON.parse(evt.newValue))
    sendHabits();
  }
};

// Settings were changed while the companion was not running
if (companion.launchReasons.settingsChanged) {
  updateHabitList(JSON.parse(settingsStorage.getItem(SETTINGS_HABIT_LIST)))
  sendHabits();
}

init();
