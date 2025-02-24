// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.3/firebase-app.js";
import { getDatabase, ref, set, get, remove } from "https://www.gstatic.com/firebasejs/9.8.3/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAyxBThOb3s68Jl8ug3haSKU9GYe84Bq1g",
    authDomain: "probability-app-34b58.firebaseapp.com",
    databaseURL: "https://probability-app-34b58-default-rtdb.firebaseio.com",
    projectId: "probability-app-34b58",
    storageBucket: "probability-app-34b58.firebasestorage.app",
    messagingSenderId: "436168932168",
    appId: "1:436168932168:web:ad998cdf2ff01487ee117d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Function to calculate overall probability for an individual event
function calculateOverallProbability(probability, totalWager, newWager) {
    if (totalWager > 0) {
        // Calculate the weighted probability
        const weightedProbability = (probability * newWager) / totalWager;
        return weightedProbability;
    }
    return 0; // Return 0 if total wager is 0
}


// Function to add an event
window.addEvent = function() {
    const eventName = document.getElementById("event-name").value;

    console.log("Adding event:", eventName); // Debug log

    if (!eventName) {
        alert("Please enter an event name.");
        return;
    }

    const eventRef = ref(database, 'events/' + eventName);
    set(eventRef, {
        name: eventName,
        probability: null,
        wager: null,
        overallProbability: null
    })
    .then(() => {
        alert("Event added successfully!");
        document.getElementById("event-name").value = ''; // Clear input
        initializeDisplay(); // Refresh event list
    })
    .catch((error) => {
        console.error("Error adding event:", error);
    });
}

// Function to update probability and wager for an event
window.updateEvent = function(eventName) {
    const probability = parseFloat(document.getElementById(`probability-${eventName}`).value);
    const wager = parseFloat(document.getElementById(`wager-${eventName}`).value);

    if (isNaN(probability) || isNaN(wager) || probability < 0 || probability > 100) {
        alert("Please enter a valid probability (0-100) and wager.");
        return;
    }

    const eventRef = ref(database, 'events/' + eventName);

    // Retrieve existing data first
    get(eventRef)
        .then((snapshot) => {
            let totalWager = 0;
            if (snapshot.exists()) {
                const eventData = snapshot.val();
                totalWager = eventData.wager !== null && !isNaN(eventData.wager) ? eventData.wager : 0; // Get existing wager, ensure it's a number
            }

            // Log current values for debugging
            console.log("Current Total Wager:", totalWager);
            console.log("New Wager Input:", wager);

            // Ensure totalWager is valid and add the new wager
            totalWager += isNaN(wager) ? 0 : wager; // Only add if wager is valid

            // Log the updated total wager
            console.log("Updated Total Wager:", totalWager);

            // Only set values if totalWager is a valid number
            if (!isNaN(totalWager) && totalWager >= 0) {
                // Calculate overall probability using the new wager
                const overallProbability = calculateOverallProbability(probability, totalWager, wager);

                // Update the event with the new values
                set(eventRef, {
                    name: eventName,
                    probability: probability,
                    wager: totalWager > 0 ? totalWager : null, // Set to null if totalWager is 0
                    overallProbability: totalWager > 0 ? overallProbability : null // Set to null if totalWager is 0
                })
                .then(() => {
                    alert("Event updated successfully!");
                    initializeDisplay(); // Refresh event list
                })
                .catch((error) => {
                    console.error("Error updating event:", error);
                });
            } else {
                alert("Total wager calculation resulted in an invalid number.");
            }
        })
        .catch((error) => {
            console.error("Error fetching event data:", error);
        });
}




// Function to delete an event
window.deleteEvent = function(eventName) {
    const eventRef = ref(database, 'events/' + eventName);
    remove(eventRef)
        .then(() => {
            alert("Event deleted successfully!");
            initializeDisplay(); // Refresh event list
        })
        .catch((error) => {
            console.error("Error deleting event:", error);
        });
}

// Function to initialize the display of events
async function initializeDisplay() {
    const eventContainer = document.getElementById('event-list');
    eventContainer.innerHTML = ''; // Clear previous events

    const dbRef = ref(database, 'events');
    get(dbRef)
        .then((snapshot) => {
            if (snapshot.exists()) {
                snapshot.forEach((childSnapshot) => {
                    const eventData = childSnapshot.val();
                    const eventName = eventData.name.replace(/'/g, "\\'"); // Escape single quotes for JavaScript

                    eventContainer.innerHTML += `
                        <div>
                            <h3>${eventData.name}</h3>
                            <input type="number" id="probability-${eventData.name}" placeholder="Probability (%)" value="${eventData.probability !== null ? eventData.probability : ''}">
                            <input type="number" id="wager-${eventData.name}" placeholder="Wager ($)" value="${eventData.wager !== null ? eventData.wager : ''}">
                            <button onclick="updateEvent('${eventData.name}')">Add Probability and Wager</button>
                            <p>Total Wager: $${eventData.wager !== null ? eventData.wager : 'N/A'}</p>
                            <p>Overall Estimated Probability: ${eventData.overallProbability !== null ? (eventData.overallProbability) + '%' : 'N/A'}</p>
                            <button onclick="deleteEvent('${eventName}')">Delete Event</button>
                        </div>
                    `;
                });
            } else {
                eventContainer.innerHTML = 'No events found.';
            }
        })
        .catch((error) => {
            console.error("Error fetching events:", error);
        });
}

// Call initializeDisplay when the page loads
window.onload = initializeDisplay;
