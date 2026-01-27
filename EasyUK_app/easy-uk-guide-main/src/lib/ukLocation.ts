/**
 * UK Location validation and data utilities
 * Focused on UK (London-first) without external paid APIs
 */

// UK Postcode regex - validates both outward (e.g., E11) and full postcodes (e.g., E11 1AA)
// Based on UK Government postcode specification
const UK_POSTCODE_REGEX = /^([A-Z]{1,2}[0-9][A-Z0-9]?)\s*([0-9][A-Z]{2})?$/i;

// Outward code only (first part before space)
const UK_OUTWARD_CODE_REGEX = /^[A-Z]{1,2}[0-9][A-Z0-9]?$/i;

export interface PostcodeValidationResult {
  isValid: boolean;
  normalized: string;
  outwardCode: string;
  inwardCode: string | null;
  errorKey?: string; // translation key for error message
}

/**
 * Validates and normalizes a UK postcode
 * Accepts both full postcodes (SW1A 1AA) and outward codes (SW1A, E11)
 */
export function validateUKPostcode(input: string): PostcodeValidationResult {
  if (!input || typeof input !== 'string') {
    return {
      isValid: false,
      normalized: '',
      outwardCode: '',
      inwardCode: null,
      errorKey: 'validation.postcodeRequired',
    };
  }

  // Normalize: uppercase, trim, remove extra spaces
  const cleaned = input.toUpperCase().trim().replace(/\s+/g, ' ');
  
  // Check for full postcode first
  const fullMatch = cleaned.match(UK_POSTCODE_REGEX);
  
  if (fullMatch) {
    const outward = fullMatch[1].toUpperCase();
    const inward = fullMatch[2] ? fullMatch[2].toUpperCase() : null;
    const normalized = inward ? `${outward} ${inward}` : outward;
    
    return {
      isValid: true,
      normalized,
      outwardCode: outward,
      inwardCode: inward,
    };
  }

  // Check if it's just an outward code
  const outwardOnly = cleaned.replace(/\s/g, '');
  if (UK_OUTWARD_CODE_REGEX.test(outwardOnly)) {
    return {
      isValid: true,
      normalized: outwardOnly.toUpperCase(),
      outwardCode: outwardOnly.toUpperCase(),
      inwardCode: null,
    };
  }

  return {
    isValid: false,
    normalized: cleaned,
    outwardCode: '',
    inwardCode: null,
    errorKey: 'validation.postcodeInvalid',
  };
}

/**
 * London Boroughs list
 * All 32 London boroughs + City of London
 */
export const LONDON_BOROUGHS = [
  { value: 'barking-dagenham', label: 'Barking and Dagenham' },
  { value: 'barnet', label: 'Barnet' },
  { value: 'bexley', label: 'Bexley' },
  { value: 'brent', label: 'Brent' },
  { value: 'bromley', label: 'Bromley' },
  { value: 'camden', label: 'Camden' },
  { value: 'city-of-london', label: 'City of London' },
  { value: 'croydon', label: 'Croydon' },
  { value: 'ealing', label: 'Ealing' },
  { value: 'enfield', label: 'Enfield' },
  { value: 'greenwich', label: 'Greenwich' },
  { value: 'hackney', label: 'Hackney' },
  { value: 'hammersmith-fulham', label: 'Hammersmith and Fulham' },
  { value: 'haringey', label: 'Haringey' },
  { value: 'harrow', label: 'Harrow' },
  { value: 'havering', label: 'Havering' },
  { value: 'hillingdon', label: 'Hillingdon' },
  { value: 'hounslow', label: 'Hounslow' },
  { value: 'islington', label: 'Islington' },
  { value: 'kensington-chelsea', label: 'Kensington and Chelsea' },
  { value: 'kingston', label: 'Kingston upon Thames' },
  { value: 'lambeth', label: 'Lambeth' },
  { value: 'lewisham', label: 'Lewisham' },
  { value: 'merton', label: 'Merton' },
  { value: 'newham', label: 'Newham' },
  { value: 'redbridge', label: 'Redbridge' },
  { value: 'richmond', label: 'Richmond upon Thames' },
  { value: 'southwark', label: 'Southwark' },
  { value: 'sutton', label: 'Sutton' },
  { value: 'tower-hamlets', label: 'Tower Hamlets' },
  { value: 'waltham-forest', label: 'Waltham Forest' },
  { value: 'wandsworth', label: 'Wandsworth' },
  { value: 'westminster', label: 'Westminster' },
] as const;

/**
 * Available cities (starting with London only, easy to extend)
 */
export const UK_CITIES = [
  { value: 'london', label: 'London' },
  // Easy to add more cities later:
  // { value: 'manchester', label: 'Manchester' },
  // { value: 'birmingham', label: 'Birmingham' },
  // { value: 'leeds', label: 'Leeds' },
] as const;

/**
 * Get borough label by value
 */
export function getBoroughLabel(value: string): string | undefined {
  const borough = LONDON_BOROUGHS.find(b => b.value === value);
  return borough?.label;
}

/**
 * Get city label by value
 */
export function getCityLabel(value: string): string | undefined {
  const city = UK_CITIES.find(c => c.value === value);
  return city?.label;
}
