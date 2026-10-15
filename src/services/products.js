import { supabase } from '../config/supabase.js';

export const PLANS_CONFIG_PREFIX = '<!--PLANS_CONFIG:';
export const PLANS_CONFIG_SUFFIX = '-->';

export function getServiceSpecificFeatures(productName = '', duration = '1 Mes') {
  const name = productName.toLowerCase();

  if (name.includes('spotify')) {
    return [
      'Música sin anuncios y saltos ilimitados',
      'Calidad de audio muy alta (Lossless 320kbps)',
      'Descargas para escuchar sin conexión',
      'Renovación en tu misma cuenta personal',
      'Garantía total durante todo el período'
    ];
  }

  if (name.includes('netflix')) {
    return [
      '1 Pantalla privada con PIN personal',
      'Calidad Ultra HD 4K y HDR',
      'Descarga de series y películas',
      'Renovación en el mismo perfil sin perder historial',
      'Garantía de reposición activa'
    ];
  }

  if (name.includes('disney')) {
    return [
      '1 Perfil privado con PIN exclusivo',
      'Calidad IMAX Enhanced y 4K Ultra HD',
      'Catálogo completo Disney, Pixar, Marvel y Star',
      'Garantía activa con soporte continuo'
    ];
  }

  if (name.includes('max') || name.includes('hbo')) {
    return [
      'Perfil privado con PIN',
      'Contenido exclusivo HBO, Warner y DC en 4K',
      'Garantía continua de funcionamiento'
    ];
  }

  if (name.includes('prime')) {
    return [
      'Perfil privado con PIN',
      'Calidad 4K Ultra HD y audio envolvente',
      'Garantía de servicio garantizada'
    ];
  }

  if (name.includes('crunchyroll')) {
    return [
      'Simulcast con Japón sin anuncios',
      'Anime en calidad Full HD / 1080p',
      'Descargas para ver offline',
      'Garantía durante todo el mes'
    ];
  }

  if (name.includes('canva')) {
    return [
      'Acceso completo a plantillas y elementos Pro',
      'Brand Kit, quitafondos y Magic Studio con IA',
      'Almacenamiento en la nube de 1TB',
      'Activación a tu correo personal'
    ];
  }

  if (name.includes('duolingo')) {
    return [
      'Vidas ilimitadas y práctica personalizada',
      'Sin anuncios ni interrupciones',
      'Repaso de errores y tests de progreso'
    ];
  }

  if (name.includes('google') || name.includes('gemini')) {
    return [
      'Almacenamiento masivo de 5TB en Google Drive',
      'Acceso a Gemini Advanced con IA de última generación',
      'Google Fotos con herramientas de edición premium'
    ];
  }

  if (name.includes('discord')) {
    return [
      'Mejoras de servidor (Server Boosts) incluidas',
      'Streaming en calidad HD y emojis personalizados',
      'Límite de subida de archivos ampliado'
    ];
  }

  // Default streaming video
  return [
    'Pantalla privada con PIN',
    'Calidad Ultra HD 4K',
    'Garantía de reposición durante el plan',
    'Soporte prioritario de QuinetShop'
  ];
}

export function getDeliveryInfo(product) {
  if (!product) {
    return {
      isImmediate: true,
      text: 'Entrega Inmediata',
      badge: 'Entrega Inmediata',
      description: 'Activación inmediata de credenciales por canal privado.'
    };
  }

  const type = (product.product_type || '').toLowerCase();
  const name = (product.name || '').toLowerCase();

  // Non-immediate services: recargas, juegos, canva, google one
  const isEstimated5Min = 
    type === 'recarga' || 
    type === 'juego' || 
    name.includes('google') || 
    name.includes('canva') || 
    name.includes('cod') || 
    name.includes('blood') || 
    name.includes('roblox') || 
    name.includes('mobile legends') || 
    name.includes('free fire') || 
    name.includes('fortnite') || 
    name.includes('steam') || 
    name.includes('minecraft');

  if (isEstimated5Min) {
    return {
      isImmediate: false,
      text: 'Entrega estimada: 5 minutos',
      badge: 'Entrega estimada: 5 min',
      description: 'Procesamiento con entrega estimada en ~5 minutos tras verificar el pago.'
    };
  }

  return {
    isImmediate: true,
    text: 'Entrega Inmediata',
    badge: 'Entrega Inmediata',
    description: 'Activación inmediata con asignación automática de credenciales.'
  };
}

export function parseProductPlans(product) {
  const basePrice = parseFloat(product.price) || 0;
  const description = product.description || '';

  // 1. Check if product.plans is stored directly in database column
  if (product && product.plans) {
    let pList = product.plans;
    if (typeof pList === 'string') {
      try { pList = JSON.parse(pList); } catch(e) {}
    }
    if (Array.isArray(pList) && pList.length > 0) {
      return pList;
    }
  }

  // 2. Check if custom plans JSON is stored in description fallback
  if (description.includes(PLANS_CONFIG_PREFIX)) {
    try {
      const start = description.indexOf(PLANS_CONFIG_PREFIX) + PLANS_CONFIG_PREFIX.length;
      const end = description.indexOf(PLANS_CONFIG_SUFFIX, start);
      if (end !== -1) {
        const rawJson = description.slice(start, end).trim();
        const customPlans = JSON.parse(rawJson);
        if (Array.isArray(customPlans) && customPlans.length > 0) {
          return customPlans;
        }
      }
    } catch (e) {
      console.warn('Error parsing custom plans config for product', product.name, e);
    }
  }

  // Check if plans are formatted in duration string (e.g. "1 Mes:4.5|3 Meses:12")
  if (product.duration && product.duration.includes('|')) {
    try {
      const parts = product.duration.split('|');
      const parsed = parts.map((part, index) => {
        const [dur, pr] = part.split(':');
        const planPrice = pr ? parseFloat(pr) : basePrice;
        return {
          id: `plan-${index}`,
          name: dur.trim(),
          duration: dur.trim(),
          priceUSD: planPrice,
          savings: index > 0 ? `Ahorro especial` : null,
          features: getServiceSpecificFeatures(product.name, dur.trim())
        };
      });
      if (parsed.length > 0) return parsed;
    } catch (e) {
      console.warn('Error parsing pipe-separated duration:', e);
    }
  }

  const name = (product.name || '').toLowerCase();

  // Specific Recargas / Currencies:
  if (name.includes('cod') || name.includes('call of duty')) {
    return [
      { id: 'cod-80', name: '80 CP', duration: 'Recarga Directa', priceUSD: 1.5, savings: null, features: ['80 Call of Duty Points', 'Entrega directa en tu cuenta', 'Garantía oficial QuinetShop'] },
      { id: 'cod-420', name: '420 CP', duration: 'Recarga Directa', priceUSD: 7.0, savings: 'Popular', features: ['420 Call of Duty Points', 'Entrega directa en tu cuenta', 'Garantía oficial QuinetShop'] },
      { id: 'cod-880', name: '880 CP', duration: 'Recarga Directa', priceUSD: 12.0, savings: 'Ahorro', features: ['880 Call of Duty Points', 'Entrega directa en tu cuenta', 'Garantía oficial QuinetShop'] },
      { id: 'cod-2400', name: '2400 CP', duration: 'Recarga Directa', priceUSD: 26.0, savings: 'Super Valor', features: ['2400 Call of Duty Points', 'Entrega directa en tu cuenta', 'Garantía oficial QuinetShop'] },
      { id: 'cod-5000', name: '5000 CP', duration: 'Recarga Directa', priceUSD: 52.0, savings: 'Mega Pack', features: ['5000 Call of Duty Points', 'Entrega directa en tu cuenta', 'Garantía oficial QuinetShop'] },
      { id: 'cod-10800', name: '10800 CP', duration: 'Recarga Directa', priceUSD: 105.0, savings: 'Máximo Pack', features: ['10800 Call of Duty Points', 'Entrega directa en tu cuenta', 'Garantía oficial QuinetShop'] }
    ];
  }

  if (name.includes('blood strike') || name.includes('bloodstrike')) {
    return [
      { id: 'bs-50', name: '50 Oro', duration: 'Recarga Directa', priceUSD: 1.0, savings: null, features: ['50 Oro Blood Strike', 'Recarga por ID de Jugador', 'Acreditación garantizada'] },
      { id: 'bs-100', name: '100 Oro', duration: 'Recarga Directa', priceUSD: 1.5, savings: null, features: ['100 Oro Blood Strike', 'Recarga por ID de Jugador', 'Acreditación garantizada'] },
      { id: 'bs-300', name: '300 Oro', duration: 'Recarga Directa', priceUSD: 2.5, savings: 'Popular', features: ['300 Oro Blood Strike', 'Recarga por ID de Jugador', 'Acreditación garantizada'] },
      { id: 'bs-500', name: '500 Oro', duration: 'Recarga Directa', priceUSD: 5.0, savings: null, features: ['500 Oro Blood Strike', 'Recarga por ID de Jugador', 'Acreditación garantizada'] },
      { id: 'bs-1000', name: '1000 Oro', duration: 'Recarga Directa', priceUSD: 10.0, savings: 'Ahorro', features: ['1000 Oro Blood Strike', 'Recarga por ID de Jugador', 'Acreditación garantizada'] },
      { id: 'bs-2000', name: '2000 Oro', duration: 'Recarga Directa', priceUSD: 18.0, savings: 'Super Pack', features: ['2000 Oro Blood Strike', 'Recarga por ID de Jugador', 'Acreditación garantizada'] },
      { id: 'bs-5000', name: '5000 Oro', duration: 'Recarga Directa', priceUSD: 42.0, savings: 'Mega Pack', features: ['5000 Oro Blood Strike', 'Recarga por ID de Jugador', 'Acreditación garantizada'] }
    ];
  }

  if (name.includes('roblox') || name.includes('robux')) {
    return [
      { id: 'rbx-50', name: '50 Robux', duration: 'Código Digital', priceUSD: 1.5, savings: null, features: ['50 Robux oficiales', 'Canje directo en roblox.com/es/redeem', 'Garantía QuinetShop'] },
      { id: 'rbx-100', name: '100 Robux', duration: 'Código Digital', priceUSD: 3.0, savings: null, features: ['100 Robux oficiales', 'Canje directo en roblox.com/es/redeem', 'Garantía QuinetShop'] },
      { id: 'rbx-500', name: '500 Robux', duration: 'Código Digital', priceUSD: 7.5, savings: 'Popular', features: ['500 Robux oficiales', 'Canje directo en roblox.com/es/redeem', 'Garantía QuinetShop'] },
      { id: 'rbx-1000', name: '1000 Robux', duration: 'Código Digital', priceUSD: 12.5, savings: 'Ahorro', features: ['1000 Robux oficiales', 'Canje directo en roblox.com/es/redeem', 'Garantía QuinetShop'] },
      { id: 'rbx-1500', name: '1500 Robux', duration: 'Código Digital', priceUSD: 17.5, savings: 'Mega Pack', features: ['1500 Robux oficiales', 'Canje directo en roblox.com/es/redeem', 'Garantía QuinetShop'] }
    ];
  }

  if (name.includes('mobile legends') || name.includes('mlbb')) {
    return [
      { id: 'ml-weekly', name: 'Weekly Diamond Pass', duration: 'Pase Semanal', priceUSD: 3.5, savings: 'Más vendido', features: ['Weekly Diamond Pass', 'Diamantes diarios y recompensas', 'Recarga por ID y Server'] },
      { id: 'ml-twilight', name: 'Twilight Pass', duration: 'Pase de Temporada', priceUSD: 10.0, savings: 'Pase Exclusivo', features: ['Twilight Pass oficial', 'Skins y niveles desbloqueados', 'Recarga por ID y Server'] },
      { id: 'ml-23', name: '23 Diamantes', duration: 'Recarga Directa', priceUSD: 1.0, savings: null, features: ['23 Diamantes MLBB', 'Recarga por ID y Server', 'Entrega inmediata'] },
      { id: 'ml-43', name: '43 Diamantes', duration: 'Recarga Directa', priceUSD: 1.5, savings: null, features: ['43 Diamantes MLBB', 'Recarga por ID y Server', 'Entrega inmediata'] },
      { id: 'ml-86', name: '86 Diamantes', duration: 'Recarga Directa', priceUSD: 2.0, savings: null, features: ['86 Diamantes MLBB', 'Recarga por ID y Server', 'Entrega inmediata'] },
      { id: 'ml-172', name: '172 Diamantes', duration: 'Recarga Directa', priceUSD: 3.5, savings: 'Popular', features: ['172 Diamantes MLBB', 'Recarga por ID y Server', 'Entrega inmediata'] },
      { id: 'ml-257', name: '257 Diamantes', duration: 'Recarga Directa', priceUSD: 4.5, savings: null, features: ['257 Diamantes MLBB', 'Recarga por ID y Server', 'Entrega inmediata'] },
      { id: 'ml-706', name: '706 Diamantes', duration: 'Recarga Directa', priceUSD: 11.0, savings: 'Ahorro', features: ['706 Diamantes MLBB', 'Recarga por ID y Server', 'Entrega inmediata'] },
      { id: 'ml-2195', name: '2195 Diamantes', duration: 'Recarga Directa', priceUSD: 30.5, savings: 'Super Pack', features: ['2195 Diamantes MLBB', 'Recarga por ID y Server', 'Entrega inmediata'] },
      { id: 'ml-3688', name: '3688 Diamantes', duration: 'Recarga Directa', priceUSD: 52.0, savings: 'Mega Pack', features: ['3688 Diamantes MLBB', 'Recarga por ID y Server', 'Entrega inmediata'] },
      { id: 'ml-5532', name: '5532 Diamantes', duration: 'Recarga Directa', priceUSD: 75.0, savings: 'Gran Pack', features: ['5532 Diamantes MLBB', 'Recarga por ID y Server', 'Entrega inmediata'] },
      { id: 'ml-9288', name: '9288 Diamantes', duration: 'Recarga Directa', priceUSD: 125.0, savings: 'Pack Máximo', features: ['9288 Diamantes MLBB', 'Recarga por ID y Server', 'Entrega inmediata'] }
    ];
  }

  if (name.includes('free fire')) {
    return [
      { id: 'ff-mensual', name: 'Tarjeta Mensual', duration: 'Pase 30 Días', priceUSD: 18.0, savings: 'Ahorro Mayor', features: ['Suscripción Tarjeta Mensual', 'Diamantes diarios durante 30 días', 'Recarga oficial por ID'] },
      { id: 'ff-booyah', name: 'Tarjeta Pase Booyah', duration: 'Pase Booyah', priceUSD: 6.0, savings: 'Pase', features: ['Tarjeta Pase Booyah Free Fire', 'Desbloqueo de recompensas exclusivas', 'Recarga oficial por ID'] },
      { id: 'ff-110', name: '110 Diamantes', duration: 'Recarga Directa', priceUSD: 2.0, savings: null, features: ['110 Diamantes Free Fire', 'Recarga directa por ID de Jugador', 'Entrega inmediata'] },
      { id: 'ff-341', name: '341 Diamantes', duration: 'Recarga Directa', priceUSD: 4.5, savings: 'Popular', features: ['341 Diamantes Free Fire', 'Recarga directa por ID de Jugador', 'Entrega inmediata'] },
      { id: 'ff-572', name: '572 Diamantes', duration: 'Recarga Directa', priceUSD: 7.0, savings: null, features: ['572 Diamantes Free Fire', 'Recarga directa por ID de Jugador', 'Entrega inmediata'] },
      { id: 'ff-1166', name: '1166 Diamantes', duration: 'Recarga Directa', priceUSD: 12.0, savings: 'Ahorro', features: ['1166 Diamantes Free Fire', 'Recarga directa por ID de Jugador', 'Entrega inmediata'] },
      { id: 'ff-2398', name: '2398 Diamantes', duration: 'Recarga Directa', priceUSD: 22.5, savings: 'Super Pack', features: ['2398 Diamantes Free Fire', 'Recarga directa por ID de Jugador', 'Entrega inmediata'] },
      { id: 'ff-6160', name: '6160 Diamantes', duration: 'Recarga Directa', priceUSD: 56.0, savings: 'Mega Pack', features: ['6160 Diamantes Free Fire', 'Recarga directa por ID de Jugador', 'Entrega inmediata'] }
    ];
  }

  if (name.includes('fortnite') || name.includes('pavos') || name.includes('v-bucks')) {
    return [
      { id: 'fn-800', name: '800 Pavos', duration: 'Recarga Directa', priceUSD: 10.0, savings: null, features: ['800 Pavos oficiales', 'Recarga directa en cuenta Epic Games', 'Garantía QuinetShop'] },
      { id: 'fn-2400', name: '2400 Pavos', duration: 'Recarga Directa', priceUSD: 25.0, savings: 'Popular', features: ['2400 Pavos oficiales', 'Recarga directa en cuenta Epic Games', 'Garantía QuinetShop'] },
      { id: 'fn-4500', name: '4500 Pavos', duration: 'Recarga Directa', priceUSD: 38.0, savings: 'Ahorro', features: ['4500 Pavos oficiales', 'Recarga directa en cuenta Epic Games', 'Garantía QuinetShop'] },
      { id: 'fn-12500', name: '12500 Pavos', duration: 'Recarga Directa', priceUSD: 95.0, savings: 'Mega Pack', features: ['12500 Pavos oficiales', 'Recarga directa en cuenta Epic Games', 'Garantía QuinetShop'] }
    ];
  }

  if (name.includes('steam')) {
    return [
      { id: 'stm-5', name: 'Tarjeta Steam $5', duration: 'Código Digital', priceUSD: 6.0, savings: '+20% com.', features: ['Tarjeta oficial Steam Wallet $5 USD', 'Canjeable en store.steampowered.com/account/redeemwalletcode', 'Garantía QuinetShop'] },
      { id: 'stm-10', name: 'Tarjeta Steam $10', duration: 'Código Digital', priceUSD: 12.0, savings: '+20% com.', features: ['Tarjeta oficial Steam Wallet $10 USD', 'Canjeable en store.steampowered.com/account/redeemwalletcode', 'Garantía QuinetShop'] },
      { id: 'stm-20', name: 'Tarjeta Steam $20', duration: 'Código Digital', priceUSD: 24.0, savings: '+20% com.', features: ['Tarjeta oficial Steam Wallet $20 USD', 'Canjeable en store.steampowered.com/account/redeemwalletcode', 'Garantía QuinetShop'] },
      { id: 'stm-50', name: 'Tarjeta Steam $50', duration: 'Código Digital', priceUSD: 60.0, savings: '+20% com.', features: ['Tarjeta oficial Steam Wallet $50 USD', 'Canjeable en store.steampowered.com/account/redeemwalletcode', 'Garantía QuinetShop'] },
      { id: 'stm-100', name: 'Tarjeta Steam $100', duration: 'Código Digital', priceUSD: 120.0, savings: '+20% com.', features: ['Tarjeta oficial Steam Wallet $100 USD', 'Canjeable en store.steampowered.com/account/redeemwalletcode', 'Garantía QuinetShop'] }
    ];
  }

  // Mild discount scale for general subscriptions:
  if (product.product_type === 'suscripcion') {
    const p1 = basePrice;
    const p3 = parseFloat((basePrice * 3 * 0.95).toFixed(2));
    const p6 = parseFloat((basePrice * 6 * 0.92).toFixed(2));
    const p12 = parseFloat((basePrice * 12 * 0.88).toFixed(2));

    return [
      {
        id: 'plan-1m',
        name: 'Plan 1 Mes',
        duration: '1 Mes',
        priceUSD: p1,
        savings: null,
        features: getServiceSpecificFeatures(product.name, '1 Mes')
      },
      {
        id: 'plan-3m',
        name: 'Plan 3 Meses',
        duration: '3 Meses',
        priceUSD: p3,
        savings: 'Ahorra 5%',
        features: getServiceSpecificFeatures(product.name, '3 Meses')
      },
      {
        id: 'plan-6m',
        name: 'Plan 6 Meses',
        duration: '6 Meses',
        priceUSD: p6,
        savings: 'Ahorra 8%',
        features: getServiceSpecificFeatures(product.name, '6 Meses')
      },
      {
        id: 'plan-12m',
        name: 'Plan 1 Año',
        duration: '12 Meses',
        priceUSD: p12,
        savings: 'Ahorra 12%',
        features: getServiceSpecificFeatures(product.name, '12 Meses')
      }
    ];
  }

  // For accounts or games: lifetime single plan
  if (product.product_type === 'juego' || product.product_type === 'cuenta') {
    return [
      {
        id: 'plan-lifetime',
        name: 'Acceso Completo',
        duration: product.duration || 'De por vida',
        priceUSD: basePrice,
        savings: 'Pago Único',
        features: [
          'Licencia permanente (De por vida)',
          'Acceso garantizado y credenciales directas',
          'Modo multijugador online y actualizaciones'
        ]
      }
    ];
  }

  // For recargas: base unit plan
  return [
    {
      id: 'plan-recarga',
      name: 'Recarga Digital',
      duration: 'Inmediata',
      priceUSD: basePrice,
      savings: null,
      features: [
        'Entrega directa por ID de jugador / usuario',
        'Tasa accesible en Bolívares sin comisión extra',
        'Comprobante de recarga oficial garantizado'
      ]
    }
  ];
}

/**
 * Returns platform tags strictly based on the product.platform attribute saved in the database.
 * If no platform is defined, returns empty array (no default/guessing tags).
 */
export function getGameTags(product = {}) {
  const platforms = [];
  const stores = [];

  if (product && product.platform && typeof product.platform === 'string') {
    const raw = product.platform.trim();
    if (raw) {
      const parts = raw.split(',').map(p => p.trim()).filter(Boolean);
      platforms.push(...parts);
    }
  }

  return { platforms, stores };
}

/**
 * Returns specific notices / requirements instructions for the product
 */
export function getProductRequirementNotice(product = {}) {
  const name = (product.name || '').toLowerCase();

  if (name.includes('google') || name.includes('drive') || name.includes('one')) {
    return {
      type: 'email_required',
      label: 'Correo Gmail para activación:',
      placeholder: 'tucorreo@gmail.com',
      notice: 'Debes proporcionar tu correo de Google para activar el almacenamiento en tu cuenta personal.'
    };
  }

  if (name.includes('canva')) {
    return {
      type: 'info_link',
      notice: 'Recibirás un enlace de activación oficial para unirte al equipo Pro directamente desde tu cuenta personal de Canva.'
    };
  }

  if (name.includes('cod') || name.includes('call of duty')) {
    return {
      type: 'credentials_required',
      accountLabel: 'Cuenta (Correo o ID de Activision):',
      passwordLabel: 'Contraseña de la cuenta:',
      warning: 'Recomendación de seguridad: Por favor cambia tu contraseña luego de que la recarga sea completada con éxito.'
    };
  }

  if (name.includes('fortnite') || name.includes('pavos')) {
    return {
      type: 'credentials_required',
      accountLabel: 'Correo de Epic Games / Cuenta:',
      passwordLabel: 'Contraseña de la cuenta:',
      warning: 'Recomendación de seguridad: Por favor cambia tu contraseña luego de que la recarga sea completada con éxito.'
    };
  }

  if (name.includes('blood strike') || name.includes('bloodstrike')) {
    return {
      type: 'player_id_required',
      idLabel: 'ID de Jugador Blood Strike (User ID):',
      notice: 'Encontrarás tu ID numérico en tu perfil dentro del juego Blood Strike.'
    };
  }

  if (name.includes('free fire')) {
    return {
      type: 'player_id_required',
      idLabel: 'ID de Jugador Free Fire (UID):',
      notice: 'Copia tu ID numérico desde tu perfil de Free Fire.'
    };
  }

  if (name.includes('mobile legends') || name.includes('mlbb')) {
    return {
      type: 'mlbb_ids_required',
      idLabel: 'ID de Usuario MLBB:',
      zoneLabel: 'Zone ID (4 dígitos):',
      notice: 'Ejemplo: ID 12345678 (2045). Ingresa el ID principal y los 4 dígitos de zona entre paréntesis.'
    };
  }

  if (name.includes('roblox') || name.includes('robux')) {
    return {
      type: 'gift_code',
      redeemUrl: 'https://www.roblox.com/es/redeem',
      notice: 'Recibirás un código de regalo oficial que debes canjear directamente en https://www.roblox.com/es/redeem'
    };
  }

  if (name.includes('steam')) {
    return {
      type: 'gift_code',
      redeemUrl: 'https://store.steampowered.com/account/redeemwalletcode',
      notice: 'Recibirás un código de regalo canjeable en https://store.steampowered.com/account/redeemwalletcode (aplica a todos los juegos de Steam).'
    };
  }

  if (name.includes('minecraft')) {
    return {
      type: 'gift_code',
      redeemUrl: 'https://www.minecraft.net/es-es/redeem',
      notice: 'Recibirás un código oficial canjeable directamente en https://www.minecraft.net/es-es/redeem'
    };
  }

  return null;
}

/**
 * Strips out the internal plans JSON config from the visible user description
 */
export function getCleanDescription(rawDesc) {
  if (!rawDesc) return '';
  if (rawDesc.includes(PLANS_CONFIG_PREFIX)) {
    const start = rawDesc.indexOf(PLANS_CONFIG_PREFIX);
    const end = rawDesc.indexOf(PLANS_CONFIG_SUFFIX, start);
    if (end !== -1) {
      return (rawDesc.slice(0, start) + rawDesc.slice(end + PLANS_CONFIG_SUFFIX.length)).trim();
    }
  }
  return rawDesc.trim();
}

class ProductsService {
  constructor() {
    this.products = [];
    this.listeners = new Set();
    this.channel = null;
  }

  async fetchProducts() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      this.products = data || [];
      this.notify();
      this.setupRealtime();
      return this.products;
    } catch (err) {
      console.error('Error fetching products from Supabase:', err);
      return this.products;
    }
  }

  setupRealtime() {
    if (this.channel) return;
    this.channel = supabase
      .channel('public:products')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        this.fetchProducts();
      })
      .subscribe();
  }

  getAll() {
    return this.products;
  }

  getById(id) {
    return this.products.find(p => p.id === id);
  }

  getCombos() {
    return this.products.filter(p => p.product_type === 'combo');
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify() {
    this.listeners.forEach(cb => {
      try { cb(this.products); } catch (e) { console.error(e); }
    });
  }
}

export const productsService = new ProductsService();
