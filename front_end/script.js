document.addEventListener("DOMContentLoaded", function() {
    const carDetailsForm = document.getElementById("car-details-form");
    const searchBrowseSection = document.querySelector(".search-browse");
    const partsSection = document.querySelector(".parts-section");

    const makeSelect = document.getElementById("make");
    const modelSelect = document.getElementById("model");
    const yearSelect = document.getElementById("year");

    let carData;

    // Fetch the car data from the backend server
    fetch('http://localhost:3000/api/cars')
        .then(response => response.json())
        .then(data => {
            carData = data;
            populateMakeOptions();
        });

    // Populate Make dropdown
    function populateMakeOptions() {
        Object.keys(carData).forEach(make => {
            const option = document.createElement("option");
            option.value = make;
            option.textContent = make;
            makeSelect.appendChild(option);
        });
    }

    // Populate Model dropdown based on selected Make
    makeSelect.addEventListener("change", function() {
        modelSelect.innerHTML = ""; // Clear previous options
        const selectedMake = makeSelect.value;
        const models = Object.keys(carData[selectedMake]);

        models.forEach(model => {
            const option = document.createElement("option");
            option.value = model;
            option.textContent = model;
            modelSelect.appendChild(option);
        });

        modelSelect.disabled = false; // Enable model select after make is selected
        yearSelect.innerHTML = ""; // Clear year options
        yearSelect.disabled = true; // Disable year select until model is selected
    });

    // Populate Year dropdown based on selected Model
    modelSelect.addEventListener("change", function() {
        yearSelect.innerHTML = ""; // Clear previous options
        const selectedMake = makeSelect.value;
        const selectedModel = modelSelect.value;
        const years = carData[selectedMake][selectedModel];

        years.forEach(year => {
            const option = document.createElement("option");
            option.value = year;
            option.textContent = year;
            yearSelect.appendChild(option);
        });

        yearSelect.disabled = false; // Enable year select after model is selected
    });

    // Handle car details form submission
    carDetailsForm.addEventListener("submit", function(event) {
        event.preventDefault(); // Prevent the form from submitting the traditional way

        // Hide the form and show the search and browse options
        carDetailsForm.style.display = "none";
        searchBrowseSection.style.display = "block";
    });

    // Handle Search for a Part button click
    document.querySelector(".search-button").addEventListener("click", function() {
        alert("Search functionality will be implemented here.");
    });

    // Handle Browse All Parts button click
    document.querySelector(".browse-button").addEventListener("click", function() {
        searchBrowseSection.style.display = "none";
        partsSection.style.display = "block";
    });
});
