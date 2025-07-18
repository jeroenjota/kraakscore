# Kraakscore

The app is for (card) tournaments between couples or individuals. Could also be used for other tournaments where point scoring is involved.
> The app uses localstorage to save results and player/couple names. The system only saves the current tournament data. So not suitable for longterm analyses etc.
Localstorage is not meant for this.

The app was developped for *Café de Laurierboom*, **the best bar in Amsterdam** where we play a '**Kraak**' tournament every two weeks.

## Usage
If there are old data from a previous tournament, Click [*reset*]. All tournament data will be deleted, the saved teams/players will still be available. (As long as your browsers LocalStorage is not reset)

For new teams or players, fill in the name(s) of the player/teams in the **Teamname** field and press enter (or click "[*Meedoen*]" )
Saved teams & players can be selected from the list in the **Opgeslagen teams** section

You need at least two participants (*duh!*)

Click [*Start toernooi*] and the schema will be created. If (some of) the names you have entered are not yet known in localstorage, you will be asked if you want to add them.

> If you enter two names seperated by some sort of seperation character (space, comma, dash etc) this will be replaced by a forward slash (/) and the first character of each name will be capitalized.

### Mouse use
By clicking on a Name in the **Teams:** you can edit the name. If you CTRL-Click on the name it will be removed from the tournament.

CTRL-Click on a name in the **Opgeslagen teams** section allows you to delete this team from local storage.

Click on the **Opgeslagen teams** header will add the first 8 teams to the tournament

CTRL Click on **Teams:** will remove all the chosen teams from the tournament (but not from LocalStorage)

> For touchscreens, instead of **CTRL-click** you can **longpress**

### Maximum players
The maximum number of participants in a tournament is 8. When there are more than 6 players/teams, you get the choice of splitting the tournament up in two groups and play final/third-place matches after the normal rounds.

### Workflow
After the schedule is created, you can fill in the scores for each team after each round.
The Standings will be updated immediatly
At any time during the tournament you can generate a PDF with the results [*Afdrukken*]. At the end of the tournament the final standings are added to this PDF
#### Groups
If you want to split up the tournament (possible with more than 6 participants), the app will randomly create groups. The winners of the groups will play the finals, the numbers 2 will play for the third place.
> There is no scoring input for the numbers 3 and 4, because in **De Laurierboom**, they never win a price ;-)

## Restrictions
This app is not very well suited for smaller screens (Mobile phones etc)

### Disclaimer
This is more or less my first serious Vue3 project. Built in Vite.
I cannot be held accountable for any problems that arise from using the app.

#### Build with Vue3 in Vite

Still learning!
*© 2025 Jota Services*

