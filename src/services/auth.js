import { supabase, ADMIN_UID } from '../config/supabase.js';

class AuthService {
  constructor() {
    this.user = null;
    this.listeners = new Set();
    this.init();
  }

  async init() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      this.user = session?.user || null;
      this.notify();
    } catch (e) {
      console.warn('Error fetching initial session:', e);
    }

    supabase.auth.onAuthStateChange((event, session) => {
      this.user = session?.user || null;
      this.notify();
    });
  }

  getUser() {
    return this.user;
  }

  isLoggedIn() {
    return Boolean(this.user);
  }

  isAdmin() {
    if (!this.user) return false;
    return this.user.id === ADMIN_UID;
  }

  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data;
  }

  async signUp(email, password, metadata = {}) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });
    if (error) throw error;
    return data;
  }

  async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) throw error;
    return data;
  }

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    this.user = null;
    this.notify();
  }

  async updateProfile(updates) {
    const { data, error } = await supabase.auth.updateUser(updates);
    if (error) throw error;
    return data;
  }

  async resetPassword(email) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin
    });
    if (error) throw error;
    return data;
  }

  subscribe(callback) {
    this.listeners.add(callback);
    callback(this.user);
    return () => this.listeners.delete(callback);
  }

  notify() {
    this.listeners.forEach(cb => {
      try { cb(this.user); } catch (e) { console.error(e); }
    });
  }
}

export const authService = new AuthService();
