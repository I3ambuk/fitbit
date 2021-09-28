/**
 * SubView von Details zum anzeigen der Genauen Details des jeweiligen Habits
 */
 import document from "document";

 var habitObject;
 export function init(habit) {
    habitObject = habit;
    console.log("Subview of Details:");
    return document.location.assign("subviews/specificDetail.view");
  }

 export function render() {
    let header_text = document.getElementById("header").getElementById("text");
    let registerdSince_block = document.getElementById("registerdSince");
    let registerdSince_text = registerdSince_block.getElementById("text");
    let registerdSince_bg = registerdSince_block.getElementById("bg");

    let sleepCounter_block = document.getElementById("accomplished");
    let sleepCounter_text = sleepCounter_block.getElementById("text");
    let sleepCounter_bg = sleepCounter_block.getElementById("bg");
    
    let avgEfficency_block = document.getElementById("efficency");
    let avgEfficency_text = avgEfficency_block.getElementById("text");
    let avgEfficency_bg = avgEfficency_block.getElementById("bg");

    let avgDeep_block = document.getElementById("deep");
    let avgDeep_text = avgDeep_block.getElementById("text");
    let avgDeep_bg = avgDeep_block.getElementById("bg");

    let avgLight_block = document.getElementById("light");
    let avgLight_text = avgLight_block.getElementById("text");
    let avgLight_bg = avgLight_block.getElementById("bg");
    
    let avgRem_block = document.getElementById("rem");
    let avgRem_text = avgRem_block.getElementById("text");
    let avgRem_bg = avgRem_block.getElementById("bg");

    let avgWake_block = document.getElementById("wake");
    let avgWake_text = avgWake_block.getElementById("text");
    let avgWake_bg = avgWake_block.getElementById("bg");

    let startDate = new Date(habitObject.startDate);
    let sleepCounter = habitObject.sleepData.counter;
    let avgEfficency = calcPercentageDeviation(habitObject.sleepData.efficiencyScore, habitObject.compareData.efficiencyScore);
    let avgDeep = calcPercentageDeviation(habitObject.sleepData.deepScore, habitObject.compareData.deepScore);
    let avgLight = calcPercentageDeviation(habitObject.sleepData.lightScore, habitObject.compareData.lightScore);
    let avgRem = calcPercentageDeviation(habitObject.sleepData.remScore, habitObject.compareData.remScore);
    let avgWake = calcPercentageDeviation(habitObject.sleepData.wakeScore, habitObject.compareData.wakeScore);

    header_text.text = habitObject.name;
    registerdSince_text.text = startDate.getFullYear() + "-" + (startDate.getMonth() + 1) + "-" + startDate.getDate(); //YYYY-MM-DD;
    sleepCounter_text.text = sleepCounter + "-mal";

    avgEfficency_text.text = avgEfficency + "%";
    avgEfficency_bg.style.fill = (avgEfficency > 0)? "green":(avgEfficency < 0)? "red": "beige";

    avgDeep_text.text = avgDeep + "%";
    avgDeep_bg.style.fill = (avgDeep > 0)? "green":(avgDeep < 0)? "red": "beige";

    avgLight_text.text = avgLight + "%";
    avgLight_bg.style.fill = (avgLight > 0)? "green":(avgLight < 0)? "red": "beige";

    avgRem_text.text = avgRem + "%";
    avgRem_bg.style.fill = (avgRem > 0)? "green":(avgRem < 0)? "red": "beige";

    avgWake_text.text = avgWake + "%";
    avgWake_bg.style.fill = (avgWake > 0)? "red":(avgWake < 0)? "green": "beige";
 }

 function calcPercentageDeviation(sleepData, compareData) {
    return (compareData != 0)?(((sleepData - compareData)/compareData) * 100).toFixed(2) : NaN;
  }