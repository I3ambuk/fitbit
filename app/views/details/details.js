/**
 * Subview für die Details zu den jeweiligen Habits auf dem Gerät
 */
import document from "document";
import * as fs from "fs";

import {init as initSubview, render as renderSubview} from "./specificDetail";

let habitArray = [];

/**
 * Wird bei launch der Seite aufgerufen, wechselt auf die passende view-seite
 * und sendet ein Kommando zur Companion, dass die aktuellen Habits geladen werden
 */
export function init() {
  console.log("details start");
  habitArray = getHabitInfo();
  return document.location.assign("views/details/details.view");
}

/**
 * rendert alle Items der Webseite, welche nicht von den Daten der Habit-list abhängig sind
 */
export function render() {

  if (habitArray.length === 0) {
    let myAnimation = document.getElementById("loadingAnimation");
    myAnimation.style.display = "inline";
    myAnimation.getElementsByTagName("textarea")[0].text = "Füge Gewohnheiten in der Fitbit-App hinzu..";
    myAnimation.animate("enable");
  } else {
    renderTileList();
  }
  
}

/**
 * Rendert die Details-Liste mit allen Habits
 */
function renderTileList() {
  /**let myAnimation = document.getElementById("loadingAnimation");
  myAnimation.animate("disable");
  myAnimation.style.display = "none";*/

  let tileList = document.getElementById("details-tile-list");
  let NUM_ELEMS = habitArray.length;

  tileList.delegate = {
    getTileInfo: (index) => {
      return {
        type: "my-pool",
        value: "Item",
        index: index
      };
    },
    configureTile: (tile, info) => {
      console.log(`Item: ${info.index}`)
      if (info.type == "my-pool") {
        let habit = habitArray[info.index];
        let touch = tile.getElementById("touch");

        let header_text = tile.getElementById("details-name");

        header_text.text = habit.name;

        touch.addEventListener("click", evt => {
          initSubview(habit).then(renderSubview).catch((err) => {
            console.error("Error loading Subview of Details" + err);
          })
        });
      }
    }
  };
  tileList.length = NUM_ELEMS;
}

 /**
  * Sendet ein Befehl an die Companion-App, dass diese die benötigten Daten senden soll
  */
function getHabitInfo() {
  if(fs.existsSync("habitData.txt")) {
    return fs.readFileSync("habitData.txt", "json").array;
  }
  return [];
}