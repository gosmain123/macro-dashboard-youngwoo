export function getFredBackupSourceUrl(seriesId?: string) {
  return seriesId ? `https://fred.stlouisfed.org/series/${seriesId}` : "https://fred.stlouisfed.org/";
}
