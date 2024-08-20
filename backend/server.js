const express = require('express');
const fs = require('fs');
const csv = require('csv-parser');
const app = express();
const port = 3000;

// Endpoint to get all car data
app.get('/api/cars', (req, res) => {
    const results = [];
    fs.createReadStream('../car.csv')  // Adjust the path to point to your car.csv
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
            // Transform the results to structure the data for make, model, and year
            const carData = results.reduce((acc, car) => {
                if (!acc[car.make]) {
                    acc[car.make] = {};
                }
                if (!acc[car.make][car.model]) {
                    acc[car.make][car.model] = new Set();
                }
                acc[car.make][car.model].add(car.year);
                return acc;
            }, {});

            // Convert Sets to Arrays for easier use in frontend
            Object.keys(carData).forEach(make => {
                Object.keys(carData[make]).forEach(model => {
                    carData[make][model] = Array.from(carData[make][model]);
                });
            });

            res.json(carData);
        });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
