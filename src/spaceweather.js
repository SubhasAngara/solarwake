const kpUrl = "https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json";

export async function getSpaceWeather() {
  const response = await fetch(kpUrl);

  if (!response.ok) {
    throw new Error("Could not load Kp data");
  }

  const data = await response.json();
  const rows = data.slice(1);
  const latestRow = rows[rows.length - 1];

  const kpText = latestRow[1] || latestRow[2] || latestRow.kp || latestRow.Kp;
  const kp = Number(kpText);

  return {
    time: latestRow[0],
    kp: Number.isFinite(kp) ? kp : "--",
  };
}