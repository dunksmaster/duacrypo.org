const form = document.getElementById("dca-form");
const resultBox = document.getElementById("result");

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
  const step = 30;

  const points = prices.filter((_, i) => i % step === 0).slice(-months);

  let totalInvested = 0;
  let totalCoins = 0;

  for (const [, price] of points) {
    totalInvested += monthlyAmount;
    totalCoins += monthlyAmount / price;
  }

  const latestPrice = prices[prices.length - 1][1];
  const portfolioValue = totalCoins * latestPrice;
  const profit = portfolioValue - totalInvested;

  return {
    monthlyPurchases: points.length,
    totalInvested,
    totalCoins,
    portfolioValue,
    profit,
  };
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const monthlyAmount = Number(document.getElementById("monthlyAmount").value);
  const years = Number(document.getElementById("years").value);
  const coinId = document.getElementById("coinId").value;

  if (!monthlyAmount || !years) {
    resultBox.textContent = "Ju lutem plotësoni të gjitha fushat.";
    return;
  }

  const days = years * 365 + 10;

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
  }
});
