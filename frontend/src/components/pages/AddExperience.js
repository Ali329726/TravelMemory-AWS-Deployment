import React, { useState } from "react";
import axios from "axios";
import { baseUrl } from "../../url";

export default function AddExperience() {
  const [loading, setLoading] = useState(false);

  const [formdata, setFormdata] = useState({
    tripName: "",
    startDateOfJourney: "",
    endDateOfJourney: "",
    nameOfHotels: "",
    placesVisited: "",
    totalCost: "",
    experience: "",
    image: "",
    images: ["", "", ""],
    tripType: "",
    featured: false,
    shortDescription: "",
  });

  const submitForm = async () => {
    setLoading(true);

    try {
      const response = await axios.post(`${baseUrl}/trip`, formdata);

      console.log("Trip added:", response.data);

      alert("Trip added successfully!");

      setFormdata({
        tripName: "",
        startDateOfJourney: "",
        endDateOfJourney: "",
        nameOfHotels: "",
        placesVisited: "",
        totalCost: 0,
        experience: "",
        image: "",
        images: ["", "", "", "", "", ""],
        tripType: "",
        featured: false,
        shortDescription: "",
      });
    } catch (error) {
      console.error("Error adding trip:", error);
      alert("Failed to add trip. Please check the backend.");
    }

    setLoading(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="tm-add-page">
      <div className="tm-add-container">
        {/* Trip Name */}
        <div className="mb-3">
          <label className="form-label">Trip Name</label>
          <input
            o
            type="text"
            className="form-control"
            placeholder="Add your Trip Name"
            value={formdata.tripName}
            onChange={(e) =>
              setFormdata({
                ...formdata,
                tripName: e.target.value,
              })
            }
          />
        </div>

        {/* Trip Dates */}
        <div className="mb-3">
          <label className="form-label">Trip Date</label>

          <div className="row">
            <div className="col-6">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                className="form-control"
                value={formdata.startDateOfJourney}
                onChange={(e) =>
                  setFormdata({
                    ...formdata,
                    startDateOfJourney: e.target.value,
                  })
                }
              />
            </div>

            <div className="col-6">
              <label className="form-label">End Date</label>
              <input
                type="date"
                className="form-control"
                value={formdata.endDateOfJourney}
                onChange={(e) =>
                  setFormdata({
                    ...formdata,
                    endDateOfJourney: e.target.value,
                  })
                }
              />
            </div>
          </div>
        </div>

        {/* Hotel */}
        <div className="mb-3">
          <label className="form-label">Name of Hotel</label>

          <input
            type="text"
            className="form-control"
            placeholder="Add your Hotel Name"
            value={formdata.nameOfHotels}
            onChange={(e) =>
              setFormdata({
                ...formdata,
                nameOfHotels: e.target.value,
              })
            }
          />
        </div>

        {/* Trip Type and Cost */}
        <div className="mb-3">
          <div className="row">
            <div className="col-6">
              <label className="form-label">Trip Type</label>

              <select
                className="form-select"
                value={formdata.tripType}
                onChange={(e) =>
                  setFormdata({
                    ...formdata,
                    tripType: e.target.value,
                  })
                }
              >
                <option value="">Select One</option>
                <option value="backpacking">Backpacking</option>
                <option value="family">Family</option>
                <option value="leisure">Leisure</option>
                <option value="business">Business</option>
              </select>
            </div>

            <div className="col-6">
              <label className="form-label">Total Cost</label>

              <input
                type="number"
                className="form-control"
                placeholder="8500"
                value={formdata.totalCost}
                onChange={(e) =>
                  setFormdata({
                    ...formdata,
                    totalCost: e.target.value,
                  })
                }
              />
            </div>
          </div>
        </div>

        {/* Places */}
        <div className="mb-3">
          <label className="form-label">Places Visited</label>

          <textarea
            className="form-control"
            rows="3"
            placeholder="Charminar, Golconda Fort, Hussain Sagar..."
            value={formdata.placesVisited}
            onChange={(e) =>
              setFormdata({
                ...formdata,
                placesVisited: e.target.value,
              })
            }
          />
        </div>

        {/* Featured */}
        <div className="mb-3">
          <label className="form-label">Featured Trip?</label>

          <div className="form-check">
            <input
              type="radio"
              className="form-check-input"
              value="true"
              checked={formdata.featured === true}
              onChange={() =>
                setFormdata({
                  ...formdata,
                  featured: true,
                })
              }
            />
            <label className="form-check-label">True</label>
          </div>

          <div className="form-check">
            <input
              type="radio"
              className="form-check-input"
              value="false"
              checked={formdata.featured === false}
              onChange={() =>
                setFormdata({
                  ...formdata,
                  featured: false,
                })
              }
            />
            <label className="form-check-label">False</label>
          </div>
        </div>

        {/* Main Image */}
        <div className="mb-3">
          <label className="form-label">Main Trip Image</label>

          <input
            type="text"
            className="form-control"
            placeholder="https://example.com/main-image.jpg"
            value={formdata.image}
            onChange={(e) =>
              setFormdata({
                ...formdata,
                image: e.target.value,
              })
            }
          />
        </div>

        {/* Additional Images */}
        <div className="mb-3">
          <label className="form-label">Additional Trip Images</label>

          {formdata.images.map((image, index) => (
            <input
              key={index}
              type="text"
              className="form-control mb-2"
              placeholder={`Image ${index + 1} URL`}
              value={image}
              onChange={(e) => {
                const updatedImages = [...formdata.images];

                updatedImages[index] = e.target.value;

                setFormdata({
                  ...formdata,
                  images: updatedImages,
                });
              }}
            />
          ))}
        </div>

        {/* Short Description */}
        <div className="mb-3">
          <label className="form-label">Short Description</label>

          <textarea
            className="form-control"
            rows="2"
            placeholder="Write Short Description"
            value={formdata.shortDescription}
            onChange={(e) =>
              setFormdata({
                ...formdata,
                shortDescription: e.target.value,
              })
            }
          />
        </div>

        {/* Experience */}
        <div className="mb-3">
          <label className="form-label">Experience</label>

          <textarea
            className="form-control"
            rows="5"
            placeholder="Write Complete Details about your experience"
            value={formdata.experience}
            onChange={(e) =>
              setFormdata({
                ...formdata,
                experience: e.target.value,
              })
            }
          />
        </div>

        {/* Submit */}
        <div className="mb-3" style={{ textAlign: "center" }}>
          <button type="button" className="btn btn-primary" onClick={submitForm}>
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
