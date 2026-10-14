import { describe, it, expect, vi, afterEach } from 'vitest';
import worker from '../src/index.js';

const origin = 'https://vinodell.github.io';
const payload = {
	name: 'Катя',
	email: 'kate@example.com',
	feature: 'Аудит',
	date: new Date(Date.now() + 86400000).toISOString(),
};
const env = { TELEGRAM_BOT_TOKEN: 'test-token', TELEGRAM_CHAT_ID: 'test-chat' };
const request = (body = payload, headers = {}) =>
	new Request('https://example.com/send-data', {
		method: 'POST',
		headers: { Origin: origin, 'Content-Type': 'application/json', ...headers },
		body: JSON.stringify(body),
	});

afterEach(() => vi.unstubAllGlobals());

describe('Contact API', () => {
	it('allows the GitHub Pages preflight', async () => {
		const response = await worker.fetch(
			new Request('https://example.com/send-data', {
				method: 'OPTIONS',
				headers: { Origin: origin, 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'content-type' },
			}),
			{},
		);
		expect(response.status).toBe(204);
		expect(response.headers.get('Access-Control-Allow-Origin')).toBe(origin);
		expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type');
	});

	it.each(['http://localhost:3001', 'http://127.0.0.1:3001'])(
		'accepts a local preview submission after preflight from %s',
		async (previewOrigin) => {
			const fetchMock = vi.fn().mockResolvedValue(Response.json({ ok: true }));
			vi.stubGlobal('fetch', fetchMock);
			const preflight = await worker.fetch(
				new Request('https://example.com/send-data', {
					method: 'OPTIONS',
					headers: { Origin: previewOrigin, 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'content-type' },
				}),
				env,
			);
			expect(preflight.status).toBe(204);
			expect(preflight.headers.get('Access-Control-Allow-Origin')).toBe(previewOrigin);
			expect(fetchMock).not.toHaveBeenCalled();

			const response = await worker.fetch(request(payload, { Origin: previewOrigin }), env);
			expect(response.status).toBe(200);
			expect(response.headers.get('Access-Control-Allow-Origin')).toBe(previewOrigin);
			expect(await response.json()).toEqual({ success: true });
			expect(fetchMock).toHaveBeenCalledTimes(1);
		},
	);

	it('rejects an untrusted origin without sending a message', async () => {
		const fetchMock = vi.fn();
		vi.stubGlobal('fetch', fetchMock);
		const response = await worker.fetch(request(payload, { Origin: 'https://example.org' }), env);
		expect(response.status).toBe(403);
		expect(response.headers.has('Access-Control-Allow-Origin')).toBe(false);
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it.each([
		null,
		{},
		{ ...payload, name: ' ' },
		{ ...payload, email: 'invalid' },
		{ ...payload, date: '2000-01-01T00:00:00.000Z' },
		{ ...payload, feature: {} },
		{ ...payload, date: '2030-01-01T12:00' },
	])('rejects invalid data: %j', async (body) => {
		const fetchMock = vi.fn();
		vi.stubGlobal('fetch', fetchMock);
		const response = await worker.fetch(request(body), env);
		expect(response.status).toBe(400);
		expect(response.headers.get('Access-Control-Allow-Origin')).toBe(origin);
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it('returns 400 for malformed JSON', async () => {
		const response = await worker.fetch(
			new Request('https://example.com/send-data', {
				method: 'POST',
				headers: { Origin: origin, 'Content-Type': 'application/json' },
				body: '{',
			}),
			env,
		);
		expect(response.status).toBe(400);
	});

	it('reports missing configuration', async () => {
		expect((await worker.fetch(request(), {})).status).toBe(503);
	});

	it('sends a validated request', async () => {
		const fetchMock = vi.fn().mockResolvedValue(Response.json({ ok: true }));
		vi.stubGlobal('fetch', fetchMock);
		const response = await worker.fetch(request(), env);
		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({ success: true });
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});

	it('includes validated optional consent evidence in the Telegram message', async () => {
		const fetchMock = vi.fn().mockResolvedValue(Response.json({ ok: true }));
		vi.stubGlobal('fetch', fetchMock);
		const consent = { accepted: true, acceptedAt: '2000-01-01T00:00:00.000Z', version: '2026-10-14.2' };
		const response = await worker.fetch(request({ ...payload, consent }), env);
		expect(response.status).toBe(200);
		expect(fetchMock).toHaveBeenCalledTimes(1);
		const [url, options] = fetchMock.mock.calls[0];
		expect(url).toBe('https://api.telegram.org/bottest-token/sendMessage');
		const message = JSON.parse(options.body);
		expect(message.chat_id).toBe('test-chat');
		expect(message.text).toContain('Согласие на обработку персональных данных: дано');
		expect(message.text).toContain(`Время согласия (UTC): ${consent.acceptedAt}`);
		expect(message.text).toContain(`Версия согласия: ${consent.version}`);
	});

	it.each([
		null,
		[],
		{},
		{ accepted: false, acceptedAt: '2026-10-14T09:00:00.000Z', version: '2026-10-14.2' },
		{ accepted: true, acceptedAt: '2026-10-14T09:00:00.000Z', version: '2026-10-14' },
		{ accepted: true, acceptedAt: '2026-10-14', version: '2026-10-14.2' },
		{ accepted: true, acceptedAt: '2026-02-31T09:00:00.000Z', version: '2026-10-14.2' },
		{ accepted: true, acceptedAt: 123, version: '2026-10-14.2' },
	])('rejects invalid optional consent evidence without sending: %j', async (consent) => {
		const fetchMock = vi.fn();
		vi.stubGlobal('fetch', fetchMock);
		const response = await worker.fetch(request({ ...payload, consent }), env);
		expect(response.status).toBe(400);
		expect(response.headers.get('Access-Control-Allow-Origin')).toBe(origin);
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it('preserves CORS headers when Telegram fails', async () => {
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ ok: false }, { status: 500 })));
		const response = await worker.fetch(request(), env);
		expect(response.status).toBe(502);
		expect(response.headers.get('Access-Control-Allow-Origin')).toBe(origin);
	});

	it('rejects the old misspelled endpoint', async () => {
		const response = await worker.fetch(
			new Request('https://example.com/send-date', {
				method: 'POST',
				headers: { Origin: origin },
			}),
			{},
		);
		expect(response.status).toBe(404);
		expect(response.headers.get('Access-Control-Allow-Origin')).toBe(origin);
	});
});
