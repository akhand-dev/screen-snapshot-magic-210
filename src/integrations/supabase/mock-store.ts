// In-memory mock store for Supabase operations when Supabase environment variables are absent.
// Allows the app to run completely standalone with full local interactivity.

export type MockRow = {
  id: string;
  created_at: string;
  standard: string;
  subject: string;
  year: string;
  paper_type: string;
  set_number: string | null;
  paper_url: string;
  solution_url: string | null;
  [key: string]: unknown;
};

// Global in-memory storage (preserved across route navigations)
const memoryTables: Record<string, MockRow[]> = {
  cbse_pyqs: [],
};

class MockQueryBuilder<T = MockRow> implements PromiseLike<{ data: T[] | T | null; error: null }> {
  private tableName: string;
  private filters: Array<(row: MockRow) => boolean> = [];
  private sortFn: ((a: MockRow, b: MockRow) => number) | null = null;
  private isDelete = false;
  private insertData: unknown = null;
  private updateData: Partial<MockRow> | null = null;
  private isSingle = false;

  constructor(tableName: string) {
    this.tableName = tableName;
    if (!memoryTables[tableName]) {
      memoryTables[tableName] = [];
    }
  }

  select(_cols?: string): this {
    return this;
  }

  order(col: string, options?: { ascending?: boolean }): this {
    const asc = options?.ascending ?? true;
    this.sortFn = (a: MockRow, b: MockRow) => {
      const valA = String(a[col] ?? "");
      const valB = String(b[col] ?? "");
      if (valA < valB) return asc ? -1 : 1;
      if (valA > valB) return asc ? 1 : -1;
      return 0;
    };
    return this;
  }

  eq(col: string, val: unknown): this {
    this.filters.push((row: MockRow) => String(row[col]) === String(val));
    return this;
  }

  insert(data: unknown): this {
    this.insertData = data;
    return this;
  }

  delete(): this {
    this.isDelete = true;
    return this;
  }

  update(data: Partial<MockRow>): this {
    this.updateData = data;
    return this;
  }

  single(): this {
    this.isSingle = true;
    return this;
  }

  private execute(): { data: T[] | T | null; error: null } {
    const list = memoryTables[this.tableName] || [];

    if (this.insertData) {
      const rawItems = Array.isArray(this.insertData) ? this.insertData : [this.insertData];
      const inserted: MockRow[] = rawItems.map((item: Record<string, unknown>) => ({
        id:
          typeof item["id"] === "string"
            ? item["id"]
            : `item_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        created_at:
          typeof item["created_at"] === "string" ? item["created_at"] : new Date().toISOString(),
        standard: String(item["standard"] ?? "10"),
        subject: String(item["subject"] ?? ""),
        year: String(item["year"] ?? ""),
        paper_type: String(item["paper_type"] ?? "Board Paper"),
        set_number: item["set_number"] ? String(item["set_number"]) : null,
        paper_url: String(item["paper_url"] ?? ""),
        solution_url: item["solution_url"] ? String(item["solution_url"]) : null,
        ...item,
      }));
      list.push(...inserted);
      return {
        data: (Array.isArray(this.insertData) ? inserted : inserted[0]) as unknown as T[] | T,
        error: null,
      };
    }

    if (this.isDelete) {
      if (this.filters.length > 0) {
        memoryTables[this.tableName] = list.filter((r) => !this.filters.every((f) => f(r)));
      } else {
        memoryTables[this.tableName] = [];
      }
      return { data: null, error: null };
    }

    if (this.updateData) {
      const updated: MockRow[] = [];
      for (let i = 0; i < list.length; i++) {
        const item = list[i]!;
        if (this.filters.every((f) => f(item))) {
          list[i] = { ...item, ...this.updateData };
          updated.push(list[i]!);
        }
      }
      return {
        data: (this.isSingle ? (updated[0] ?? null) : updated) as unknown as T[] | T | null,
        error: null,
      };
    }

    let result = [...list];
    for (const filter of this.filters) {
      result = result.filter(filter);
    }
    if (this.sortFn) {
      result.sort(this.sortFn);
    }

    return {
      data: (this.isSingle ? (result[0] ?? null) : result) as unknown as T[] | T | null,
      error: null,
    };
  }

  then<TResult1 = { data: T[] | T | null; error: null }, TResult2 = never>(
    onfulfilled?:
      ((value: { data: T[] | T | null; error: null }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> {
    const res = this.execute();
    return Promise.resolve(res).then(onfulfilled, onrejected);
  }
}

export type MockSupabaseClient = {
  auth: {
    getSession: () => Promise<{ data: { session: null }; error: null }>;
    getUser: () => Promise<{ data: { user: null }; error: null }>;
    onAuthStateChange: () => { data: { subscription: { unsubscribe: () => void } } };
    getClaims: () => Promise<{ data: { claims: null }; error: Error }>;
  };
  from: <T = MockRow>(tableName: string) => MockQueryBuilder<T>;
};

export function createMockSupabaseClient(): MockSupabaseClient {
  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      getClaims: async () => ({ data: { claims: null }, error: new Error("No session active") }),
    },
    from<T = MockRow>(tableName: string) {
      return new MockQueryBuilder<T>(tableName);
    },
  };
}
