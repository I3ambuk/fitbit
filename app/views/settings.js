/**
 * SubView für die Einstellungen auf dem Gerät
 */
import document from "document";

export function render() {
  var headerText = document.getElementById("headerText");

}

export function init() {
  console.log("settings start");
  return document.location.assign("views/settings.view");
}