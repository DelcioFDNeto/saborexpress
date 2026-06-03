function crc16(payload: string): string {
  let crc = 0xFFFF;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc = crc << 1;
      }
    }
  }
  return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
}

function tlv(id: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return `${id}${len}${value}`;
}

export function generatePixPayload(key: string, amount: number, name: string = 'Sabor Express', city: string = 'Belem'): string {
  // Format phone key if it's 11 digits
  let formattedKey = key;
  if (key.length === 11 && /^\d+$/.test(key)) {
    formattedKey = `+55${key}`;
  }

  const gui = tlv('00', 'br.gov.bcb.pix');
  const pixKey = tlv('01', formattedKey);
  const merchantAccountInfo = tlv('26', gui + pixKey);
  
  const payloadFormat = tlv('00', '01');
  const pointOfInit = tlv('01', '11'); // 11 = static
  const merchantCatCode = tlv('52', '0000');
  const currency = tlv('53', '986'); // BRL
  const transactionAmount = tlv('54', amount.toFixed(2));
  const countryCode = tlv('58', 'BR');
  const merchantName = tlv('59', name);
  const merchantCity = tlv('60', city);
  const additionalData = tlv('62', tlv('05', '***'));

  const payloadWithoutCrc = 
    payloadFormat + 
    pointOfInit + 
    merchantAccountInfo + 
    merchantCatCode + 
    currency + 
    transactionAmount + 
    countryCode + 
    merchantName + 
    merchantCity + 
    additionalData + 
    '6304'; // 63 is the ID for CRC, 04 is the length

  const crc = crc16(payloadWithoutCrc);
  return payloadWithoutCrc + crc;
}
