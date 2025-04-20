import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import { Bar, Pie, Line } from "react-chartjs-2";
import "chart.js/auto";

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filters, setFilters] = useState({ city: "", county: "" });

  useEffect(() => {
    fetch("/ev_data.csv")
      .then((res) => res.text())
      .then((text) => {
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const cleaned = results.data.map((item) => ({
              ...item,
              "Model Year": parseInt(item["Model Year"]),
              "Electric Range": parseInt(item["Electric Range"]),
              "Base MSRP": parseInt(item["Base MSRP"]),
              Latitude: parseFloat(item["Vehicle Location"].split(" ")[1]?.replace("(", "")),
              Longitude: parseFloat(item["Vehicle Location"].split(" ")[2]?.replace(")", "")),
            }));
            setData(cleaned);
            setFiltered(cleaned);
          },
        });
      });
  }, []);

  useEffect(() => {
    const filteredData = data.filter(
      (item) =>
        (!filters.city || item.City === filters.city) &&
        (!filters.county || item.County === filters.county)
    );
    setFiltered(filteredData);
  }, [filters, data]);

  const getCounts = (key) => {
    const counts = {};
    filtered.forEach((item) => {
      counts[item[key]] = (counts[item[key]] || 0) + 1;
    });
    return counts;
  };

  const getTop = (obj, topN) => {
    return Object.entries(obj)
      .sort((a, b) => b[1] - a[1])
      .slice(0, topN);
  };

  const modelYearDist = getCounts("Model Year");
  const evTypes = getCounts("Electric Vehicle Type");
  const makes = getCounts("Make");
  const cities = getCounts("City");
  const counties = getCounts("County");
  const cafv = getCounts("Clean Alternative Fuel Vehicle (CAFV) Eligibility");
  const utilities = getCounts("Electric Utility");

  const topMakes = getTop(makes, 5);

  return (
    <div className="w-full h-screen flex flex-col justify-center items-center px-4">
    <h1 className="text-3xl font-bold text-center mb-8">EV Dashboard</h1>
  <div className="flex justify-center gap-4">
    <select
      onChange={(e) => setFilters({ ...filters, city: e.target.value })}
      className="text-center">
       <option value="">All Cities</option>
      {[...new Set(data.map((d) => d.City))].map((city) => (
        <option key={city}>{city}</option>
      ))}
    </select>
    <select
      onChange={(e) => setFilters({ ...filters, county: e.target.value })}
      className="text-center">
      <option value="">All Counties</option>
      {[...new Set(data.map((d) => d.County))].map((county) => (
        <option key={county}>{county}</option>
      ))}
    </select>
     </div>
      <div className="text-center">Total EVs: {filtered.length}</div>

      {/* EV Types Pie Chart */}
      <div>
        <h2 className="text-xl font-semibold mb-8">EV Types</h2>
        <div style={{ height: '450px', width: '100%' }}>
          <Pie
            data={{
              labels: Object.keys(evTypes),
              datasets: [
                {
                  data: Object.values(evTypes),
                  backgroundColor: ["#36A2EB", "#FF6384", "#FFCE56"],
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
            }}
          />
        </div>
      </div>

      {/* Top Makes Bar Chart */}
      <div>
        <h2 className="text-xl font-semibold mb-8">Top 5 EV Makes</h2>
        <div style={{ height: '400px', width: '100%' }}>
          <Bar
            data={{
              labels: topMakes.map(item => item[0]),
              datasets: [
                {
                  label: 'Number of Vehicles',
                  data: topMakes.map(item => item[1]),
                  backgroundColor: '#82ca9d',
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            }}
          />
        </div>
      </div>

      {/* Model Year Line Chart */}
      <div>
        <h2 className="text-xl font-semibold mb-8">EVs by Model Year</h2>
        <div style={{ height: '450px', width: '100%' }}>
          <Line
            data={{
              labels: Object.keys(modelYearDist).sort(),
              datasets: [
                {
                  label: "EVs by Model Year",
                  data: Object.entries(modelYearDist)
                    .sort((a, b) => a[0] - b[0])
                    .map(([_, v]) => v),
                  borderColor: "#9966FF",
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            }}
          />
        </div>
      </div>

      {/* Top Cities Bar Chart */}
      <div>
        <h2 className="text-xl font-semibold mb-8">Top Cities by EV Count</h2>
        <div style={{ height: '400px', width: '100%' }}>
          <Bar
            data={{
              labels: getTop(cities, 10).map(([k]) => k),
              datasets: [
                {
                  label: "Top Cities by EV Count",
                  data: getTop(cities, 10).map(([_, v]) => v),
                  backgroundColor: "#FF9F40",
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            }}
          />
        </div>
      </div>

      {/* CAFV Eligibility Pie Chart */}
      <div>
        <h2 className="text-xl font-semibold mb-8">CAFV Eligibility Distribution</h2>
        <div style={{ height: '400px', width: '100%' }}>
          <Pie
            data={{
              labels: Object.keys(cafv),
              datasets: [
                {
                  label: "CAFV Eligibility",
                  data: Object.values(cafv),
                  backgroundColor: ["#00A896", "#F07167", "#FFD166"],
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
            }}
          />
        </div>
      </div>

      {/* Top Utilities Bar Chart */}
      <div>
        <h2 className="text-xl font-semibold mb-8">Top Electric Utilities</h2>
        <div style={{ height: '400px', width: '100%' }}>
          <Bar
            data={{
              labels: getTop(utilities, 10).map(([k]) => k),
              datasets: [
                {
                  label: "Top Electric Utilities",
                  data: getTop(utilities, 10).map(([_, v]) => v),
                  backgroundColor: "#8AC926",
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
