/**
 * Startpunkt und Hauptmenü der App
 */
import document from "document";
import * as messaging from "messaging";
import * as fs from "fs";
import {init as initChecklist, render as renderChecklist} from "./views/checklist";
import {init as initDetails, render as renderDetails} from "./views/details/details";
import {init as initSettings, render as renderSettings} from "./views/settings";

const INDEX_VIEW = "index",
      CHECKLIST_VIEW = "checklist",
      DETAILS_VIEW = "details",
      SETTINGS_VIEW = "settings";
let currentView;
/**
 * Fügt Events zum peerSocket hinzu
 */
function init() {
  currentView = INDEX_VIEW;
  //Listener, welcher beim Verbinden mit dem Handy aktuelle Daten anfordert
  messaging.peerSocket.addEventListener("open", (evt) => {
   if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    // Send a command to the companion
    messaging.peerSocket.send({
      command: "getHabits"
    });
  }
  });

  //Listener, welcher beim Empfangen der angeforderten Daten processData aufruft
  messaging.peerSocket.addEventListener("message", (evt) => {
    if (evt.data && evt.data.key === "getHabits") {
      processData(evt.data.value);;
    }
  });

  //Listener falls ein Connection-Error auftritt
  messaging.peerSocket.addEventListener("error", (err) => {
    console.error("Connection error: " + err);
    //TODO: errorHandling (z.B Warn-Anzeige auf der Uhr, dass diese nicht mit dem Handy verbunden ist)
  });
}

/**
 * Setzt alle Eigenschaften und rendert die Frontend-Anzeige auf der Uhr
 */
function render() {

  var btnChecklistTouch = document.getElementById("btnChecklist").getElementById("touch");
  var btnDetailsTouch = document.getElementById("btnDetails").getElementById("touch");
  var btnSettingsTouch = document.getElementById("btnSettings").getElementById("touch");
  var btnCalculate = document.getElementById("btnCalculate");

  
  btnChecklistTouch.addEventListener("click", () => {
    load(CHECKLIST_VIEW);
  })
  btnDetailsTouch.addEventListener("click", () => {
    load(DETAILS_VIEW);
  })
  btnSettingsTouch.addEventListener("click", () => {
    load(SETTINGS_VIEW);
  })

  btnCalculate.addEventListener("click", () => {
    calcAvgSleepScore();
  })
  //btnCalculate.style.display = "none";
}

function load(view) {
  switch(view) {
    case CHECKLIST_VIEW:
      currentView = CHECKLIST_VIEW;
      initChecklist().then(renderChecklist).catch((err) => {
        console.error("Error loading ChecklistView" + err);
      })
      break;
    case DETAILS_VIEW:
      currentView = DETAILS_VIEW;
      initDetails().then(renderDetails).catch((err) => {
        console.error("Error loading DetailsView" + err);
      })
      break;
    case SETTINGS_VIEW:
      currentView = SETTINGS_VIEW;
      initSettings().then(renderSettings).catch((err) => {
        console.error("Error loading SettingsView" + err);
      })
      break;
    case INDEX_VIEW:
      currentView = INDEX_VIEW;
  }
}

/**
 * Verabeitet die vom Companion empfangenen Daten
 * @param {Array} data
 */
function processData(data) {
  var habitData = {array : data};
  fs.writeFileSync("habitData.txt", habitData , "json");
  document.history.go(1 - document.history.length);//gehe zurück zur Startseite(um inkonsistenzen zu vermeiden)
  if(habitData.array.length > 0) {
    console.log("On Fitbit: " + JSON.stringify(fs.readFileSync("habitData.txt", "json")));
    console.log(JSON.stringify(fs.readFileSync("habitData.txt", "json").array[0].sleepData));
    console.log(JSON.stringify(fs.readFileSync("habitData.txt", "json").array[0].compareData));
  }
}

function calcAvgSleepScore() {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    // Send a command to the companion
    messaging.peerSocket.send({
      command: "calcSleepScore"
    });
  }
}

init();
render();