function cleanTeamName(thisTeam) {
  // vervang elk mogelijke koppel teken door /
  // en maak beginhoofdletters van de namen
  let tm = thisTeam.replace(/[^a-zA-Z0-9]+/g, "/");
  // added 12-2-2026 Behalve als de speler twee letters heeft, dan heleaaml uppercase, omdat dat vaak initialen zijn

  var splitStr = tm.toLowerCase().split("/");
  for (var i = 0; i < splitStr.length; i++) {
    // You do not need to check if i is larger than splitStr length, as your for does that for you
    // Assign it back to the array
    splitStr[i] =
      splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    if (splitStr[i].length <= 2) {
      splitStr[i] = splitStr[i].toUpperCase();
    }
  }
  // Directly return the joined string
  return splitStr.sort().join("/");
}

export { cleanTeamName };