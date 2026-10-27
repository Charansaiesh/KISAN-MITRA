/**
 * KisanMitra Weather Controller
 * Serves real-time weather, 7-day agricultural forecasts, and spray/drainage advisories
 */

const { WeatherService } = require('../services/WeatherService');

exports.getWeather = async (req, res) => {
  try {
    const { location, lat, lon } = req.query;

    if (lat && lon) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lon);
      if (isNaN(latitude) || isNaN(longitude)) {
        return res.status(400).json({
          success: false,
          error_code: "INVALID_COORDINATES",
          message: "Valid numeric latitude and longitude are required."
        });
      }
      const data = await WeatherService.getWeatherByCoordinates(latitude, longitude, location || "User Coordinates");
      return res.status(200).json(data);
    }

    const queryLocation = (location && typeof location === 'string' && location.trim())
      ? location.trim()
      : "Hyderabad, Telangana";

    const data = await WeatherService.getWeatherByLocation(queryLocation);
    return res.status(200).json(data);
  } catch (error) {
    console.error("Weather Controller Error:", error.message);
    const isNotFound = error.message && error.message.toLowerCase().includes("could not be found");
    const status = isNotFound ? 404 : 500;
    return res.status(status).json({
      success: false,
      error_code: isNotFound ? "LOCATION_NOT_FOUND" : "WEATHER_SERVICE_ERROR",
      message: error.message || "Failed to retrieve live weather data. Please try again."
    });
  }
};
