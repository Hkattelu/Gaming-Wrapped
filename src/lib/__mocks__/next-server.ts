export class NextRequest {
  url: string;
  method: string;
  headers: Headers;

  constructor(input: string | Request | URL, init?: RequestInit) {
    const url =
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.toString()
          : typeof (input as { url?: unknown }).url === 'string'
            ? (input as { url: string }).url
            : '';

    if (!url) {
      throw new Error('NextRequest requires a valid url');
    }

    this.url = url;

    const requestLike = typeof input === 'string' || input instanceof URL ? undefined : (input as unknown as Record<string, unknown>);
    this.method = init?.method ?? (requestLike?.method as string | undefined) ?? 'GET';
    this.headers = new Headers(init?.headers ?? (requestLike?.headers as HeadersInit | undefined));
  }
}

export class NextResponse {
  body: BodyInit | null;
  status: number;
  headers: Headers;
  ok: boolean;

  constructor(body?: BodyInit | null, init?: ResponseInit) {
    this.body = body ?? null;
    this.status = init?.status ?? 200;
    this.headers = new Headers(init?.headers);
    this.ok = this.status >= 200 && this.status < 300;
  }

  static json(data: Record<string, unknown>, init?: ResponseInit) {
    // Return a new instance so it behaves exactly like a constructed response
    // but with the body stringified and proper content-type
    const jsonBody = JSON.stringify(data);
    const response = new NextResponse(jsonBody, init);

    if (!response.headers.has('content-type')) {
      response.headers.set('Content-Type', 'application/json');
    }

    return response;
  }

  async json() {
    if (typeof this.body === 'string') {
      try {
        return JSON.parse(this.body);
      } catch {
        // Fallback or throw based on expected behavior; strict JSON parsing throws
        throw new Error('Invalid JSON body');
      }
    }
    return null;
  }

  async text() {
    return this.body ? String(this.body) : '';
  }
}
