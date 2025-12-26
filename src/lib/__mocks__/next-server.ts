export class NextRequest {
  url: string;
  constructor(input: string | Request | URL, init?: any) {
    if (typeof input === 'string') {
      this.url = input;
    } else if (input instanceof URL) {
      this.url = input.toString();
    } else {
      this.url = (input as any).url || '';
    }
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

  static json(data: any, init?: ResponseInit) {
    // Return a new instance so it behaves exactly like a constructed response
    // but with the body stringified and proper content-type
    const jsonBody = JSON.stringify(data);
    const response = new NextResponse(jsonBody, init);
    response.headers.set('Content-Type', 'application/json');
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
