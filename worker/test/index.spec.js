import { describe, it, expect, vi, afterEach } from 'vitest';
import worker from '../src/index.js';

afterEach(() => vi.unstubAllGlobals());

describe('Static preview', () => {
  it.each(['/send-data', '/send-date'])('disables the old delivery endpoint %s', async (path) => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const response = await worker.fetch(new Request(`https://example.com${path}`, { method: 'POST' }), {});
    expect(response.status).toBe(410);
    expect(await response.json()).toMatchObject({ success: false });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('does not pretend to accept a request when only static hosting is available', async () => {
    const response = await worker.fetch(new Request('https://example.com/api/requests', { method: 'POST' }), {});
    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ success: false });
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
    const response = await worker.fetch(new Request('https://example.com/send-date', {
      method: 'POST', headers: { Origin: origin },
    }), {});
    expect(response.status).toBe(404);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe(origin);
  });
});
