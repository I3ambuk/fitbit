/**
 * Beinhaltet die Funktionalität, welche die Daten zu den Habits im Speicher konsistent hält
 */

import { localStorage } from "local-storage";
import  {DBObject}   from "./dbObject";

import {calcAndSetAvgSleepscoreLastMonth} from "./calcImprovements.js"

const LOCAL_HABIT_LIST = "local-habit-list";


/**
 * Bekommt als Eingabe das Array der Habits aus den Einstellungen und aktualisiert auf dessen Basis
 * die Habits im Lokalen Speicher, hierzu zählt:
 * 1.Entfernen der alten Habits aus dem Speicher(habit-name als key) und der Habit-Liste(local-habit-list als key)
 * 2.Hinzufügen der neuen Habits zum Speicher und der Habit-Liste
 * @param {*} data 
 */
export function updateHabitList(data) {
  //raw Data looks like: [{"name":"habit1"}, {"name":"habit2"}, ...]
  if (data == null) {
    return false;
  }
  var dataArray = [];
  data.forEach((item) => {
      dataArray.push(item.name);
  });

  updateLocalHabitList(dataArray);
  return true;
}

/**
 * Bekommt als Eingabe ein Array von Objekten der Form {name:Habit_Name, ..., checked:true/false,...}
 * und aktualisiert aufgrund dessen das checked-Attribut des entsprechenden Habits im Speicher
 * @param {*} habitArray
 */
export function updateChecked(habitArray) {
  console.log(habitArray);
  habitArray.forEach( (habitData) => {
    var habitInStorage = JSON.parse(localStorage.getItem(habitData.name));
    habitInStorage.checked.today = habitData.checked.today;
    localStorage.setItem(habitData.name, JSON.stringify(habitInStorage));
  })
}

//update the old habitlist in local-storage with the new habits
function updateLocalHabitList(data) {
  var rawLocalHabitlist = localStorage.getItem(LOCAL_HABIT_LIST);
  var localHabitlist = [];
  if (rawLocalHabitlist != null) {
    localHabitlist = rawLocalHabitlist.split(",");
  }
  
  //iterate over localHabitlist and remove all old-habits from local-list and local-storage
  var newHabitList = localHabitlist.filter(function(item) {
                                              var exists = false;
                                             
                                              for (var i = 0; i < data.length; i++) {
                                                if (data[i] === item) {
                                                  exists = true;
                                                  break;
                                                }
                                              }

                                              if (!exists) {
                                                localStorage.removeItem(item);
                                                console.log(item + " removed");
                                              }
                                              return exists;
                                            });
  localHabitlist = newHabitList;
  
  //adding habits to local-storage and local-storage-habitlist if they are new.
  data.forEach( (item) => {
    var storageItem = localStorage.getItem(item);
    if ( storageItem === null) {
      let date = new Date();
      
      var dbObject = new DBObject(item, date);
      localStorage.setItem(item, JSON.stringify(dbObject));
      localHabitlist.push(item);
      calcAndSetAvgSleepscoreLastMonth(item);
      console.log(item + " added");
    }
  })
  //adding new local-habitlist to local-storage
  localStorage.setItem(LOCAL_HABIT_LIST, localHabitlist);
  return localHabitlist;
}
