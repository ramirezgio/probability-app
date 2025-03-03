// Import necessary Firebase functions from the Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.3/firebase-app.js";
import { getDatabase, ref, set, get, remove } from "https://www.gstatic.com/firebasejs/9.8.3/firebase-database.js";

// Firebase configuration object with project-specific credentials
const firebaseConfig = {
    apiKey: "AIzaSyAyxBThOb3s68Jl8ug3haSKU9GYe84Bq1g",
    authDomain: "probability-app-34b58.firebaseapp.com",
    databaseURL: "https://probability-app-34b58-default-rtdb.firebaseio.com",
    projectId: "probability-app-34b58",
    storageBucket: "probability-app-34b58.firebasestorage.app",
    messagingSenderId: "436168932168",
    appId: "1:436168932168:web:ad998cdf2ff01487ee117d"
};

// Initialize Firebase app with the given configuration
const app = initializeApp(firebaseConfig);
// Initialize Firebase Realtime Database
const database = getDatabase(app);

// Function to calculate the overall probability based on weighted contributions
function calculateOverallProbability(probability, totalWager, newWager) {
    if (totalWager > 0) {
        // Compute weighted probability using the new wager
        const weightedProbability = (probability * newWager) / totalWager;
        return weightedProbability;
    }
    return 0; // Default to 0 if there's no wager
}

// Function to add a new event to the database
window.addEvent = function() {
    const eventName = document.getElementById("event-name").value; // Get event name input

    console.log("Adding event:", eventName); // Debugging log

    if (!eventName) {
        alert("Please enter an event name."); // Alert if no name is entered
        return;
    }

    const eventRef = ref(database, 'events/' + eventName); // Create a database reference for the event
    set(eventRef, {
        name: eventName,
        probability: null, // Placeholder for probability
        wager: null, // Placeholder for wager
        overallProbability: null // Placeholder for calculated probability
    })
    .then(() => {
        alert("Event added successfully!"); // Confirm success
        document.getElementById("event-name").value = ''; // Clear input field
        initializeDisplay(); // Refresh the event list display
    })
    .catch((error) => {
        console.error("Error adding event:", error); // Log errors
    });
}

// Function to update an event's probability and wager
window.updateEvent = function(eventName) {
    // Get input elements for probability and wager
    const probabilityInput = document.getElementById(`probability-${eventName}`);
    const wagerInput = document.getElementById(`wager-${eventName}`);

    // Convert inputs to numerical values
    const probability = parseFloat(probabilityInput.value);
    const wager = parseFloat(wagerInput.value);

    // Validate input values
    if (isNaN(probability) || isNaN(wager) || probability < 0 || probability > 100 || wager <= 0) {
        alert("Please enter a valid probability (0-100) and a positive wager.");
        return;
    }

    const eventRef = ref(database, 'events/' + eventName); // Reference to event in database

    get(eventRef).then((snapshot) => {
        let totalWager = 0;
        let weightedSum = 0;

        if (snapshot.exists()) {
            const eventData = snapshot.val();

            // Retrieve existing wager and probability sum if available
            totalWager = eventData.wager ? eventData.wager : 0;
            weightedSum = eventData.weightedSum ? eventData.weightedSum : 0;
        }

        // Update total wager and weighted probability sum
        totalWager += wager;
        weightedSum += probability * wager;

        // Calculate new overall probability
        const overallProbability = totalWager > 0 ? (weightedSum / totalWager) : 0;

        // Save updated event details back to the database
        set(eventRef, {
            name: eventName,
            probability: probability,  // Latest probability input
            wager: totalWager,  // Updated total wager
            weightedSum: weightedSum,  // Store weighted sum for future calculations
            overallProbability: overallProbability  // Updated overall probability
        }).then(() => {
            alert("Event updated successfully!"); // Confirmation message

            // Clear input fields after update
            probabilityInput.value = '';
            wagerInput.value = '';

            // Refresh event list display
            initializeDisplay();
        }).catch((error) => {
            console.error("Error updating event:", error); // Log errors
        });
    }).catch((error) => {
        console.error("Error fetching event data:", error); // Log database retrieval error
    });
};

// Function to delete an event from the database
window.deleteEvent = function(eventName) {
    const eventRef = ref(database, 'events/' + eventName); // Reference to the event in the database
    remove(eventRef)
        .then(() => {
            alert("Event deleted successfully!"); // Confirmation message
            initializeDisplay(); // Refresh event list
        })
        .catch((error) => {
            console.error("Error deleting event:", error); // Log errors
        });
}

// Function to initialize and display the list of events from the database
async function initializeDisplay() {
    const eventContainer = document.getElementById('event-list'); // Get container for event list
    eventContainer.innerHTML = ''; // Clear existing events

    const dbRef = ref(database, 'events'); // Reference to all events in the database
    get(dbRef)
        .then((snapshot) => {
            if (snapshot.exists()) {
                snapshot.forEach((childSnapshot) => {
                    const eventData = childSnapshot.val();
                    const eventName = eventData.name.replace(/'/g, "\\'"); // Escape single quotes for safety

                    // Append event details to the event container
                    eventContainer.innerHTML += `
                        <div>
                            <h3>${eventData.name}</h3>
                            <input type="number" id="probability-${eventData.name}" placeholder="Probability (%)">
                            <input type="number" id="wager-${eventData.name}" placeholder="Wager ($)">
                            <button onclick="updateEvent('${eventData.name}')">Add Probability and Wager</button>
                            <p>Total Wager: ${eventData.wager ? `$${eventData.wager}` : 'TBD'}</p>
                            <p>Probability: ${!eventData.overallProbability && eventData.overallProbability !== 0 ? 'TBD' : Math.round(eventData.overallProbability) + '%'}</p>
                            <button onclick="deleteEvent('${eventName}')">Delete Event</button>
                        </div>
                    `;
                });
            } else {
                eventContainer.innerHTML = 'No events found.'; // Display message if no events exist
            }
        })
        .catch((error) => {
            console.error("Error fetching events:", error); // Log database retrieval error
        });
}

// Call initializeDisplay when the page loads to display existing events
window.onload = initializeDisplay;