import { describe, it, expect, vi, afterEach } from 'vitest';
import worker from '../src/index.js';

const origin = 'https://vinodell.github.io';
const payload = {
  name: 'Катя', email: 'kate@example.com', feature: 'Аудит',
  date: new Date(Date.now() + 86400000).toISOString(),
};
const env = { TELEGRAM_BOT_TOKEN: 'test-token', TELEGRAM_CHAT_ID: 'test-chat' };
const request = (body = payload, headers = {}) => new Request('https://example.com/send-data', {
  method: 'POST',
  headers: { Origin: origin, 'Content-Type': 'application/json', ...headers },
  body: JSON.stringify(body),
});

afterEach(() => vi.unstubAllGlobals());

describe('Contact API', () => {
  it('allows the GitHub Pages preflight', async () => {
    const response = await worker.fetch(new Request('https://example.com/send-data', {
      method: 'OPTIONS', headers: { Origin: origin, 'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type' },
    }), {});
    expect(response.status).toBe(204);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe(origin);
    expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type');
  });

  it('rejects an untrusted origin without sending a message', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const response = await worker.fetch(request(payload, { Origin: 'https://example.org' }), env);
    expect(response.status).toBe(403);
    expect(response.headers.has('Access-Control-Allow-Origin')).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([null, {}, { ...payload, name: ' ' }, { ...payload, email: 'invalid' },
    { ...payload, date: '2000-01-01T00:00:00.000Z' }, { ...payload, feature: {} },
    { ...payload, date: '2030-01-01T12:00' }])('rejects invalid data: %j', async (body) => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const response = await worker.fetch(request(body), env);
    expect(response.status).toBe(400);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe(origin);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns 400 for malformed JSON', async () => {
    const response = await worker.fetch(new Request('https://example.com/send-data', {
      method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: '{',
    }), env);
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

  it('preserves CORS headers when Telegram fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ ok: false }, { status: 500 })));
    const response = await worker.fetch(request(), env);
    expect(response.status).toBe(502);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe(origin);
  });

  it('rejects the old misspelled endpoint', async () => {
    const response = await worker.fetch(new Request('https://example.com/send-date', {
      method: 'POST', headers: { Origin: origin },
    }), {});
    expect(response.status).toBe(404);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe(origin);
  });
});
