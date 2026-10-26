
const tripModel = require("../models/trip.model");

async function tripAdditionController(req, res) {
  try {
    const {
      tripName,
      startDateOfJourney,
      endDateOfJourney,
      nameOfHotels,
      placesVisited,
      totalCost,
      tripType,
      experience,
      image,
      shortDescription,
      featured
    } = req.body;

    // Validate required fields
    if (
      !tripName?.trim() ||
      !startDateOfJourney ||
      !endDateOfJourney ||
      !shortDescription?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Trip name, journey dates, and short description are required."
      });
    }

    // Validate trip cost
    if (
      totalCost !== undefined &&
      (!Number.isFinite(Number(totalCost)) || Number(totalCost) < 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Total cost must be a valid non-negative number."
      });
    }

    const trip = new tripModel.Trip({
      tripName,
      startDateOfJourney,
      endDateOfJourney,
      nameOfHotels,
      placesVisited,
      totalCost,
      tripType,
      experience,
      image,
      shortDescription,
      featured
    });

    const savedTrip = await trip.save();

    return res.status(201).json({
      success: true,
      message: "Trip created successfully.",
      data: savedTrip
    });
  } catch (error) {
    console.error("Error creating trip:", error.message);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Trip validation failed.",
        error: error.message
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to create trip."
    });
  }
}

async function getTripDetailsController(req, res) {
  try {
    const trips = await tripModel.Trip.find({}).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: trips.length,
      data: trips
    });
  } catch (error) {
    console.error("Error fetching trips:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch trips."
    });
  }
}

async function getTripDetailsByIdController(req, res) {
  try {
    const { id } = req.params;

    if (!/^[a-fA-F0-9]{24}$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid trip ID."
      });
    }

    const trip = await tripModel.Trip.findById(id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found."
      });
    }

    return res.status(200).json({
      success: true,
      data: trip
    });
  } catch (error) {
    console.error("Error fetching trip:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch trip."
    });
  }
}

module.exports = {
  tripAdditionController,
  getTripDetailsController,
  getTripDetailsByIdController
};
