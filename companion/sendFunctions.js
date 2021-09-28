/**
 * Hilfs-Datei, welche alle Funktionen beinhaltet, welche Daten zum Gerät senden müssen
 */
import * as messaging from "messaging";
import { localStorage } from "local-storage";

const LOCAL_HABIT_LIST = "local-habit-list";

export function sendHabits() {
  var result = [];
  var habits = localStorage.getItem(LOCAL_HABIT_LIST);
  if (habits === null) {
    habits = "";
    localStorage.setItem(LOCAL_HABIT_LIST, habits);
  }
  habits = habits.split(",");
  habits.forEach(habit_name => {
    var dbObject = JSON.parse(localStorage.getItem(habit_name));
    if (dbObject != null) {
      result.push(dbObject);
    }
  });

  //Send data to Device
  let myData = {
      key: "getHabits",
      value: result
    }
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
      messaging.peerSocket.send(myData);
  } else {
      console.log("No peerSocket connection");
  }
}

export function sendErrorMes() {
  console.log("Keine Connection zur Fitbit-Cloud, bitte anmelden:)");
}
  