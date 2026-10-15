import { supabase } from '../config/supabase.js';

class DiscountsService {
  async validateCode(code, userId) {
    if (!code || !code.trim()) {
      return { valid: false, message: 'Ingresa un código de cupón.' };
    }

    const cleanCode = code.trim().toUpperCase();

    try {
      const { data, error } = await supabase
        .from('discounts')
        .select('*')
        .eq('code', cleanCode)
        .single();

      if (error || !data) {
        return { valid: false, message: 'Cupón no válido o no encontrado.' };
      }

      if (data.is_active === false) {
        return { valid: false, message: 'Este cupón está desactivado.' };
      }

      const usedUsers = data.used_users || [];

      if (data.max_uses && usedUsers.length >= data.max_uses) {
        return { valid: false, message: 'Este cupón ya alcanzó el límite máximo de usos.' };
      }

      if (userId && usedUsers.includes(userId)) {
        return { valid: false, message: 'Ya has utilizado este cupón anteriormente.' };
      }

      return {
        valid: true,
        id: data.id,
        code: data.code,
        discountPct: data.discount_pct || 0,
        message: `¡Cupón ${data.code} aplicado con éxito (-${data.discount_pct}%)!`
      };
    } catch (err) {
      console.error('Error validating discount code:', err);
      return { valid: false, message: 'Error al verificar el cupón.' };
    }
  }
}

export const discountsService = new DiscountsService();
