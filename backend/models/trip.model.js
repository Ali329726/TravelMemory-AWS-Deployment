
const mongoose = require("../conn").mongoose;

const tripSchema = new mongoose.Schema({
  tripName: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 50
  },
  startDateOfJourney: {
    type: String,
    required: true
  },
  endDateOfJourney: {
    type: String,
    required: true
  },
  nameOfHotels: {
    type: String,
    default: ""
  },
  placesVisited: {
    type: String,
    default: ""
  },
  totalCost: {
    type: Number,
    min: 0,
    default: 0
  },
  tripType: {
    type: String,
    enum: ["backpacking", "leisure", "business"],
    default: "leisure"
  },
  experience: {
    type: String,
    default: ""
  },
  image: {
    type: String,
    default: ""
  },
  shortDescription: {
    type: String,
    required: true,
    trim: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Trip = mongoose.model("tripdetails", tripSchema);

module.exports = { Trip };
