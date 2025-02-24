let events = []; // Array to store events

function addEvent() {
    const eventNameInput = document.getElementById("event-name");
    const eventName = eventNameInput.value.trim();
    
    if (eventName) {
        events.push({ name: eventName, probabilities: [] });
        eventNameInput.value = ""; // Clear input after adding
        alert("Event added!");
        displayEvents(); // Refresh the event display
    }
}

function enterProbability(index) {
    const eventList = document.getElementById("event-list");
    const eventItem = eventList.children[index];
    
    const probabilityInput = eventItem.querySelector('.probability-input');
    const wagerInput = eventItem.querySelector('.wager-input');
    
    const probability = probabilityInput.value;
    const wager = wagerInput.value;

    if (probability === "" || wager === "") {
        alert("Please enter both probability and wager.");
        return;
    }

    const probNum = parseFloat(probability);
    const wagerNum = parseFloat(wager);

    if (isNaN(probNum) || probNum < 0 || probNum > 100 || isNaN(wagerNum) || wagerNum < 0) {
        alert("Invalid input. Probability should be between 0-100% and wager should be a positive amount.");
        return;
    }

    events[index].probabilities.push({ probability: probNum, wager: wagerNum });
    alert("Probability submitted!");

    displayEvents(); // Refresh the event display
}

function displayEvents() {
    const eventList = document.getElementById("event-list");
    eventList.innerHTML = ""; // Clear existing list

    events.forEach((event, index) => {
        const li = document.createElement("li");
        
        const probabilityInput = document.createElement("input");
        probabilityInput.type = "number";
        probabilityInput.className = "probability-input";
        probabilityInput.placeholder = "Probability (%)";

        const wagerInput = document.createElement("input");
        wagerInput.type = "number";
        wagerInput.className = "wager-input";
        wagerInput.placeholder = "Wager Amount";

        const button = document.createElement("button");
        button.textContent = "Enter Probability";
        button.onclick = () => enterProbability(index);

        li.textContent = `${event.name}: `;
        li.appendChild(probabilityInput);
        li.appendChild(wagerInput);
        li.appendChild(button);
        eventList.appendChild(li);
        
        let totalWager = 0;
        let weightedProbability = 0;

        event.probabilities.forEach(({ probability, wager }) => {
            totalWager += wager;
            weightedProbability += (probability / 100) * wager; // Convert to decimal for calculation
        });

        const overallProbability = totalWager > 0 ? (weightedProbability / totalWager) * 100 : 0; // Calculate overall probability

        const overallProbText = document.createElement("span");
        overallProbText.textContent = ` Overall Probability: ${overallProbability.toFixed(2)}% (based on ${totalWager} wagered)`;
        li.appendChild(overallProbText);
    });
}

function initializeDisplay() {
    const addEventButton = document.getElementById("add-event");
    addEventButton.onclick = addEvent;
    displayEvents(); // Initial display of events
}

// Initialize display when the script is loaded
initializeDisplay();