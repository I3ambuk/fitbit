/**
 * Ein DatenbankObjekt, welches alle Informationen eines Habits hält,
 * dieses wird im lokalen-Speicher zusammen mit dem Namen des Habits als Key gespeichert.
 */
export class DBObject {
  constructor(name, startDate) {
    this.name = name;
    this.checked = {today: false, oneDayBefore: false, twoDaysBefore: false, threeDaysBefore: false};
    this.startDate = startDate;
    this.sleepData = {counter:0, efficiencyScore:0, deepScore:0, lightScore:0, remScore:0, wakeScore:0};
    this.compareData = {counter:0, efficiencyScore:0, deepScore:0, lightScore:0, remScore:0, wakeScore:0};
  }
}