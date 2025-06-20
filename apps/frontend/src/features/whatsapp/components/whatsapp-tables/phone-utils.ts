// Utility to format phone number and get country flag by DDI
const ddiToFlag: Record<string, string> = {
  '1': '🇺🇸', // USA/Canada
  '44': '🇬🇧', // UK
  '55': '🇧🇷', // Brazil
  '34': '🇪🇸', // Spain
  '49': '🇩🇪', // Germany
  '33': '🇫🇷', // France
  '39': '🇮🇹', // Italy
  '91': '🇮🇳', // India
  '81': '🇯🇵', // Japan
  '86': '🇨🇳', // China
  '351': '🇵🇹', // Portugal
  '7': '🇷🇺', // Russia
  '61': '🇦🇺', // Australia
  '27': '🇿🇦' // South Africa
  // ...add more as needed
};

export function getCountryFlagAndFormatPhone(raw: string) {
  let phone = raw.replace(/^removed\//, '');
  if (!phone.startsWith('+')) phone = '+' + phone;
  // Extract DDI (country code)
  const match = phone.match(/^\+(\d{1,3})/);
  const ddi = match ? match[1] : '';
  const flag = ddiToFlag[ddi] || '🌐';
  // Format phone: +55 11 91234-5678, +1 415-555-1234, etc.
  let formatted = phone;
  if (ddi === '55' && phone.length >= 13) {
    // Brazil: +55 11 91234-5678
    formatted = phone.replace(/^(\+55)(\d{2})(\d{5})(\d{4})$/, '$1 $2 $3-$4');
  } else if (ddi === '1' && phone.length >= 12) {
    // US: +1 415-555-1234
    formatted = phone.replace(/^(\+1)(\d{3})(\d{3})(\d{4})$/, '$1 $2-$3-$4');
  } else if (ddi === '44' && phone.length >= 13) {
    // UK: +44 20 1234 5678
    formatted = phone.replace(/^(\+44)(\d{2})(\d{4})(\d{4})$/, '$1 $2 $3 $4');
  }
  // fallback: just show as is
  return { flag, formatted };
}
