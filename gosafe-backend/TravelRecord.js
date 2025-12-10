// TravelRecord.js
const mongoose = require('mongoose');

// Define the schema for the aggregated travel data
const travelRecordSchema = new mongoose.Schema({
    // Placeholder for OAuth 2.0. This will store the ID of the authenticated user[cite: 40].
    userId: {
        type: String,
        required: true 
        // In a real app, this ensures only authorized users can submit/retrieve data.
    },
    // The name of the location provided by the user (e.g., "Paris, France")
    locationName: {
        type: String,
        required: true,
        trim: true
    },
    // The aggregated JSON object containing both weather and advisory data[cite: 18].
    aggregatedData: {
        type: Object,
        required: true
    },
    // Timestamp for when the record was created
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create and export the model
const TravelRecord = mongoose.model('TravelRecord', travelRecordSchema);

module.exports = TravelRecord;