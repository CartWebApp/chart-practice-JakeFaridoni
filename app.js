// change this to reference the dataset you chose to work with.
import { gameSales as chartData } from "./data/gameSales.js";

// --- DOM helpers ---
const yearSelect = document.getElementById("yearSelect");
const platformSelect = document.getElementById("platformSelect");
const metricSelect = document.getElementById("metricSelect");
const chartTypeSelect = document.getElementById("chartType");
const renderBtn = document.getElementById("renderBtn");
const dataPreview = document.getElementById("dataPreview");
const canvas = document.getElementById("chartCanvas");

let currentChart = null;

// --- Populate dropdowns from data ---
const years = [...new Set(chartData.map(r => r.year))];
const platforms = [...new Set(chartData.map(r => r.platform))];

years.forEach(g => yearSelect.add(new Option(g, g)));
platforms.forEach(p => platformSelect.add(new Option(p, p)));

yearSelect.value = years[0];
platformSelect.value = platforms[0];

// Preview first 6 rows
dataPreview.textContent = JSON.stringify(chartData.slice(0, 6), null, 2);

render();

// Render button
renderBtn.addEventListener("click", () => {
  render();
});

// --- Main render ---
function render() {
  const chartType = chartTypeSelect.value;
  const year = yearSelect.value;
  const platform = platformSelect.value;
  const metric = metricSelect.value;

  // Destroy old chart if it exists (common Chart.js gotcha)
  if (currentChart) currentChart.destroy();

  // Build chart config based on type
  const config = buildConfig(chartType, { year, platform, metric });

  currentChart = new Chart(canvas, config);
}

// --- Students: you’ll edit / extend these functions ---
function buildConfig(type, { year, platform, metric }) {
  if (type === "bar") return barBySales(platform, metric);
  if (type === "line") return lineSalesOverYears(platform, ["unitsM"]);
  if (type === "scatter") return scatterScoresVsSales(platform);
  if (type === "doughnut") return doughnutRegionShare(year, platform);
  if (type === "radar") return radarPublishersAcrossMetrics(year);
  return barBySales(platform, metric);
}

// Task A: BAR — compare neighborgenres for a given year
function barBySales(platform, metric) {
  const rows = chartData.filter(r => r.platform === platform);

  const labels = rows.map(r => r.genre);
  const values = rows.map(r => r[metric]);

  return {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: `${metric} by ${platform}`,
        data: values
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: { display: true, text: `${platform} by genre` }
      },
      scales: {
        y: { genre: { display: true, text: metric } },
        x: { genre: { display: true, text: "Genre" } }
      }
    }
  };
}

// Task B: LINE — trend over time for one neighborgenre (2 datasets)
function lineSalesOverYears(platform, metrics) {
  const rows = chartData.filter(r => r.platform === platform);

  const labels = rows.map(r => r.year);

  const datasets = metrics.map(m => ({
    label: m,
    data: rows.map(r => r[m])
  }));

  return {
    type: "line",
    data: { labels, datasets },
    options: {
      responsive: true,
      plugins: {
        title: { display: true, text: `Trends over time: ${platform}` }
      },
      scales: {
        y: { genre: { display: true, text: "Value" } },
        x: { genre: { display: true, text: "Year" } }
      }
    }
  };
}

// SCATTER — relationship between temperature and trips
function scatterScoresVsSales(platform) {
  const rows = chartData.filter(r => r.platform === platform);

  const points = rows.map(r => ({ x: r.reviewScore, y: r.revenueUSD }));

  return {
    type: "scatter",
    data: {
      datasets: [{
        label: `Scores vs Sales (${platform})`,
        data: points
      }]
    },
    options: {
      plugins: {
        title: { display: true, text: `Do Review Scores Affect Sales? (${platform})` }
      },
      scales: {
        x: { title: { display: true, text: "Review Score" } },
        y: { title: { display: true, text: "Sales (USD)" } }
      }
    }
  };
}

// DOUGHNUT — member vs casual share for one genre + year
function doughnutRegionShare(year, platform) {
  const row = chartData.find(r => r.year === year && r.platform === platform);

  // const regions = chartData.map(r => r.region);
  const totalRegions = chartData.map(r => r.region).length;
  console.log(totalRegions);
  

  const regionNA = (((chartData.filter(r => r.region === "NA").length) / totalRegions) * 100);
  const regionEU = (((chartData.filter(r => r.region === "EU").length) / totalRegions) * 100);
  const regionJP = (((chartData.filter(r => r.region === "JP").length) / totalRegions) * 100);
  const regionASIA = (((chartData.filter(r => r.region === "ASIA").length) / totalRegions) * 100);
  console.log(regionASIA, regionEU, regionJP, regionNA, regionASIA + regionEU + regionJP + regionNA);


  return {
    type: "doughnut",
    data: {
      labels: ["NA (%)", "EU (%)", "JP (%)", "ASIA (%)"],
      datasets: [{ label: "Rider mix", data: [regionNA, regionEU, regionJP, regionASIA] }]
    },
    options: {
      plugins: {
        genre: { display: true, text: `Rider mix: ${platform} (${year})` }
      }
    }
  };
}

// RADAR — compare neighborgenres across multiple metrics for one year
function radarPublishersAcrossMetrics(year) {
  const rows = chartData.filter(r => r.year === year);

  const metrics = ["trips", "revenueUSD", "avgDurationMin", "incidents"];
  const labels = metrics;

  const datasets = rows.map(r => ({
    label: r.genre,
    data: metrics.map(m => r[m])
  }));

  return {
    type: "radar",
    data: { labels, datasets },
    options: {
      plugins: {
        genre: { display: true, text: `Multi-metric comparison (${year})` }
      }
    }
  };
}