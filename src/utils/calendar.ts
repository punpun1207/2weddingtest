export function getGoogleCalendarUrl(): string {
  const title = encodeURIComponent('Lễ Cưới: Hồng Quân & Thu Hiền');
  const details = encodeURIComponent(
    'Trân trọng kính mời quý khách đến tham dự lễ thành hôn của Hồng Quân & Thu Hiền tại Trung tâm White Palace (Hà Nội).'
  );
  const location = encodeURIComponent(
    'White Palace, Nhà số 2, Ngõ 2, Đường số 1, Thôn Đoài, Xã Vĩnh Thanh, TP. Hà Nội'
  );
  // Date: 2026-11-28 16:00 to 2026-11-28 21:30 UTC+7 (09:00 to 14:30 UTC)
  const dates = '20261128T090000Z/20261128T143000Z';
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
}

export function downloadIcsFile() {
  const icsData = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Wedding//HongQuanThuHien//VI',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    'SUMMARY:Lễ Cưới: Hồng Quân & Thu Hiền',
    'DESCRIPTION:Trân trọng kính mời quý khách đến tham dự lễ cưới Hồng Quân & Thu Hiền tại White Palace',
    'LOCATION:White Palace, Nhà số 2, Ngõ 2, Đường số 1, Thôn Đoài, Xã Vĩnh Thanh, TP. Hà Nội',
    'DTSTART:20261128T090000Z',
    'DTEND:20261128T143000Z',
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'Dam-Cuoi-Hong-Quan-Thu-Hien.ics');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
