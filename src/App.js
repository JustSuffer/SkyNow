import React from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function getWeatherIcon(wmoCode) {
  const icons = new Map([
    [[0], "☀️"],
    [[1], "🌤"],
    [[2], "⛅️"],
    [[3], "☁️"],
    [[45, 48], "🌫"],
    [[51, 56, 61, 66, 80], "🌦"],
    [[53, 55, 63, 65, 57, 67, 81, 82], "🌧"],
    [[71, 73, 75, 77, 85, 86], "🌨"],
    [[95], "🌩"],
    [[96, 99], "⛈"],
  ]);
  const arr = [...icons.keys()].find((key) => key.includes(wmoCode));
  if (!arr) return "NOT FOUND";
  return icons.get(arr);
}

function convertToFlag(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

function formatDay(dateStr) {
  return new Intl.DateTimeFormat("en", {
    weekday: "short",
  }).format(new Date(dateStr));
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      location: "",
      isLoading: false,
      displayLocation: "",
      weather: {},
    };
    this.fetchWeather = this.fetchWeather.bind(this);
    this.getCurrentLocationWeather = this.getCurrentLocationWeather.bind(this);
  }

  async fetchWeather() {
    try {
      this.setState({ isLoading: true });

      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          this.state.location
        )}`
      );
      const geoData = await geoRes.json();

      if (!geoData.results || geoData.results.length === 0) {
        toast.error("Location not found ❌", { className: "alert" });
        return;
      }

      const { latitude, longitude, name, country_code } = geoData.results.at(0);

      this.setState({
        displayLocation: `${name} ${convertToFlag(country_code)}`,
      });

      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&timezone=auto&daily=weathercode,temperature_2m_max,temperature_2m_min&hourly=temperature_2m,relativehumidity_2m,windspeed_10m,precipitation,weathercode`
      );
      const weatherData = await weatherRes.json();

      if (!weatherData.daily) {
        toast.error("Weather information could not be obtained 🌐", {
          className: "alert",
        });
        return;
      }

      this.setState({ weather: weatherData });
    } catch (err) {
      console.error(err);
      toast.error("An error occurred 🚨", { className: "alert" });
    } finally {
      this.setState({ isLoading: false });
    }
  }

  getCurrentLocationWeather() {
    if (!navigator.geolocation) {
      toast.error("Your browser does not support location feature ❌", {
        className: "alert",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          this.setState({ isLoading: true });

          // ✅ Direkt konum koordinatlarını kullan
          const weatherRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&timezone=auto&daily=weathercode,temperature_2m_max,temperature_2m_min&hourly=temperature_2m,relativehumidity_2m,windspeed_10m,precipitation,weathercode`
          );
          const weatherData = await weatherRes.json();

          if (!weatherData.daily) {
            toast.error("Couldn't get weather forecast 🌐", {
              className: "alert",
            });
            return;
          }

          // ✅ DisplayLocation basitçe "Your Location" olsun
          this.setState({
            displayLocation: "📍 Your Location",
            weather: weatherData,
          });
        } catch (err) {
          console.error(err);
          toast.error(
            "An error occurred while retrieving weather from the location 🚨",
            {
              className: "alert",
            }
          );
        } finally {
          this.setState({ isLoading: false });
        }
      },
      (error) => {
        console.error(error);
        toast.error("Location permission denied ❌", { className: "alert" });
      }
    );
  }

  render() {
    return (
      <div className="app">
        <h1>SkyNow</h1>
        <div>
          <input
            type="text"
            placeholder="Search from location..."
            value={this.state.location}
            onChange={(e) => this.setState({ location: e.target.value })}
          />
        </div>
        <button onClick={this.fetchWeather} className="button">
          Get Weather
        </button>

        {this.state.isLoading && <p className="loader">Loading...</p>}

        {this.state.weather.daily && this.state.weather.daily.weathercode && (
          <Weather
            weather={this.state.weather}
            location={this.state.displayLocation}
          />
        )}
        <ToastContainer position="bottom-right" autoClose={3000} />

        <button onClick={this.getCurrentLocationWeather} className="button">
          📍 Weather from Your Location
        </button>
      </div>
    );
  }
}

export default App;

class Weather extends React.Component {
  componentWillUnmount() {
    this.setState({});
  }

  render() {
    const { daily, hourly } = this.props.weather;
    const {
      temperature_2m_max: max,
      temperature_2m_min: min,
      time: dates,
      weathercode: codes,
    } = daily;

    return (
      <div>
        <h2>Weather {this.props.location}</h2>
        <ul className="weather">
          {dates.map((date, i) => (
            <Day
              date={date}
              max={max.at(i)}
              min={min.at(i)}
              code={codes.at(i)}
              key={date}
              isToday={i === 0}
              hourly={hourly ? {
                time: hourly.time.slice(i * 24, (i + 1) * 24),
                temperature_2m: hourly.temperature_2m.slice(i * 24, (i + 1) * 24),
                relativehumidity_2m: hourly.relativehumidity_2m.slice(i * 24, (i + 1) * 24),
                windspeed_10m: hourly.windspeed_10m.slice(i * 24, (i + 1) * 24),
                precipitation: hourly.precipitation.slice(i * 24, (i + 1) * 24),
                weathercode: hourly.weathercode.slice(i * 24, (i + 1) * 24),
              } : null}
            />
          ))}
        </ul>
      </div>
    );
  }
}

class Day extends React.Component {
  constructor(props) {
    super(props);
    this.state = { showHourly: false };
    this.toggleHourly = this.toggleHourly.bind(this);
  }

  toggleHourly() {
    this.setState((curr) => ({ showHourly: !curr.showHourly }));
  }

  render() {
    const { date, max, min, code, isToday, hourly } = this.props;

    return (
      <li className="day">
        <span>{getWeatherIcon(code)}</span>
        <p>{isToday ? "Today" : formatDay(date)}</p>
        <p>
          {Math.floor(min)}&deg; &mdash; <strong>{Math.ceil(max)}&deg;</strong>
        </p>
        <button className="mini-button" onClick={this.toggleHourly}>
          {this.state.showHourly ? "Hide" : "Details"}
        </button>
        {this.state.showHourly && hourly && (
          <HourlyForecast hourly={hourly} onClose={this.toggleHourly} />
        )}
      </li>
    );
  }
}

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LabelList,
} from "recharts";

function HourlyForecast({ hourly, onClose }) {
  const [metric, setMetric] = React.useState("temperature_2m");

  // Transform data for Recharts
  const data = hourly.time.map((t, i) => ({
    time: new Date(t).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    temperature_2m: Math.round(hourly.temperature_2m[i]),
    precipitation: hourly.precipitation[i],
    windspeed_10m: hourly.windspeed_10m[i],
    icon: getWeatherIcon(hourly.weathercode[i]),
  }));

  const metrics = [
    { key: "temperature_2m", label: "Temperature", color: "#d8b7b7", unit: "°" },
    { key: "precipitation", label: "Rain", color: "#a18d8d", unit: "mm" },
    { key: "windspeed_10m", label: "Wind", color: "#7c6868", unit: "km/h" },
  ];

  const currentMetric = metrics.find((m) => m.key === metric);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-time">{label}</p>
          <div className="tooltip-row">
            <span className="tooltip-val">
              {payload[0].value}
              {currentMetric.unit}
            </span>
            {metric === "temperature_2m" && (
              <span className="tooltip-icon">{payload[0].payload.icon}</span>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="hourly-modal-overlay" onClick={onClose}>
      <div className="hourly-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
        <h3>Hourly Forecast</h3>

        <div className="chart-tabs">
          {metrics.map((m) => (
            <button
              key={m.key}
              className={`chart-tab ${metric === m.key ? "active" : ""}`}
              onClick={() => setMetric(m.key)}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data} margin={{ top: 20, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={currentMetric.color} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={currentMetric.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.2)" />
              <XAxis
                dataKey="time"
                tick={{ fill: "#4a4040", fontSize: 11 }}
                tickMargin={5}
                interval={0}
                minTickGap={0}
              />
              <YAxis hide domain={['auto', 'auto']} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#4a4040", strokeWidth: 1 }} />
              <Area
                type="monotone"
                dataKey={metric}
                stroke={currentMetric.color}
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorMetric)"
                animationDuration={1000}
              >
                <LabelList dataKey={metric} position="top" fill="#4a4040" fontSize={14} fontWeight={700} formatter={(val) => val} />
              </Area>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
