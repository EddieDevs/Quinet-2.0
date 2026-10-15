import { supabase } from '../src/config/supabase.js';

async function testFetchAllForUser(uid, email, phone) {
  let filterParts = [];
  if (uid) filterParts.push(`user_id.eq.${uid}`);
  if (email) filterParts.push(`user_email.ilike.${email.trim()}`);
  if (phone) filterParts.push(`user_phone.eq.${phone.trim()}`);

  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .or(filterParts.join(','))
    .order('created_at', { ascending: false });

  console.log('Orders found:', orders?.length, error);

  // Check accounts
  const { data: accounts } = await supabase
    .from('service_accounts')
    .select('*')
    .or(`assigned_user_id.eq.${uid},assigned_user_email.ilike.${email.trim()}`);

  const delivered = [...(accounts || [])];
  const assignedOrderNums = new Set(delivered.map(a => a.assigned_order_number).filter(Boolean));

  // Check completed orders without accounts
  const completedWithoutAcc = (orders || []).filter(o => o.status === 'COMPLETADO' && !assignedOrderNums.has(o.order_number));
  
  if (completedWithoutAcc.length > 0 && uid) {
    const { data: msgs } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', uid)
      .order('created_at', { ascending: true });

    let emailFound = null, passFound = null, profFound = null, pinFound = null;
    (msgs || []).forEach(m => {
      const text = m.text || '';
      const emailMatch = text.match(/(?:Email|Correo):\s*([^\s\n]+)/i);
      const passMatch = text.match(/(?:Clave|Contrase(?:ñ|n)a|Password):\s*([^\s\n]+)/i);
      const profMatch = text.match(/(?:Perfil(?:\s+Asignado)?):\s*([^\n\r]+)/i);
      const pinMatch = text.match(/(?:Pin|PIN):\s*([^\s\n]+)/i);

      if (emailMatch && !emailFound) emailFound = emailMatch[1].trim();
      if (passMatch && !passFound) passFound = passMatch[1].trim();
      if (profMatch && !profFound) profFound = profMatch[1].trim();
      if (pinMatch && !pinFound) pinFound = pinMatch[1].trim();
    });

    completedWithoutAcc.forEach(order => {
      const orderCredEmail = order.access_email || order.service_email || order.assigned_email || emailFound;
      const orderCredPass = order.access_password || order.service_password || order.assigned_password || passFound;

      delivered.push({
        id: 'ord-' + order.id,
        service_name: Array.isArray(order.products) ? order.products.join(' + ') : (order.products || 'Suscripción'),
        email: orderCredEmail || 'Consultar en Chat Privado',
        password: orderCredPass || '••••••••',
        profile_name: profFound || null,
        pin: pinFound || null,
        assigned_order_number: order.order_number,
        status: 'ACTIVA',
        created_at: order.created_at,
        isFromChatOrOrder: true
      });
    });
  }

  console.log('Total delivered accounts synthesized:', delivered);
}

await testFetchAllForUser('1ab3649e-ee05-4674-9e34-edebcbd19eb4', 'isabellasophia2960@gmail.com', '04124226539');
