// Static preview only. Requests are accepted by the operator's own Node server.
export const worker = {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (pathname === '/send-data' || pathname === '/send-date') {
      return Response.json({ success: false, error: 'This endpoint has been removed' }, { status: 410 });
    }
    if (pathname === '/api/requests') {
      return Response.json(
        { success: false, error: 'Deploy the contact server on the operator\'s own infrastructure' },
        { status: 503 },
      );
    }
    if (env.ASSETS && (request.method === 'GET' || request.method === 'HEAD')) {
      return env.ASSETS.fetch(request);
    }
    return Response.json({ success: false, error: 'Not found' }, { status: 404 });
  },
};

export default worker;
