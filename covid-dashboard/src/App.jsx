import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Line, Pie } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function formatDate(date) {
  const d = new Date(date);
  return d.toLocaleDateString("en-GB");
}

function App() {
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("usa");
  const [historicalData, setHistoricalData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [startDate, setStartDate] = useState("2019-01-01");
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    async function fetchCountries() {
      try {
        const res = await axios.get("https://restcountries.com/v3.1/all");
        const sortedCountries = res.data
          .map((c) => ({
            name: c.name.common,
            iso2: c.cca2 ? c.cca2.toLowerCase() : null,
          }))
          .filter((c) => c.iso2 !== null)
          .sort((a, b) => a.name.localeCompare(b.name));
        setCountries(sortedCountries);
      } catch (err) {
        setError("Failed to load countries.");
      }
    }
    fetchCountries();
  }, []);

  useEffect(() => {
    if (!selectedCountry) return;
    setLoading(true);
    setError("");
    async function fetchData() {
      try {
        const res = await axios.get(
          `https://disease.sh/v3/covid-19/historical/${selectedCountry}?lastdays=all`
        );
        setHistoricalData(res.data.timeline);
      } catch (err) {
        setError("Failed to fetch COVID-19 data.");
        setHistoricalData(null);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [selectedCountry]);

  let chartLabels = [];
  let casesData = [];
  let deathsData = [];
  let recoveredData = [];
  let latestCases = 0;
  let latestDeaths = 0;
  let latestRecovered = 0;

  if (historicalData) {
    const { cases = {}, deaths = {}, recovered = {} } = historicalData;

    const filteredDates = Object.keys(cases).filter((dateStr) => {
      const parts = dateStr.split("/");
      const dateObj = new Date(
        2000 + parseInt(parts[2], 10),
        parseInt(parts[0], 10) - 1,
        parseInt(parts[1], 10)
      );
      return dateObj >= new Date(startDate) && dateObj <= new Date(endDate);
    });

    chartLabels = filteredDates.map((d) => {
      const parts = d.split("/");
      return `20${parts[2]}-${parts[0].padStart(2, "0")}-${parts[1].padStart(2, "0")}`;
    });

    casesData = filteredDates.map((d) => cases[d] ?? 0);
    deathsData = filteredDates.map((d) => deaths[d] ?? 0);
    recoveredData = filteredDates.map((d) => recovered[d] ?? 0);

    latestCases = casesData[casesData.length - 1] ?? 0;
    latestDeaths = deathsData[deathsData.length - 1] ?? 0;
    latestRecovered = recoveredData[recoveredData.length - 1] ?? 0;
  }

  const lineChartData = {
    labels: chartLabels,
    datasets: [
      {
        label: "Cases",
        data: casesData,
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.3)",
        fill: true,
      },
      {
        label: "Deaths",
        data: deathsData,
        borderColor: "#ef4444",
        backgroundColor: "rgba(239, 68, 68, 0.3)",
        fill: true,
      },
      {
        label: "Recovered",
        data: recoveredData,
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.3)",
        fill: true,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        text: `COVID-19 Historical Data for ${selectedCountry.toUpperCase()}`,
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
    },
    interaction: {
      mode: "nearest",
      axis: "x",
      intersect: false,
    },
  };

  const pieChartData = {
    labels: ["Cases", "Deaths", "Recovered"],
    datasets: [
      {
        label: "Latest COVID-19 Data",
        data: [latestCases, latestDeaths, latestRecovered],
        backgroundColor: ["#3b82f6", "#ef4444", "#10b981"],
        hoverOffset: 30,
      },
    ],
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "bottom" },
      title: {
        display: true,
        text: `Latest Totals (${formatDate(endDate)})`,
      },
    },
  };

  return (
    <div className="p-4 sm:p-6 bg-sky-100 min-h-screen font-sans">
      <h1 className="text-center text-xl sm:text-2xl font-semibold mb-6">
        COVID-19 and Population Dashboard
      </h1>

     
      <div className="flex flex-col lg:flex-row gap-6 justify-between mb-6">
        
        <div className="flex flex-col w-full lg:w-1/2">
          <label className="mb-1 font-medium">Select Country</label>
          <select
            className="border border-gray-300 rounded px-4 py-2"
            onChange={(e) => setSelectedCountry(e.target.value)}
            value={selectedCountry}
          >
            {countries.map(({ name, iso2 }) => (
              <option key={iso2} value={iso2}>
                {name}
              </option>
            ))}
          </select>
        </div>

        
        <div className="flex flex-col w-full lg:w-1/2">
          <label className="mb-1 font-medium">Filter by Date</label>
          <div className="flex gap-2">
            <input
              type="date"
              max={endDate}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 w-full"
            />
            <input
              type="date"
              min={startDate}
              max={new Date().toISOString().slice(0, 10)}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 w-full"
            />
          </div>
        </div>
      </div>

    
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-400 text-white p-4 rounded-lg shadow text-center">
          <div>Total Cases</div>
          <div className="text-2xl font-semibold">{(latestCases / 1e6).toFixed(1)}M</div>
          <div className="text-xs opacity-75">{((latestCases / 1e7) * 100).toFixed(2)}%</div>
        </div>

        <div className="bg-green-500 text-white p-4 rounded-lg shadow text-center">
          <div>Recoveries</div>
          <div className="text-2xl font-semibold">{(latestRecovered / 1e6).toFixed(1)}M</div>
          <div className="text-xs opacity-75">{((latestRecovered / 1e7) * 100).toFixed(2)}%</div>
        </div>

        <div className="bg-red-500 text-white p-4 rounded-lg shadow text-center">
          <div>Deaths</div>
          <div className="text-2xl font-semibold">{(latestDeaths / 1e6).toFixed(1)}M</div>
          <div className="text-xs opacity-75">{((latestDeaths / 1e7) * 100).toFixed(2)}%</div>
        </div>
      </div>

      
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 bg-white p-4 rounded shadow min-h-[400px]">
          <Line data={lineChartData} options={lineChartOptions} />
        </div>

        <div className="flex-1 bg-white p-4 rounded shadow min-h-[400px]">
          <Pie data={pieChartData} options={pieChartOptions} />
        </div>
      </div>

      
      <div className="mt-8 text-center text-gray-600 text-sm">
        Data last updated on: {new Date().toLocaleString()}
      </div>
    </div>
  );
}

export default App;
