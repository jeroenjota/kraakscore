# Kraakscore

The app is for (card) tournaments between couples or individuals. Could also be used for other tournaments where point scoring is involved.
> The app uses localstorage to save results and player/couple names. The system saves the current tournament data in localStorage, util you press the "[*OK*]" button. Then it will ask you if you want to save to the backend. This is still very experimental. The data are not suitable for longterm analyses etc.

The app was developped for *Café de Laurierboom*, **the best bar in Amsterdam** where we play a '**Kraak**' tournament every two weeks.

## NEW feature: Season ranking 
For each individual player you can analyse the results in the saved tournaments. Points are awarded for the position (1-4) at the end of the tournament. The points are calculated as follows:
- 1st place: 12 Points
- 2nd place: 9 Points
- 3rd place: 6 Points
- 4th place: 3 Points
- All other players: 1 Point for participating.
For now these are fixed numbers, but in the future they might be configurable in the settings.
The season (6 months) result will be calculated over the best 8 tournament positions of each player. The standings can be calculated at any time using the data in the API.

## Usage
If there are old data from a previous tournament, Click [*reset*]. All tournament data can be saved to the backend API and will then be deleted in de localstorage. The saved teams/players will be available. 

Saved tournaments can be edited (CAREFULL!), printed and deleted with the buttons in de header.

For new teams or players, fill in the name(s) of the player/teams in the **Teamname** field and press enter (or click "[*OK*]" )
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
The maximum number of teams (normally 2 players) in a tournament is 8. When there are more than 6 players/teams, you get the choice of splitting the tournament up in two groups and play final/third-place matches after the normal rounds.

### Workflow
After the schedule is created, you can fill in the scores for each team after each round.
The Standings will be updated immediatly
At the end of the tournament you can generate a PDF with the results [*Afdrukken*]. The ranking numbers will also be updated.
The PDF will be stored on the server and you can share the link to the PDF with WhatsApp, or you can generate a QR-code which the players can scan it download the results PDF.
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

