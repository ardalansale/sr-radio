// Denna fil ska innehålla din lösning till uppgiften (moment 5)

"use strict";

/*  Delar till ej obligatorisk funktionalitet, som kan ge poäng för högre betyg
*   Radera rader för funktioner du vill visa på webbsidan. */
document.getElementById("player").style.display = "none";      // Radera denna rad för att visa musikspelare
document.getElementById("shownumrows").style.display = "none"; // Radera denna rad för att visa antal träffar

/* Här under börjar du skriva din JavaScript-kod */



var allChannels = []; // Tom array som ska innehålla radiokanaler hämtade från API:et
var selectedChannel = null; // Variabel som tillfälligt lagrar vilken radiokanal användaren har klickat på

// (NY!) Hjälpfunktion: omvandlar SR:s datumformat "/Date(…)/" till ett riktigt Date-objekt
function parseSRDate(srDate) {
    var timestamp = parseInt(srDate.replace("/Date(", "").replace(")/", "")); // Plockar ut siffrorna ur strängen
    return new Date(timestamp); // Returnerar ett Date-objekt
}

// Funktion för att hämta kanaler från API:et
function fetchChannels () {
    var url = "https://api.sr.se/api/v2/channels?format=json"; // URL-adressen till API:et (används för att veta var kanaldata ska hämtas ifrån)

    fetch(url) // Skickar en begäran till API:et för att hämta kanaldata
    .then(function(response) {
        return response.json(); // Omvandlar svaret från API:en till JSON
    })
    .then (function(data) {
        allChannels = data.channels; // Sparar listan med kanaler i allChannels-arrayen
        displayChannelList(); // Visar kanalerna när de är hämtade
    });
};

// Funktion som visar alla radiokanaler i listan på sidan
function displayChannelList() {
    var list = document.getElementById("mainnavlist"); // Hittar <ul>-elementet där kanalerna ska visas
    list.innerHTML = ""; // Tömmer listan så att den inte fylls på flera gånger

    // Loop som går igenom varje kanal i allChannels 
    for (var i = 0; i < allChannels.length; i++) {
        var channel = allChannels[i]; // Hämtar kanal
        var li = document.createElement("li"); // Skapar ett nytt <li>-element
        
        li.textContent = channel.name; // Visar kanalens namn som text i listan
        li.title = channel.tagline;    // Sätter HTML-attributet "title" på varje <li>-element (visar kanalens slogan när man hovrar med muspekaren)

        // Gör kanalerna klickbara
        li.addEventListener("click", function(channelData) { // Gör detta när användaren klickar
            return function() {
                selectedChannel = channelData; // Spara vilken kanal som användaren klickade på
                showSchedule(channelData.id); // Anropar en ny funktion som hämtar program/tablå
            };
        }(channel));

        list.appendChild(li); // Lägger till <li>-elementet i listan
    }
}

// Funktion som hämtar programtablån för en vald kanal
function showSchedule(channelId) {
    var url = "https://api.sr.se/api/v2/scheduledepisodes?channelid=" + channelId + "&format=json&size=50";
    // Bygger URL:en till API:et med kanalens ID

    fetch(url) // Skickar en begäran till API:et för att hämta programtablån
    .then(function(response) {
        return response.json(); // Omvandlar svaret från API:et till JSON
    })
    .then(function(data) {
        
var now = new Date(); // Hämtar aktuell tid
var futurePrograms = []; // Tom array som ska innehålla program som ännu inte är slut

// (NY!) Loop som går igenom alla program i tablån
for (var i = 0; i < data.schedule.length; i++) {
    var end = parseSRDate(data.schedule[i].endtimeutc); // Gör om sluttiden till ett Date-objekt
    if (end > now) { // Kollar om programmet fortfarande pågår eller kommer senare
        futurePrograms.push(data.schedule[i]); // Lägger till programmet i arrayen futurePrograms
    }
}

displayPrograms(futurePrograms, selectedChannel.name); // Anropar en ny funktion som visar program


    });
}

// Funktion som visar programtablån för en vald kanal
function displayPrograms(programs, channelName) {
    var infoDiv = document.getElementById("info"); // Hittar <div>-elementet där programmen ska visas
    var html = "<h2>" + channelName + "</h2>"; // Skapar en rubrik med kanalens namn

    // Loop som går igenom alla program i listan
    for (var i = 0; i < programs.length; i++) {
        var program = programs[i]; // Hämtar aktuellt program i loopen

        // Formaterar start- och sluttid till HH:MM
        var startTime = parseSRDate(program.starttimeutc).toLocaleTimeString("sv-SE", {
            hour: "2-digit",
            minute: "2-digit"
        });
        var endTime = parseSRDate(program.endtimeutc).toLocaleTimeString("sv-SE", {
            hour: "2-digit",
            minute: "2-digit"
        });

        // (NY!) Bygger upp HTML-strukturen för varje program
        html += "<article>"; // || "" - 
        html += "<h3>" + program.title + "</h3>"; // Titel på programmet
        html += "<h4>" + (program.subtitle || "") + "</h4>"; // Underrubrik (|| "" för att undvika att det står undefined om något saknas)
        html += "<h5>" + startTime + " - " + endTime + "</h5>"; // Start- och sluttid
        html += "<p>" + (program.description || "") + "</p>"; // Beskrivning (|| "" för att undvika att det står undefined om något saknas)
        html += "</article>";
    }

    infoDiv.innerHTML = html; // Skriver ut hela programtablån i <div id="info">
}

// Starta programmet
fetchChannels();

