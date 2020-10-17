const express = require("express");
const cors = require("cors");
require("dotenv").config();
const request = require("request");
const port = process.env.PORT || 5000;
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const api = {
  key: process.env.API_KEY,
  baseurl: "https://api.openweathermap.org/data/2.5/",
};

app.get("/", (req, res) => {
  res.status(200).json({
    message: "home route for weather-api",
    availableRoutes: `GET ${req.headers.host}/api/v1/getweather/{cityname}`,
  });
});
app.get("/api/v1/getweather/:cityname", async (req, res) => {
  if (
    !req.params.cityname ||
    req.params.cityname == undefined ||
    req.params.cityname == null
  ) {
    res.status(401).json({
      error: "required parameter not supplied",
    });
    return;
  }
  let cityname = req.params.cityname.trim().toLocaleLowerCase();
  request(
    `${api.baseurl}weather?q=${cityname}&units=metric&APPID=${api.key}`,
    (error, response, body) => {
      if (response.statusCode !== 200) {
        res.status(501).json({
          error: "error retrieving requested data",
          message: body.message,
          response: response.body,
        });
        return;
      }
      let coords = JSON.parse(body).coord;

      request(
        `${api.baseurl}onecall?lat=${coords.lat}&lon=${coords.lon}&exclude=hourly&units=metric&appid=${api.key}`,
        (error, response, body) => {
          if (response.statusCode !== 200) {
            res.status(501).json({
              error: "error retrieving requested data",
              message: body.message,
              response: response.body,
            });
            return;
          }

          let data = JSON.parse(body);
          res.status(200).json({
            current_condition: data.current,
            daily_forecast: data.daily,
            city: cityname,
            helpWithIcons:
              "use https://openweathermap.org/img/w/{icon_from_json}.png if you want to display icons from api",
          });
        }
      );
    }
  );
});
//404 routes for post & get
app.get("*", (req, res) => {
  res.status(400).json({
    error: "route does not exist",
  });
});
app.post("*", (req, res) => {
  res.status(400).json({
    error: "route does not exist",
  });
});

app.listen(port, function (req, res) {
  console.log("server running on port :" + port);
});
