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

  it('serves static pages using the assets binding', async () => {
    const assets = { fetch: vi.fn().mockResolvedValue(new Response('page')) };
    const request = new Request('https://example.com/');
    expect(await (await worker.fetch(request, { ASSETS: assets })).text()).toBe('page');
    expect(assets.fetch).toHaveBeenCalledWith(request);
  });
});
