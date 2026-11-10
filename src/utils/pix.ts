import QRCode from 'qrcode';

export interface PixPayloadOptions {
  key: string;
  keyType?: 'phone' | 'cpf' | 'cnpj' | 'email' | 'random';
  name?: string;
  city?: string;
  amount: number | string;
  txid?: string;
  description?: string;
}

export interface PixConfig {
  key: string;
  keyType: 'phone' | 'cpf' | 'cnpj' | 'email' | 'random';
  merchantName: string;
  merchantCity: string;
  whatsapp: string;
}

// Configuração padrão da loja SunLab 3D
export const DEFAULT_PIX_CONFIG: PixConfig = {
  key: '+5513996061681',
  keyType: 'phone',
  merchantName: 'SunLab 3D',
  merchantCity: 'SANTOS',
  whatsapp: '13996061681'
};

/**
 * Remove acentos e caracteres especiais para conformidade com o padrão EMV do BCB
 */
export function normalizeEMVText(text: string, maxLength: number): string {
  if (!text) return '';
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9 ]/g, '')
    .trim()
    .slice(0, maxLength);
}

/**
 * Formata campo no padrão TLV (Tag-Length-Value)
 */
export function formatTLV(id: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return `${id}${len}${value}`;
}

/**
 * Calcula o checksum CRC-16-CCITT (polinômio 0x1021, valor inicial 0xFFFF)
 * conforme estipulado pelo Banco Central do Brasil para o Pix Copia e Cola / BRCode.
 */
export function calculateCRC16CCITT(payload: string): string {
  let crc = 0xFFFF;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xFFFF;
      } else {
        crc = (crc << 1) & 0xFFFF;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Higieniza a chave Pix para o padrão do Banco Central:
 * - Telefone: +5513996061681 (prefixo +55 obrigatório)
 * - CPF: 11 dígitos numéricos
 * - CNPJ: 14 dígitos numéricos
 * - E-mail: minúsculo e sem espaços
 * - Aleatória (EVP): formato UUID sem espaços
 */
export function sanitizePixKey(rawKey: string, forcedType?: string): string {
  if (!rawKey) return DEFAULT_PIX_CONFIG.key;
  const trimmed = rawKey.trim();

  // Se já tiver +55 no início de telefone
  if (trimmed.startsWith('+55')) {
    const digitsOnly = trimmed.slice(3).replace(/\D/g, '');
    return `+55${digitsOnly}`;
  }

  // Se é e-mail
  if (trimmed.includes('@')) {
    return trimmed.toLowerCase();
  }

  // Se for chave aleatória UUID com traços
  if (/^[0-9a-fA-F-]{32,36}$/.test(trimmed)) {
    return trimmed.toLowerCase();
  }

  const numericOnly = trimmed.replace(/\D/g, '');

  // Forçar tipo ou inferir por tamanho
  if (forcedType === 'phone' || (numericOnly.length >= 10 && numericOnly.length <= 11)) {
    return `+55${numericOnly}`;
  }

  if (numericOnly.length === 14) {
    return numericOnly; // CNPJ
  }

  if (numericOnly.length === 11) {
    // Pode ser CPF ou telefone sem +55. Se especificado como CPF, retorna numérico
    if (forcedType === 'cpf') return numericOnly;
    // Se começar com DDD comum (ex: 11 a 99) e tiver 11 dígitos, BCB aceita como telefone +55
    return `+55${numericOnly}`;
  }

  return trimmed;
}

/**
 * Gera o payload oficial do Pix (Código "Pix Copia e Cola" / BRCode EMV)
 */
export function generatePixPayload(options: PixPayloadOptions): string {
  const {
    key,
    keyType,
    name = DEFAULT_PIX_CONFIG.merchantName,
    city = DEFAULT_PIX_CONFIG.merchantCity,
    amount,
    txid = '***',
    description
  } = options;

  const cleanKey = sanitizePixKey(key, keyType);

  // Tag 00: Payload Format Indicator (fixo '01')
  const tag00 = formatTLV('00', '01');

  // Tag 01: Point of Initiation Method ('11' = QR Code Estático)
  // O uso de '11' (e não '12') é fundamental para evitar a rejeição "Recusado pelo PSP do recebedor"
  // que bancos aplicam quando recebem código dinâmico ('12') sem cobrança registrada via API do PSP.
  const tag01 = formatTLV('01', '11');

  // Tag 26: Merchant Account Information - Pix
  const sub00 = formatTLV('00', 'br.gov.bcb.pix');
  const sub01 = formatTLV('01', cleanKey);
  const sub02 = description ? formatTLV('02', normalizeEMVText(description, 30)) : '';
  const tag26 = formatTLV('26', `${sub00}${sub01}${sub02}`);

  // Tag 52: Merchant Category Code (fixo '0000')
  const tag52 = formatTLV('52', '0000');

  // Tag 53: Transaction Currency (fixo '986' = Real Brasileiro BRL)
  const tag53 = formatTLV('53', '986');

  // Tag 54: Transaction Amount (2 casas decimais)
  const numAmount = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  const formattedAmount = numAmount.toFixed(2);
  const tag54 = formatTLV('54', formattedAmount);

  // Tag 58: Country Code (fixo 'BR')
  const tag58 = formatTLV('58', 'BR');

  // Tag 59: Merchant Name (máximo 25 caracteres, sem acento)
  const cleanName = normalizeEMVText(name, 25) || 'SUNLAB 3D';
  const tag59 = formatTLV('59', cleanName);

  // Tag 60: Merchant City (máximo 15 caracteres, sem acento)
  const cleanCity = normalizeEMVText(city, 15) || 'SANTOS';
  const tag60 = formatTLV('60', cleanCity);

  // Tag 62: Additional Data Field Template (txid / Identificador da Transação)
  // No padrão do Banco Central para QR Code Estático, '***' é o valor universal
  // aceito por todos os bancos sem exigir cobrança pré-registrada no PSP.
  const cleanTxid = (txid && txid !== '***') ? txid.replace(/[^a-zA-Z0-9]/g, '').slice(0, 25) : '***';
  const sub05 = formatTLV('05', cleanTxid || '***');
  const tag62 = formatTLV('62', sub05);

  // Tag 63: CRC16 Checksum
  const payloadToCRC = `${tag00}${tag01}${tag26}${tag52}${tag53}${tag54}${tag58}${tag59}${tag60}${tag62}6304`;
  const checksum = calculateCRC16CCITT(payloadToCRC);

  return `${payloadToCRC}${checksum}`;
}

/**
 * Gera imagem QR Code legível em Data URL (base64 PNG) com alta resolução
 */
export async function generatePixQRCode(pixPayload: string): Promise<string> {
  try {
    return await QRCode.toDataURL(pixPayload, {
      width: 360,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    });
  } catch (err) {
    console.warn('Fallback para gerador QR Server:', err);
    return `https://api.qrserver.com/v1/create-qr-code/?size=360x360&data=${encodeURIComponent(pixPayload)}`;
  }
}
