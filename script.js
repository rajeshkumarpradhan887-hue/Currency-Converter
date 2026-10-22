
const form = document.getElementById("converter-form");
const amountInput = document.getElementById("amount");
const fromSelect = document.getElementById("from");
const toSelect = document.getElementById("to");
const fromFlag = document.getElementById("from-flag");
const toFlag = document.getElementById("to-flag");
const swapButton = document.getElementById("swap");
const convertButton = document.getElementById("convert-btn");
const statusText = document.getElementById("status");
const resultText = document.getElementById("result");
const rateText = document.getElementById("rate");

const countryCodes = {
    USD: "US",
    INR: "IN",
    EUR: "EU",
    GBP: "GB",
    JPY: "JP",
    CAD: "CA",
    AUD: "AU",
    CNY: "CN",
    AED: "AE"
};

function updateFlags() {
    const fromCountry = countryCodes[fromSelect.value];
    const toCountry = countryCodes[toSelect.value];

    fromFlag.src = `https://flagsapi.com/${fromCountry}/flat/64.png`;
    toFlag.src = `https://flagsapi.com/${toCountry}/flat/64.png`;

    fromFlag.alt = `${fromSelect.value} flag`;
    toFlag.alt = `${toSelect.value} flag`;
}

fromSelect.addEventListener("change", updateFlags);
toSelect.addEventListener("change", updateFlags);

swapButton.addEventListener("click", () => {
    const previousFrom = fromSelect.value;

    fromSelect.value = toSelect.value;
    toSelect.value = previousFrom;

    updateFlags();
    convertCurrency();
});

form.addEventListener("submit", (event) => {
    event.preventDefault();
    convertCurrency();
});

async function convertCurrency() {
    const amount = Number(amountInput.value);
    const fromCurrency = fromSelect.value;
    const toCurrency = toSelect.value;

    if (!Number.isFinite(amount) || amount <= 0) {
        statusText.textContent = "Please enter an amount greater than zero.";
        resultText.textContent = "--";
        rateText.textContent = "";
        return;
    }

    if (fromCurrency === toCurrency) {
        statusText.textContent = "Conversion complete";
        resultText.textContent =
            `${amount.toLocaleString(undefined, {
                maximumFractionDigits: 4
            })} ${toCurrency}`;
        rateText.textContent = `1 ${fromCurrency} = 1 ${toCurrency}`;
        return;
    }

    convertButton.disabled = true;
    convertButton.textContent = "Converting...";
    statusText.textContent = "Fetching latest available exchange rates...";
    resultText.textContent = "--";
    rateText.textContent = "";

    try {
        const response = await fetch(
            `https://open.er-api.com/v6/latest/${fromCurrency}`
        );

        if (!response.ok) {
            throw new Error("Unable to fetch exchange rates.");
        }

        const data = await response.json();

        if (
            data.result !== "success" ||
            !data.rates ||
            typeof data.rates[toCurrency] !== "number"
        ) {
            throw new Error("Exchange rate is unavailable.");
        }

        const exchangeRate = data.rates[toCurrency];
        const convertedAmount = amount * exchangeRate;

        statusText.textContent = "Converted amount";
        resultText.textContent =
            `${convertedAmount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 4
            })} ${toCurrency}`;

        rateText.textContent =
            `1 ${fromCurrency} = ${exchangeRate} ${toCurrency}`;

    } catch (error) {
        statusText.textContent =
            "Could not get exchange rates. Please try again.";
        resultText.textContent = "--";
        rateText.textContent = "";
        console.error(error);
    } finally {
        convertButton.disabled = false;
        convertButton.textContent = "Convert Currency";
    }
}

updateFlags();
