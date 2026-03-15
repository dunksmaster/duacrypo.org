const form = document.getElementById("dca-form");
const resultBox = document.getElementById("result");
const presetExampleBtn = document.getElementById("presetExample");

function formatEuro(value) {
  return new Intl.NumberFormat("sq-AL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatCoin(value) {
  return new Intl.NumberFormat("sq-AL", {
    minimumFractionDigits: 4,
    maximumFractionDigits: 8,
  }).format(value);
}

function monthKeyFromTimestamp(timestamp) {
  const date = new Date(timestamp);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function pickMonthlyPoints(prices, months) {
  const byMonth = new Map();

  for (const point of prices) {
    const [timestamp] = point;
    byMonth.set(monthKeyFromTimestamp(timestamp), point);
  }

  return Array.from(byMonth.values()).slice(-months);
}

async function loadMarketData(coinId, days) {
  const url = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=eur&days=${days}&interval=daily`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Nuk u arrit të lexohen të dhënat historike nga API.");
  }

  const data = await response.json();
  return data.prices || [];
}

function calculateDCA(prices, monthlyAmount, years) {
  const months = years * 12;
  const monthlyPoints = pickMonthlyPoints(prices, months);

  if (monthlyPoints.length < months) {
    throw new Error(
      "Nuk ka të dhëna mujore të mjaftueshme për periudhën e zgjedhur. Zgjidh një periudhë më të shkurtër."
    );
  }

  let totalInvested = 0;
  let totalCoins = 0;

  for (const [, price] of monthlyPoints) {
    totalInvested += monthlyAmount;
    totalCoins += monthlyAmount / price;
  }

  const latestPrice = prices[prices.length - 1][1];
  const portfolioValue = totalCoins * latestPrice;
  const profit = portfolioValue - totalInvested;

  return {
    monthlyPurchases: monthlyPoints.length,
    totalInvested,
    totalCoins,
    portfolioValue,
    profit,
  };
}

function setPresetExample() {
  document.getElementById("monthlyAmount").value = 20;
  document.getElementById("years").value = 5;
  document.getElementById("coinId").value = "bitcoin";
}

presetExampleBtn.addEventListener("click", () => {
  setPresetExample();
  resultBox.textContent = "Shembulli u vendos: 20€ / muaj për 5 vite (Bitcoin). Kliko “Llogarit”.";
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const monthlyAmount = Number(document.getElementById("monthlyAmount").value);
  const years = Number(document.getElementById("years").value);
  const coinId = document.getElementById("coinId").value;

  if (!monthlyAmount || !years) {
    resultBox.textContent = "Ju lutem plotësoni të gjitha fushat.";
    return;
  }

  if (monthlyAmount <= 0 || years <= 0) {
    resultBox.textContent = "Vlerat duhet të jenë më të mëdha se zero.";
    return;
  }

  if (!Number.isInteger(years)) {
    resultBox.textContent = "Vitet duhet të jenë numër i plotë.";
    return;
  }

  const days = years * 365 + 40;
  const submitButton = form.querySelector('button[type="submit"]');

  submitButton.disabled = true;

  resultBox.textContent = "Duke llogaritur me të dhënat historike...";

  try {
    const prices = await loadMarketData(coinId, days);

    if (!prices.length) {
      throw new Error("Nuk ka të dhëna të mjaftueshme për këtë periudhë.");
    }

    const dca = calculateDCA(prices, monthlyAmount, years);

    resultBox.innerHTML = `
      <p>Keni bërë <strong>${dca.monthlyPurchases}</strong> blerje mujore.</p>
      <p>Totali i investuar: <strong>${formatEuro(dca.totalInvested)}</strong></p>
      <p>Sasia e akumuluar: <strong>${formatCoin(dca.totalCoins)}</strong></p>
      <p>Vlera aktuale e portofolit: <strong>${formatEuro(dca.portfolioValue)}</strong></p>
      <p>${
        dca.profit >= 0
          ? `Fitimi i mundshëm: <strong>${formatEuro(dca.profit)}</strong>`
          : `Humbja e mundshme: <strong>${formatEuro(Math.abs(dca.profit))}</strong>`
      }</p>
      <small>
        Simulim edukativ bazuar në çmimet historike ditore nga CoinGecko. Nuk garanton rezultate të ardhshme.
      </small>
    `;
  } catch (error) {
    resultBox.textContent = `Gabim: ${error.message}`;
  } finally {
    submitButton.disabled = false;
  }
});
