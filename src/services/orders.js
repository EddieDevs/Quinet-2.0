import { supabase, ADMIN_UID, ADMIN_WHATSAPP } from '../config/supabase.js';

class OrdersService {
  generateOrderNumber() {
    return '#ORD-' + Math.floor(10000 + Math.random() * 90000);
  }

  async createOrder({ user, phone, cartItems, totalUSD, discountId, discountPct, receiptFile, tasaBCV, paymentMethod, paymentReference, customDetails = {}, initialStatus = 'PENDIENTE' }) {
    if (!user) throw new Error('Debes iniciar sesión para realizar un pedido.');
    if (!receiptFile) throw new Error('Se requiere el comprobante de pago.');

    const orderNumber = this.generateOrderNumber();
    const cleanFileName = receiptFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `${user.id}/${Date.now()}_${cleanFileName}`;

    // 1. Upload receipt to Supabase Storage ('comprobantes' bucket)
    const { error: uploadError } = await supabase.storage
      .from('comprobantes')
      .upload(storagePath, receiptFile);

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw new Error('Error al subir el comprobante: ' + uploadError.message);
    }

    const { data: imgData } = supabase.storage
      .from('comprobantes')
      .getPublicUrl(storagePath);
    const receiptUrl = imgData.publicUrl;

    // 2. Prepare product names list with selected plans
    const productsList = cartItems.map(item => {
      if (item.isRecarga) {
        return `${item.name} [Recarga: $${item.priceUSD.toFixed(2)}]`;
      }
      return `${item.name} (${item.duration || '1 Mes'}) - $${item.priceUSD.toFixed(2)}`;
    });
    const joinedNames = productsList.join(' + ');

    // 3. Mark discount as used if applicable
    if (discountId) {
      try {
        const { data: disc } = await supabase.from('discounts').select('used_users').eq('id', discountId).single();
        if (disc) {
          const used = disc.used_users || [];
          used.push(user.id);
          await supabase.from('discounts').update({ used_users: used }).eq('id', discountId);
        }
      } catch (discErr) {
        console.warn('Error updating discount used users:', discErr);
      }
    }

    // 4. Insert into orders table
    const { data: newOrderData, error: orderError } = await supabase.from('orders').insert([{
      user_id: user.id,
      user_name: user.user_metadata?.display_name || user.email,
      user_email: user.email,
      user_phone: phone,
      products: productsList,
      total: totalUSD,
      status: initialStatus || 'PENDIENTE',
      order_number: orderNumber,
      payment_method: paymentMethod || 'pagomovil',
      payment_reference: paymentReference || null,
      comprobante_url: receiptUrl
    }]).select().single();

    if (orderError) {
      console.error('Error inserting order:', orderError);
      throw new Error('Error al registrar la orden: ' + orderError.message);
    }

    // 5. Insert into sales_control (accounting with complete profit_usd and total_bs calculations)
    const rate = tasaBCV > 0 ? tasaBCV : 1;
    let realCostTotal = 0;
    cartItems.forEach(item => {
      if (item.real_cost) realCostTotal += parseFloat(item.real_cost) || 0;
    });
    const totalBs = parseFloat((totalUSD * rate).toFixed(2));
    const costBs = parseFloat((realCostTotal * rate).toFixed(2));
    const netBs = parseFloat((totalBs - costBs).toFixed(2));
    const profitUSD = parseFloat((totalUSD - realCostTotal).toFixed(2));
    const todayStr = new Date().toISOString().split('T')[0];

    try {
      await supabase.from('sales_control').insert([{
        service_sold: joinedNames,
        client: (user.user_metadata?.display_name || user.email),
        order_number: paymentReference ? `${orderNumber} [Ref: ${paymentReference}]` : orderNumber,
        payment_reference: paymentReference || null,
        date: todayStr,
        price_bs: totalBs,
        cost_bs: costBs,
        commission_bs: 0,
        exchange_rate: parseFloat(rate.toFixed(2)),
        total_bs: netBs,
        profit_usd: profitUSD > 0 ? profitUSD : parseFloat((netBs / rate).toFixed(2))
      }]);
    } catch (salesErr) {
      console.warn('Accounting auto-register notice:', salesErr);
    }

    // 6. Format custom details text if present (IDs de juego, correos, etc.)
    let customDetailsText = '';
    const detailsKeys = Object.keys(customDetails || {});
    if (detailsKeys.length > 0) {
      customDetailsText = '\n\nDATOS SUMINISTRADOS:\n' + detailsKeys.map(k => `• ${k}: ${customDetails[k]}`).join('\n');
    }

    // 7. Ensure chat entry and automated notification are generated in Supabase
    try {
      await supabase.from('chats').upsert({
        id: user.id,
        user_name: user.user_metadata?.display_name || user.email,
        product: joinedNames.length > 50 ? joinedNames.slice(0, 47) + '...' : joinedNames,
        order_number: orderNumber,
        updated_at: new Date().toISOString()
      });

      let payMethodText = paymentMethod === 'pagomovil' ? 'Pago Móvil' : (paymentMethod || 'Pago Móvil');
      if (paymentReference) {
        payMethodText += ` [Ref: ${paymentReference}]`;
      }

      const orderMsgText = `NUEVO PEDIDO REGISTRADO\n\nOrden: ${orderNumber}\nProductos:\n${productsList.map(p => `• ${p}`).join('\n')}\nTotal: $${totalUSD.toFixed(2)} USD (~${totalBs.toFixed(2)} BS)\nMétodo: ${payMethodText}\nContacto: ${phone}${customDetailsText}\n\nComprobante de pago adjunto. Por favor verificar para procesar la entrega.`;

      // Insert message with EXACT database columns: (chat_id, sender, text, file_url, is_read)
      await supabase.from('messages').insert([{
        chat_id: user.id,
        sender: 'user',
        text: orderMsgText,
        file_url: receiptUrl,
        is_read: false
      }]);
      console.log('Chat & Order message successfully created in Supabase!');

      // Notificación automática al cliente si el pedido queda en PENDIENTE
      if (initialStatus === 'PENDIENTE') {
        const pendingNotice = `Hemos registrado tu pedido **${orderNumber}**.\n\n` +
          `Estamos validando tu pago, esto puede tomar unos minutos.\n` +
          `En cuanto confirmemos la transacción, recibirás tu entrega por aquí mismo. ¡Gracias por tu compra!`;

        await supabase.from('messages').insert([{
          chat_id: user.id,
          sender: 'admin',
          text: pendingNotice,
          is_read: false
        }]);
      }

    } catch (chatErr) {
      console.error('Error generating chat message for order:', chatErr);
    }

    return {
      orderNumber,
      receiptUrl,
      totalUSD,
      productsList,
      orderData: newOrderData
    };
  }

  async deliverCredentialsForOrder(order) {
    if (!order || !order.order_number) return null;
    try {
      // 1. Verificar si ya se le entregó cuenta a esta orden
      const { data: existingAssignment } = await supabase
        .from('service_accounts')
        .select('*')
        .eq('assigned_order_number', order.order_number);

      if (existingAssignment && existingAssignment.length > 0) {
        console.log('Cuenta ya asignada y entregada para esta orden:', order.order_number);
        return existingAssignment[0];
      }

      const orderProds = Array.isArray(order.products) ? order.products.join(' ') : (order.products || '');
      const { data: accounts, error: accErr } = await supabase
        .from('service_accounts')
        .select('*');

      if (accErr) {
        console.warn('Fallo consultando stock de cuentas:', accErr);
        return null;
      }

      let matchedAccount = null;
      const pool = accounts || [];

      // Coincidencia exacta o por palabras
      for (let acc of pool) {
        if (acc.status === 'SUSPENDIDA') continue;
        const maxUses = parseInt(acc.max_uses) || 1;
        const curUses = parseInt(acc.current_uses) || 0;
        if (curUses >= maxUses && acc.status !== 'DISPONIBLE') continue;

        const accService = (acc.service_name || '').toLowerCase().trim();
        if (accService && orderProds.toLowerCase().includes(accService)) {
          matchedAccount = acc;
          break;
        }
      }

      if (!matchedAccount) {
        for (let acc of pool) {
          if (acc.status === 'DISPONIBLE') {
            const accService = (acc.service_name || '').toLowerCase().trim();
            const words = accService.split(' ').filter(w => w.length > 2);
            if (words.some(w => orderProds.toLowerCase().includes(w))) {
              matchedAccount = acc;
              break;
            }
          }
        }
      }

      if (matchedAccount) {
        const newUses = (parseInt(matchedAccount.current_uses) || 0) + 1;
        const maxUses = parseInt(matchedAccount.max_uses) || 1;
        const newStatus = newUses >= maxUses ? 'EN_USO' : 'DISPONIBLE';

        await supabase.from('service_accounts').update({
          assigned_user_id: order.user_id || null,
          assigned_user_email: order.user_email || order.user_phone || null,
          assigned_order_number: order.order_number,
          current_uses: newUses,
          status: newStatus,
          updated_at: new Date().toISOString()
        }).eq('id', matchedAccount.id);

        if (order.user_id) {
          await supabase.from('chats').upsert([{
            id: order.user_id,
            user_name: order.user_name || 'Cliente',
            order_number: order.order_number,
            updated_at: new Date().toISOString()
          }]);

          const credMsg = `¡Tu orden **${order.order_number}** ha sido verificada y COMPLETADA con éxito!\n\n` +
            `Datos de tu cuenta **${matchedAccount.service_name}**:\n` +
            `• **Correo:** ${matchedAccount.email}\n` +
            `• **Contraseña:** ${matchedAccount.password}` +
            (matchedAccount.profile_name ? `\n• **Perfil:** ${matchedAccount.profile_name}` : '') +
            (matchedAccount.pin ? `\n• **PIN:** ${matchedAccount.pin}` : '') +
            `\n\nTambién puedes consultar y copiar tus accesos en tu menú > "Mis Cuentas".\n¡Gracias por tu compra!`;

          await supabase.from('messages').insert([{
            chat_id: order.user_id,
            sender: 'admin',
            text: credMsg,
            is_read: false
          }]);
        }
        return matchedAccount;
      } else {
        // NO HAY STOCK DISPONIBLE EN EL MOMENTO
        if (order.user_id) {
          await supabase.from('chats').upsert([{
            id: order.user_id,
            user_name: order.user_name || 'Cliente',
            order_number: order.order_number,
            updated_at: new Date().toISOString()
          }]);

          const cleanWhatsApp = (ADMIN_WHATSAPP || '584228328706').replace(/\D/g, '');
          const waUrl = `https://wa.me/${cleanWhatsApp}?text=` + encodeURIComponent(`Hola, mi pago para la orden ${order.order_number} (${orderProds}) ya fue validado con éxito y estoy a la espera de la entrega de mi cuenta.`);

          const noStockMsg = `[PAGO VALIDADO CON ÉXITO]\n\n` +
            `Tu pedido **${order.order_number}** ha sido confirmado. En este momento un administrador está preparando tu cuenta y te la entregará enseguida por este mismo chat.\n\n` +
            `Para atención inmediata o consultas, también puedes escribirnos directamente por WhatsApp:\n` +
            `[Contactar por WhatsApp](${waUrl})\n\n` +
            `Tu entrega está en camino. Gracias por tu preferencia.`;

          await supabase.from('messages').insert([{
            chat_id: order.user_id,
            sender: 'admin',
            text: noStockMsg,
            is_read: false
          }]);
        }
        return { status: 'NO_STOCK' };
      }
    } catch (e) {
      console.error('Error entregando credenciales:', e);
    }
    return null;
  }

  async fetchUserOrders(userId, userEmail = null, userPhone = null) {
    // Si se pasa el objeto user directamente: fetchUserOrders(user)
    if (userId && typeof userId === 'object') {
      const u = userId;
      userId = u.id;
      userEmail = u.email;
      userPhone = u.user_metadata?.phone || u.phone;
    }

    if (!userId && !userEmail && !userPhone) return [];
    try {
      let filterParts = [];
      if (userId) filterParts.push(`user_id.eq.${userId}`);
      if (userEmail && userEmail.trim()) filterParts.push(`user_email.ilike.${userEmail.trim()}`);
      if (userPhone && userPhone.trim()) filterParts.push(`user_phone.eq.${userPhone.trim()}`);

      let query = supabase.from('orders').select('*');
      if (filterParts.length > 0) {
        query = query.or(filterParts.join(','));
      }
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) {
        console.warn('Aviso en fetchUserOrders con filtro combinado, usando fallback:', error);
        let fbQuery = supabase.from('orders').select('*');
        if (userId) fbQuery = fbQuery.eq('user_id', userId);
        else if (userEmail) fbQuery = fbQuery.ilike('user_email', userEmail.trim());
        const { data: fbData } = await fbQuery.order('created_at', { ascending: false });
        return fbData || [];
      }
      const rawOrders = data || [];
      const dismissedOrders = new Set(this.getDismissedOrderIds());
      return rawOrders.filter(o => !dismissedOrders.has(String(o.id)) && !dismissedOrders.has(String(o.order_number)));
    } catch (e) {
      console.error('Excepción en fetchUserOrders:', e);
      return [];
    }
  }

  getDismissedOrderIds() {
    try {
      const raw = localStorage.getItem('quinet_dismissed_orders');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  dismissOrder(orderId, orderNumber) {
    const list = this.getDismissedOrderIds();
    if (orderId) list.push(String(orderId));
    if (orderNumber) list.push(String(orderNumber));
    try {
      localStorage.setItem('quinet_dismissed_orders', JSON.stringify([...new Set(list)]));
    } catch (e) {}

    // Además, descartar de la lista de cuentas de servicio si existía
    this.removeAssignedAccount('ord-' + orderId, null, orderNumber);
    return true;
  }

  async cancelOrder(orderId, userId, cancelledBy = 'usuario') {
    if (!orderId) throw new Error('ID de orden requerido');

    // 1. Consultar orden previa para conservar metadatos y conocer #orden
    let q = supabase.from('orders').select('*').eq('id', orderId);
    if (userId) {
      q = q.eq('user_id', userId);
    }
    const { data: ord, error: fetchErr } = await q.maybeSingle();
    if (fetchErr) console.warn('Aviso buscando orden para cancelar:', fetchErr);

    let prevMeta = ord?.user_metadata || {};
    if (typeof prevMeta === 'string') {
      try { prevMeta = JSON.parse(prevMeta); } catch(e) { prevMeta = {}; }
    }

    const updatedMeta = {
      ...prevMeta,
      cancelled_by: cancelledBy, // 'usuario' | 'admin'
      cancellation_reason: cancelledBy === 'usuario' ? 'Cancelado por el usuario' : 'Cancelado por un administrador',
      cancelled_at: new Date().toISOString()
    };

    let query = supabase
      .from('orders')
      .update({
        status: 'CANCELADO',
        user_metadata: updatedMeta
      })
      .eq('id', orderId);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query.select();
    if (error) {
      console.error('Error cancelling order:', error);
      throw new Error('Error al cancelar la orden: ' + error.message);
    }

    // 2. Si tenía una cuenta en service_accounts asignada a esta orden, liberarla a DISPONIBLE
    if (ord && ord.order_number) {
      try {
        await supabase.from('service_accounts').update({
          assigned_user_id: null,
          assigned_user_email: null,
          assigned_order_number: null,
          status: 'DISPONIBLE'
        }).eq('assigned_order_number', ord.order_number);
      } catch (accErr) {
        console.warn('Aviso desvinculando cuenta al cancelar orden:', accErr);
      }

      // 3. Eliminar directamente del registro de contabilidad (sales_control)
      try {
        const digits = String(ord.order_number).replace(/\D/g, '');
        await supabase.from('sales_control').delete().or(`order_number.eq.${ord.order_number},order_number.ilike.%${ord.order_number}%,order_number.eq.${digits},order_number.ilike.%${digits}%`);
      } catch (saleErr) {
        console.warn('Aviso eliminando de contabilidad al cancelar orden:', saleErr);
      }
    }

    return data;
  }

  async fetchAssignedAccounts(userId, userEmail = null, userOrders = null) {
    // Si se pasa el objeto user directamente: fetchAssignedAccounts(user)
    if (userId && typeof userId === 'object') {
      const u = userId;
      userId = u.id;
      userEmail = u.email;
    }

    if (!userId && !userEmail) return [];
    try {
      // 1. Obtener asignaciones directas de la tabla service_accounts
      let accQuery = supabase.from('service_accounts').select('*');
      if (userId && userEmail) {
        accQuery = accQuery.or(`assigned_user_id.eq.${userId},assigned_user_email.ilike.${userEmail.trim()}`);
      } else if (userId) {
        accQuery = accQuery.eq('assigned_user_id', userId);
      } else {
        accQuery = accQuery.ilike('assigned_user_email', userEmail.trim());
      }
      const { data: accountsData } = await accQuery.order('updated_at', { ascending: false });
      // Cuentas eliminadas u ocultadas por el cliente
      const dismissedIds = new Set(this.getDismissedAccountIds());

      const deliveredAccounts = [...(accountsData || [])].filter(acc => {
        if (dismissedIds.has(String(acc.id))) return false;
        if (acc.assigned_order_number && dismissedIds.has(String(acc.assigned_order_number))) return false;
        return true;
      });

      // Conjunto de números de orden que ya tienen cuenta asignada en service_accounts
      const accountedOrderNumbers = new Set(
        deliveredAccounts.map(a => a.assigned_order_number).filter(Boolean)
      );

      // 2. Si no se pasaron las órdenes, consultarlas
      let orders = userOrders;
      if (!orders) {
        orders = await this.fetchUserOrders(userId, userEmail);
      }

      const completedOrders = (orders || []).filter(o => o.status === 'COMPLETADO');
      const unassignedCompletedOrders = completedOrders.filter(o => !accountedOrderNumbers.has(o.order_number));

      // 3. Para órdenes completadas que no tienen cuenta en service_accounts:
      // Si la orden NO tiene credenciales específicas (order.access_email / order.service_email / order.assigned_email),
      // dejamos los campos en blanco (""), NO rellenamos con datos de otras cuentas ni adivinamos.
      unassignedCompletedOrders.forEach(order => {
        if (dismissedIds.has(String(order.id)) || dismissedIds.has(String(order.order_number))) return;

        const specificEmail = (order.access_email || order.service_email || order.assigned_email || '').trim();
        const specificPass = (order.access_password || order.service_password || order.assigned_password || '').trim();

        deliveredAccounts.push({
          id: 'ord-' + order.id,
          service_name: Array.isArray(order.products) ? order.products.join(' + ') : (order.products || 'Suscripción Digital'),
          email: specificEmail,
          password: specificPass,
          profile_name: '',
          pin: '',
          assigned_order_number: order.order_number,
          status: 'ACTIVA',
          created_at: order.created_at,
          isFromChatOrOrder: true,
          hasCredentials: Boolean(specificEmail && specificPass)
        });
      });

      return deliveredAccounts;
    } catch (e) {
      console.warn('Error fetching assigned accounts:', e);
      return [];
    }
  }

  getDismissedAccountIds() {
    try {
      const raw = localStorage.getItem('quinet_dismissed_accounts');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  async removeAssignedAccount(accountId, userId, orderNumber) {
    try {
      const dismissed = this.getDismissedAccountIds();
      if (accountId) dismissed.push(String(accountId));
      if (orderNumber) dismissed.push(String(orderNumber));
      try {
        localStorage.setItem('quinet_dismissed_accounts', JSON.stringify([...new Set(dismissed)]));
      } catch (e) {}

      // Si es una cuenta registrada en la tabla service_accounts, desvincularla en Supabase
      if (accountId && !String(accountId).startsWith('ord-')) {
        await supabase.from('service_accounts').update({
          assigned_user_id: null,
          assigned_user_email: null,
          assigned_order_number: null,
          status: 'DISPONIBLE',
          updated_at: new Date().toISOString()
        }).eq('id', accountId);
      }
      return true;
    } catch (e) {
      console.warn('Error al eliminar cuenta asignada:', e);
      return false;
    }
  }

  // Suscripción Realtime en vivo para actualizar órdenes y cuentas del cliente al instante
  subscribeToUserOrders(user, onUpdate) {
    if (!user) return () => {};
    const uid = user.id || 'guest';
    const channelName = `realtime_orders_${uid}_${Date.now()}`;
    const channel = supabase.channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        console.log('[Realtime Orders] Cambio detectado en órdenes:', payload);
        onUpdate(payload);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'service_accounts' }, (payload) => {
        console.log('[Realtime Orders] Cambio detectado en cuentas de servicio:', payload);
        onUpdate(payload);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  async deleteOrder(orderId) {
    const { error } = await supabase.from('orders').delete().eq('id', orderId);
    if (error) throw error;
  }
}

export const ordersService = new OrdersService();
