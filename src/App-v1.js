/* import React from "react";
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
  }

  async fetchWeather() {
    try {
      this.setState({ isLoading: true });

      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${this.state.location}`
      );
      const geoData = await geoRes.json();

      if (!geoData.results || geoData.results.length === 0) {
        toast.error("Konum bulunamadı ❌", { className: "alert" });
        return;
      }

      const { latitude, longitude, name, country_code } = geoData.results.at(0);

      this.setState({
        displayLocation: `${name} ${convertToFlag(country_code)}`,
      });

      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&timezone=auto&daily=weathercode,temperature_2m_max,temperature_2m_min`
      );
      const weatherData = await weatherRes.json();

      if (!weatherData.daily) {
        toast.error("Hava durumu bilgisi alınamadı 🌐", { className: "alert" });
        return;
      }

      this.setState({ weather: weatherData.daily });
    } catch (err) {
      console.error(err);
      toast.error("Bir hata oluştu 🚨", { className: "alert" });
    } finally {
      this.setState({ isLoading: false });
    }
  }

  getCurrentLocationWeather() {
    if (!navigator.geolocation) {
      toast.error("Tarayıcınız konum özelliğini desteklemiyor ❌", {
        className: "alert",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          this.setState({ isLoading: true });

          // Reverse geocoding ile şehir/ülke bilgisi bulalım
          const geoRes = await fetch(
            `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}`
          );
          const geoData = await geoRes.json();

          let locationName = "Your Location";
          if (geoData && geoData.results && geoData.results.length > 0) {
            const { name, country_code } = geoData.results.at(0);
            locationName = `${name} ${convertToFlag(country_code)}`;
          }

          this.setState({ displayLocation: locationName });

          // Hava durumu çekelim
          const weatherRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&timezone=auto&daily=weathercode,temperature_2m_max,temperature_2m_min`
          );
          const weatherData = await weatherRes.json();

          if (!weatherData.daily) {
            toast.error("Hava durumu alınamadı 🌐", { className: "alert" });
            return;
          }

          this.setState({ weather: weatherData.daily });
        } catch (err) {
          console.error(err);
          toast.error("Konumdan hava durumu alınırken hata oluştu 🚨", {
            className: "alert",
          });
        } finally {
          this.setState({ isLoading: false });
        }
      },
      (error) => {
        console.error(error);
        toast.error("Konum izni reddedildi ❌", { className: "alert" });
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

        {this.state.weather.weathercode && (
          <Weather
            weather={this.state.weather}
            location={this.state.displayLocation}
          />
        )}
        <ToastContainer position="bottom-right" autoClose={3000} />

        <button
          onClick={() => this.getCurrentLocationWeather()}
          className="button"
        >
          📍 Kendi Konumundan Hava Durumu
        </button>
      </div>
    );
  }
}

export default App;

class Weather extends React.Component {
  render() {
    const {
      temperature_2m_max: max,
      temperature_2m_min: min,
      time: dates,
      weathercode: codes,
    } = this.props.weather;

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
            />
          ))}
        </ul>
      </div>
    );
  }
}

class Day extends React.Component {
  render() {
    const { date, max, min, code, isToday } = this.props;

    return (
      <li className="day">
        <span>{getWeatherIcon(code)}</span>
        <p>{isToday ? "Today" : formatDay(date)}</p>
        <p>
          {Math.floor(min)}&deg; &mdash; <strong>{Math.ceil(max)}&deg;</strong>
        </p>
      </li>
    );
  }
}
 */
