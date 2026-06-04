import { describe, expect, test, beforeEach, afterEach } from "bun:test";
import { getAppUrl } from "@/lib/shared/url";

describe("getAppUrl", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.APP_URL;
    delete process.env.NEXT_PUBLIC_APP_URL;
    delete process.env.VERCEL_URL;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  test("returns APP_URL if it is set (highest priority)", () => {
    process.env.APP_URL = "https://app.test";
    process.env.NEXT_PUBLIC_APP_URL = "https://next.test";
    process.env.VERCEL_URL = "vercel.test";

    expect(getAppUrl()).toBe("https://app.test");
  });

  test("returns NEXT_PUBLIC_APP_URL if APP_URL is not set and it does not contain localhost", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://next.test";
    process.env.VERCEL_URL = "vercel.test";

    expect(getAppUrl()).toBe("https://next.test");
  });

  test("returns formatted VERCEL_URL if NEXT_PUBLIC_APP_URL contains localhost", () => {
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:4000";
    process.env.VERCEL_URL = "vercel.test";

    expect(getAppUrl()).toBe("https://vercel.test");
  });

  test("returns NEXT_PUBLIC_APP_URL as fallback if VERCEL_URL is not set (even if containing localhost)", () => {
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:4000";

    expect(getAppUrl()).toBe("http://localhost:4000");
  });

  test("returns default localhost URL if no environment variables are set", () => {
    expect(getAppUrl()).toBe("http://localhost:3000");
  });
});
