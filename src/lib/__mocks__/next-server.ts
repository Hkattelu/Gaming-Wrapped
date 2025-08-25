export class NextRequest {}

export class NextResponse {
  static json(data: any, init?: { status?: number }) {
    const status = init?.status ?? 200;
    return {
      status,
      async json() {
        return data;
      },
    } as { status: number; json: () => Promise<any> };
  }
}
