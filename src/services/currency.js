/**
 * Quinet Shop - Currency Service (VES, USD)
 * Default Currency: Bolívares (VES)
 * Calculates prices in USD base reference with live official exchange rates
 */

const STORAGE_CURRENCY_KEY = 'quinet_active_currency';
const STORAGE_RATES_KEY = 'quinet_rates_cache_v2';

// Fallback rates if offline or API delay
const DEFAULT_RATES = {
  USD_VES: 875.65,
  lastUpdated: null
};

class CurrencyService {
  constructor() {
    const saved = localStorage.getItem(STORAGE_CURRENCY_KEY);
    // Only VES or USD allowed; default to VES
    this.activeCurrency = (saved === 'USD' || saved === 'VES') ? saved : 'VES';
    this.rates = this.loadCachedRates();
    this.listeners = new Set();
  }

  loadCachedRates() {
    try {
      const cached = localStorage.getItem(STORAGE_RATES_KEY);
      if (cached) {
        return { ...DEFAULT_RATES, ...JSON.parse(cached) };
      }
    } catch (e) {
      console.warn('Error reading cached rates:', e);
    }
    return { ...DEFAULT_RATES };
  }

  saveCachedRates() {
    try {
      localStorage.setItem(STORAGE_RATES_KEY, JSON.stringify(this.rates));
    } catch (e) {
      console.warn('Error saving rates cache:', e);
    }
  }

  async fetchRates() {
    let updated = false;

    // 1. Fetch official USD rate for Venezuela (BCV)
    try {
      const resUsd = await fetch('https://ve.dolarapi.com/v1/dolares/oficial').then(r => r.ok ? r.json() : null);

      if (resUsd && resUsd.promedio) {
        this.rates.USD_VES = parseFloat(resUsd.promedio);
        updated = true;
      }
    } catch (err) {
      console.warn('Primary exchange API error, attempting fallback...', err);
    }

    // 2. Fallback secondary API if needed
    if (!updated) {
      try {
        const fallbackRes = await fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json');
        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          if (fallbackData?.usd?.ves) {
            this.rates.USD_VES = parseFloat(fallbackData.usd.ves);
            updated = true;
          }
        }
      } catch (fbErr) {
        console.warn('Secondary exchange API error:', fbErr);
      }
    }

    if (updated) {
      this.rates.lastUpdated = new Date().toISOString();
      this.saveCachedRates();
      this.notifyListeners();
    }

    return this.rates;
  }

  getCurrency() {
    return this.activeCurrency;
  }

  setCurrency(currency) {
    if (!['VES', 'USD'].includes(currency)) return;
    this.activeCurrency = currency;
    localStorage.setItem(STORAGE_CURRENCY_KEY, currency);
    this.notifyListeners();
  }

  /**
   * Convert an amount in USD to the target currency
   */
  convert(priceInUSD, targetCurrency = this.activeCurrency) {
    const usd = Number(priceInUSD) || 0;
    switch (targetCurrency) {
      case 'VES':
        return usd * (this.rates.USD_VES || 1);
      case 'USD':
      default:
        return usd;
    }
  }

  /**
   * Format price nicely with currency symbols
   */
  format(priceInUSD, targetCurrency = this.activeCurrency) {
    const converted = this.convert(priceInUSD, targetCurrency);
    switch (targetCurrency) {
      case 'VES':
        return `${converted.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs`;
      case 'USD':
      default:
        return `$${converted.toFixed(2)}`;
    }
  }

  getSymbol(targetCurrency = this.activeCurrency) {
    switch (targetCurrency) {
      case 'VES': return 'Bs';
      case 'USD': return '$';
      default: return '$';
    }
  }

  getRate(targetCurrency = 'VES') {
    return this.rates.USD_VES || 1;
  }

  formatVES(amountInVES) {
    return Number(amountInVES || 0).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  /**
   * Returns dual-currency object with main price and alternate currency in small letters
   * If currency is USD: main is USD ($X.XX), secondary is Bs (~Y.YY Bs)
   * If currency is VES: main is Bs (Y.YY Bs), secondary is USD (~$X.XX USD)
   */
  getDualPrice(priceInUSD) {
    const usd = Number(priceInUSD) || 0;
    const ves = this.convert(usd, 'VES');
    const cur = this.getCurrency();
    if (cur === 'USD') {
      return {
        main: `$${usd.toFixed(2)}`,
        secondary: `~${this.formatVES(ves)} Bs`,
        currency: 'USD',
        usd,
        ves
      };
    } else {
      return {
        main: `${this.formatVES(ves)} Bs`,
        secondary: `~$${usd.toFixed(2)} USD`,
        currency: 'VES',
        usd,
        ves
      };
    }
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners() {
    this.listeners.forEach(cb => {
      try { cb(this.activeCurrency, this.rates); } catch (e) { console.error(e); }
    });
  }
}

export const currencyService = new CurrencyService();
