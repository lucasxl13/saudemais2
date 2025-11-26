// Calcula o número da semana atual (Ex: S-48)
function getCurrentWeekLabel() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  // Ajuste para Thursday in current week ensures you adhere to ISO 8601
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  const week1 = new Date(date.getFullYear(), 0, 4);
  const weekNumber = 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  
  return `S-${weekNumber}`;
}