const ukrainianMonths = [
  'січня', 'лютого', 'березня', 'квітня', 'травня', 'червня',
  'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня'
];

export function formatDate(dateString) {
  let parts = dateString.split('-')
  let hasDay = parts.length > 2

  let date = new Date(`${dateString}Z`)
  let day = hasDay ? date.getUTCDate() : ''
  let month = ukrainianMonths[date.getUTCMonth()]
  let year = date.getUTCFullYear()

  return `${day ? day + ' ' : ''}${month} ${year} року`
}
