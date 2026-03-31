const apiKey = process.env.TWELVE_DATA_API_KEY;

if (!apiKey) {
  throw new Error("Missing TWELVE_DATA_API_KEY");
}

const queries = ["VIX", "CBOE VIX", "Volatility Index"];

for (const q of queries) {
  const url = new URL("https://api.twelvedata.com/symbol_search");
  url.searchParams.set("symbol", q);
  url.searchParams.set("outputsize", "20");
  url.searchParams.set("apikey", apiKey);

  const res = await fetch(url);
  const json = await res.json();

  console.log(`\n=== QUERY: ${q} ===`);
  console.dir(json, { depth: null });
}
