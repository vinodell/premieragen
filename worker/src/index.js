const getCorsHeaders = (request) => {
	const origin = request.headers.get('Origin');

	const headers = {
		'Access-Control-Allow-Methods': 'POST, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type',
		'Access-Control-Max-Age': '86400',
		Vary: 'Origin',
	};

	if (isAllowedOrigin(origin)) {
		headers['Access-Control-Allow-Origin'] = origin;
	}

	return headers;
};

const jsonResponse = (data, status, corsHeaders) => {
	return new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
};

const isAllowedOrigin = (origin) => {
	if (!origin) return false;

	if (origin === 'https://vinodell.github.io' || origin === 'https://premier.max-khamitov.workers.dev') {
		return true;
	}

	return /^http:\/\/localhost:\d+$/.test(origin);
};

export const worker = {
	async fetch(request, env) {
		const corsHeaders = getCorsHeaders(request);
		const url = new URL(request.url);
		if (request.method === 'OPTIONS') {
			return new Response(null, { status: 204, headers: corsHeaders });
		}
		if (url.pathname !== '/send-data') {
			if (env.ASSETS && (request.method === 'GET' || request.method === 'HEAD')) {
				return env.ASSETS.fetch(request);
			}
			return jsonResponse({ success: false, error: 'Not found' }, 404, corsHeaders);
		}
		if (request.method !== 'POST') {
			return jsonResponse({ success: false, error: 'Method not allowed' }, 405, corsHeaders);
		}
		if (!isAllowedOrigin(request.headers.get('Origin'))) {
			return jsonResponse({ success: false, error: 'Origin not allowed' }, 403, corsHeaders);
		}
		if (request.headers.get('Content-Type')?.split(';')[0].trim() !== 'application/json') {
			return jsonResponse({ success: false, error: 'Expected JSON' }, 415, corsHeaders);
		}
		let payload;
		try {
			payload = await request.json();
		} catch {
			return jsonResponse({ success: false, error: 'Invalid JSON' }, 400, corsHeaders);
		}
		if (
			!payload ||
			typeof payload !== 'object' ||
			['name', 'email', 'date', 'feature'].some((key) => typeof payload[key] !== 'string' || !payload[key].trim())
		) {
			return jsonResponse({ success: false, error: 'Missing required fields' }, 400, corsHeaders);
		}
		const { date } = payload;
		const name = payload.name.trim();
		const email = payload.email.trim();
		const feature = payload.feature.trim();
		if (
			name.length > 100 ||
			email.length > 254 ||
			feature.length > 500 ||
			!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
			!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(date) ||
			!Number.isFinite(Date.parse(date)) ||
			Date.parse(date) <= Date.now() ||
			new Date(date).toISOString() !== date
		) {
			return jsonResponse({ success: false, error: 'Invalid fields or appointment date' }, 400, corsHeaders);
		}
		if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
			return jsonResponse({ success: false, error: 'Service not configured' }, 503, corsHeaders);
		}
		try {
			const text = [
				'🏆 Новая заявка!',
				'',
				`🎯 Имя клиента: ${name}`,
				'',
				`📍 Рабочий email: ${email}`,
				`🚀 Topic to discuss: ${feature}`,
				`📅 Дата (Москва): ${new Intl.DateTimeFormat('ru-RU', {
					timeZone: 'Europe/Moscow',
					dateStyle: 'medium',
					timeStyle: 'short',
				}).format(new Date(date))}`,
			].join('\n');
			const telegramResponse = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				signal: AbortSignal.timeout(10000),
				body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text }),
			});
			const telegramResult = await telegramResponse.json();
			if (!telegramResponse.ok || !telegramResult.ok) {
				console.error('Telegram delivery failed:', telegramResponse.status);
				return jsonResponse({ success: false, error: 'Telegram API error' }, 502, corsHeaders);
			}
			return jsonResponse({ success: true }, 200, corsHeaders);
		} catch {
			console.error('Request failed');
			return jsonResponse({ success: false, error: 'Internal server error' }, 500, corsHeaders);
		}
	},
};

export default worker;
