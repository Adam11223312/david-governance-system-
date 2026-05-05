let auditLog = [];

export async function POST(req) {
  const event = await req.json();

  auditLog.push({
    ...event,
    id: auditLog.length + 1,
    timestamp: new Date().toISOString()
  });

  return Response.json({ success: true });
}

export async function GET() {
  return Response.json({ log: auditLog });
}
