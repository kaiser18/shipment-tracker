export function toLocalDateTimeInput(date: Date = new Date()): string {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export function getShipmentPromisedDate(): string {
  const date = new Date();
  let workingDays = 0;

  while (workingDays < 3) {
    date.setDate(date.getDate() + 1);
    const day = date.getDay();

    if (day !== 0 && day !== 6) {
      workingDays += 1;
    }
  }

  date.setHours(17, 0, 0, 0);
  return toLocalDateTimeInput(date);
}
