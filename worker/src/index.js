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
}

const jsonResponse = (data, status, corsHeaders) => {
	return new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}

const isAllowedOrigin = (origin) => {
	if (!origin) return false;

	if (origin === 'https://vinodell.github.io') {
		return true;
	}

	return /^http:\/\/localhost:\d+$/.test(origin);
}

export const worker = {
	async fetch(request, env) {
		const corsHeaders = getCorsHeaders(request);
		const url = new URL(request.url);
		if (request.method === 'OPTIONS') {
			return new Response(null, { status: 204, headers: corsHeaders });
		}
		if (url.pathname !== '/send-data') {
			return jsonResponse({ success: false, error: 'Not found' }, 404, corsHeaders);
		}
		if (request.method !== 'POST') {
			return jsonResponse({ success: false, error: 'Method not allowed' }, 405, corsHeaders);
		}
		try {
			const { name, email, date, feature } = await request.json();
			if (!name || !email || !date || !feature) {
				return jsonResponse({ success: false, error: 'Missing required fields' }, 400, corsHeaders);
			}
			const text = [
				'🏆 Новая заявка!',
				'',
				`🎯 Имя клиента: ${name}`,
				'',
				`📍 Рабочий email: ${email}`,
				`🚀 Topic to discuss: ${feature}`,
				`📅 Дата: ${date}`,
			].join('\n');
			const telegramResponse = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text }),
			});
			const telegramResult = await telegramResponse.json();
			if (!telegramResponse.ok || !telegramResult.ok) {
				console.error('Telegram error:', telegramResult);
				return jsonResponse({ success: false, error: 'Telegram API error' }, 502, corsHeaders);
			}
			return jsonResponse({ success: true }, 200, corsHeaders);
		} catch (error) {
			console.error(error);
			return jsonResponse({ success: false, error: 'Internal server error' }, 500, corsHeaders);
		}
	},
};
