/**
 * Quinet Shop - Cart Service
 * Manages shopping cart with plans and multi-currency support
 */

const STORAGE_CART_KEY = 'quinet_cart_v2';

class CartService {
  constructor() {
    this.items = this.loadCart();
    this.listeners = new Set();
  }

  loadCart() {
    try {
      const data = localStorage.getItem(STORAGE_CART_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn('Error loading cart:', e);
      return [];
    }
  }

  saveCart() {
    try {
      localStorage.setItem(STORAGE_CART_KEY, JSON.stringify(this.items));
    } catch (e) {
      console.warn('Error saving cart:', e);
    }
    this.notify();
  }

  getItems() {
    return this.items;
  }

  getCount() {
    return this.items.reduce((acc, item) => acc + (item.quantity || 1), 0);
  }

  getTotalUSD() {
    return this.items.reduce((acc, item) => acc + (item.priceUSD * (item.quantity || 1)), 0);
  }

  addItem(item) {
    // Check if duplicate item with exact same plan exists
    const existingIndex = this.items.findIndex(
      i => i.id === item.id && i.duration === item.duration && !i.isRecarga
    );

    if (existingIndex > -1) {
      this.items[existingIndex].quantity = (this.items[existingIndex].quantity || 1) + (item.quantity || 1);
    } else {
      this.items.push({
        id: item.id,
        name: item.name,
        image_url: item.image_url,
        product_type: item.product_type,
        planName: item.planName || 'Plan Estándar',
        duration: item.duration || '1 Mes',
        priceUSD: Number(item.priceUSD) || 0,
        quantity: item.quantity || 1,
        isRecarga: Boolean(item.isRecarga),
        playerIdentifier: item.playerIdentifier || ''
      });
    }

    this.saveCart();
  }

  removeItem(index) {
    if (index >= 0 && index < this.items.length) {
      this.items.splice(index, 1);
      this.saveCart();
    }
  }

  updateQuantity(index, quantity) {
    if (index >= 0 && index < this.items.length) {
      if (quantity <= 0) {
        this.removeItem(index);
      } else {
        this.items[index].quantity = quantity;
        this.saveCart();
      }
    }
  }

  clear() {
    this.items = [];
    this.saveCart();
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify() {
    this.listeners.forEach(cb => {
      try { cb(this.items); } catch (e) { console.error(e); }
    });
  }
}

export const cartService = new CartService();
