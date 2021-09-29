/**
 * Subview für die Checkliste auf dem Gerät, hier kann täglich gewählt werden ob die Gewohnheit erledigt wurde oder nicht.
 */
import document from "document";
import * as messaging from "messaging";
import * as fs from "fs";

let habitArray = [];

/**
 * Initialisiert die Checklist-View
 * Wird bei launch der Seite aufgerufen, wechselt auf die passende view-seite
 * und lädt die Habits im Speicher
 */
export function init() {
  console.log("checklist start");
  habitArray = getChecklistData();

  return document.location.assign("views/checklist.view");
}

/**
 * rendert alle Items der Webseite
 */
export function render() {

  document.addEventListener("beforeunload", (evt) => {
    saveData();
    console.log("Data saved");
  });
  
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
 * Rendert die Checklist mit allen Habits
 */
function renderTileList() {
  let tileList = document.getElementById("tile-list");
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
        let  bgRec = tile.getElementsByClassName("bg-checklist-item")[0];
        let text = tile.getElementById("tile-text");
        let habit = habitArray[info.index];
        let touch = tile.getElementById("touch");
        text.text = habit.name;
        //look if checked:
        if (habit.checked.today) {
          bgRec.style.fill = "#69CC24";
          text.style.fill = "black";
        } else {
          bgRec.style.fill = "#111111";
          text.style.fill = "white";
        }
        touch.addEventListener("click", evt => {
          console.log(`touched: ${info.index}`);
          //check-handler:
          if (habit.checked.today) {
            habit.checked.today = false;
            bgRec.style.fill = "#111111";
            text.style.fill = "white";
          } else {
            habit.checked.today = true;
            bgRec.style.fill = "#69CC24";
            text.style.fill = "black";
          }
        });
      }
    }
  };
  tileList.length = NUM_ELEMS;
}

 /**
  * Filtert aus dem HabitArray im Speicher, welche Habits gechecked wurden
  */
function getChecklistData() {
  if(fs.existsSync("habitData.txt")) {
    return fs.readFileSync("habitData.txt", "json").array;
  }
  return [];
}

/**
 * Speichert die geänderten Daten im Lokalen Speicher und
 * sendet der Companion-app die geänderten Daten
 */
function saveData() {
  var habitData = {array : habitArray};
  fs.writeFileSync("habitData.txt", habitData , "json");
  console.log("Checked gespeichert: " + JSON.stringify(fs.readFileSync("habitData.txt", "json").array));

  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send({
      command: "updatedChecked",
      value: JSON.stringify(habitArray)
    });
  }
}
