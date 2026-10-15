import { supabase } from '../config/supabase.js';

class BncPaymentsService {
  /**
   * Busca si existe un pago registrado en bnc_payments que coincida con la referencia
   * (puede ser la referencia completa o los últimos 4 dígitos).
   */
  async findMatchingPayment(refInput, expectedAmountBs = null) {
    if (!refInput) return null;
    const cleanRef = refInput.trim();

    try {
      // Consultamos pagos en estado 'RECIBIDO' (aún no usados en otra orden)
      const { data, error } = await supabase
        .from('bnc_payments')
        .select('*')
        .eq('status', 'RECIBIDO')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error consultando bnc_payments:', error);
        return null;
      }

      if (!data || data.length === 0) return null;

      // Buscamos coincidencia por referencia:
      // Si el usuario ingresó 4 dígitos, verificamos si la referencia termina en esos 4 dígitos.
      // Si ingresó la referencia completa, verificamos igualdad o inclusión.
      const matched = data.find(p => {
        const pRef = (p.referencia || '').trim();
        if (cleanRef.length <= 4) {
          return pRef.endsWith(cleanRef);
        } else {
          return pRef === cleanRef || pRef.endsWith(cleanRef) || cleanRef.endsWith(pRef);
        }
      });

      if (!matched) return null;

      // Validación opcional de monto: permitir margen de tolerancia por redondeo de tasas (ej. 3%)
      if (expectedAmountBs && expectedAmountBs > 0) {
        const diff = Math.abs(parseFloat(matched.monto) - expectedAmountBs);
        const margin = expectedAmountBs * 0.05; // 5% de tolerancia
        if (diff > margin && diff > 5) {
          console.warn(`Referencia coincide (${matched.referencia}) pero el monto difiere: esperado ${expectedAmountBs}, recibido ${matched.monto}`);
          // Aún así retornamos el pago con una bandera de advertencia
          return { ...matched, amountWarning: true };
        }
      }

      return matched;
    } catch (e) {
      console.error('Excepción buscando pago BNC:', e);
      return null;
    }
  }

  /**
   * Marca un pago de bnc_payments como 'CONCILIADO' asociándolo al número de orden
   */
  async reconcilePayment(paymentId, orderNumber) {
    if (!paymentId) return;
    try {
      const { error } = await supabase
        .from('bnc_payments')
        .update({
          status: 'CONCILIADO',
          matched_order_id: orderNumber
        })
        .eq('id', paymentId);

      if (error) {
        console.error('Error al conciliar pago BNC:', error);
      } else {
        console.log(`Pago BNC ID ${paymentId} conciliado con orden ${orderNumber}`);
      }
    } catch (e) {
      console.error('Excepción al conciliar pago:', e);
    }
  }

  /**
   * Busca órdenes pendientes que puedan conciliarse con un pago recibido
   */
  async autoReconcileOrderWithPayment(payment, callbacks = {}) {
    if (!payment || !payment.referencia) return null;

    try {
      // 1. Buscar órdenes en estado PENDIENTE que sean de tipo pagomovil
      const { data: pendingOrders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('status', 'PENDIENTE')
        .order('created_at', { ascending: false });

      if (error || !pendingOrders || pendingOrders.length === 0) return null;

      const pRef = (payment.referencia || '').trim();

      // Buscar si alguna orden pendiente tiene una referencia que coincida con los últimos dígitos
      const matchedOrder = pendingOrders.find(ord => {
        if (!ord.payment_reference) return false;
        const ordRef = ord.payment_reference.trim();
        return pRef.endsWith(ordRef) || pRef === ordRef;
      });

      if (matchedOrder) {
        console.log(`¡Coincidencia automática encontrada! Orden ${matchedOrder.order_number} con pago BNC ${payment.referencia}`);

        // 2. Actualizar estado de la orden a COMPLETADO
        await supabase
          .from('orders')
          .update({
            status: 'COMPLETADO',
            payment_reference: payment.referencia // Actualizamos con la referencia completa recibida del banco
          })
          .eq('id', matchedOrder.id);

        // 3. Marcar pago como CONCILIADO
        await this.reconcilePayment(payment.id, matchedOrder.order_number);

        // 4. Si hay callbacks para notificar o entregar credenciales
        if (callbacks.onOrderCompleted) {
          callbacks.onOrderCompleted(matchedOrder, payment);
        }

        return matchedOrder;
      }
    } catch (e) {
      console.error('Error en autoReconcileOrderWithPayment:', e);
    }

    return null;
  }

  /**
   * Escucha pagos en tiempo real mediante Supabase Realtime
   */
  listenToIncomingPayments(onPaymentReceived) {
    const channel = supabase
      .channel('bnc_realtime_listener')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'bnc_payments' },
        (payload) => {
          console.log('[BNC] Nuevo pago recibido en tiempo real:', payload.new);
          if (onPaymentReceived) {
            onPaymentReceived(payload.new);
          }
        }
      )
      .subscribe();

    return channel;
  }

  /**
   * Obtiene la lista de los últimos pagos BNC recibidos
   */
  async getRecentPayments(limit = 20) {
    try {
      const { data, error } = await supabase
        .from('bnc_payments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error('Error obteniendo pagos recientes BNC:', e);
      return [];
    }
  }
}

export const bncPaymentsService = new BncPaymentsService();
