export class NextRequest {}

export class NextResponse {
  body: any;
  status: number;
  headers: any;

  constructor(body: any, init?: any) {
    this.body = body;
    this.status = init?.status ?? 200;
    this.headers = init?.headers;
  }

  static json(data: any, init?: { status?: number }) {
    const status = init?.status ?? 200;
    return {
      status,
      async json() {
        return data;
      },
    } as { status: number; json: () => Promise<any> };
  }

  async text() {
      return this.body;
  }

  async json() {
      return JSON.parse(this.body);
  }
}
