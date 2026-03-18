/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextResponse } from "next/server";
import * as auth from "@/lib/auth";
import * as sitesData from "@/lib/data/sites";
import * as cloudflare from "@/lib/cloudflare";

vi.mock("@/lib/auth", () => ({
  requirePaidAuth: vi.fn(),
}));

vi.mock("@/lib/data/sites", () => ({
  getSiteBySlug: vi.fn(),
  getSiteByDomain: vi.fn(),
  updateSite: vi.fn(),
}));

vi.mock("@/lib/cloudflare", () => ({
  createCustomHostname: vi.fn(),
  getCustomHostname: vi.fn(),
}));

vi.mock("dns", () => ({
  default: {
    promises: {
      resolveCname: vi.fn(),
    },
  },
  promises: {
    resolveCname: vi.fn(),
  },
}));

import dns from "dns";
import { GET, POST } from "@/app/api/sites/[slug]/domain/route";

const makeParams = (slug: string) => ({ params: Promise.resolve({ slug }) });

const createRequest = (slug: string, method = "GET") =>
  new Request(`http://localhost:3000/api/sites/${slug}/domain`, { method });

describe("GET /api/sites/[slug]/domain", () => {
  beforeEach(() => vi.clearAllMocks());

  it("should return 401 if not paid auth", async () => {
    vi.mocked(auth.requirePaidAuth).mockResolvedValueOnce(
      NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    );
    const res = await GET(createRequest("test-site"), makeParams("test-site"));
    expect(res.status).toBe(401);
  });

  it("should return configured: false when no custom domain", async () => {
    vi.mocked(auth.requirePaidAuth).mockResolvedValueOnce({ slug: "test-site", isPaid: true });
    vi.mocked(sitesData.getSiteBySlug).mockResolvedValueOnce({
      customDomain: null,
      cloudflareHostnameId: null,
    } as any);
    const res = await GET(createRequest("test-site"), makeParams("test-site"));
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.configured).toBe(false);
  });

  it("should check Cloudflare status when hostname ID exists", async () => {
    vi.mocked(auth.requirePaidAuth).mockResolvedValueOnce({ slug: "test-site", isPaid: true });
    vi.mocked(sitesData.getSiteBySlug).mockResolvedValueOnce({
      customDomain: "wedding.example.com",
      cloudflareHostnameId: "cf-123",
      domainVerifiedAt: new Date(),
    } as any);
    vi.mocked(cloudflare.getCustomHostname).mockResolvedValueOnce({
      id: "cf-123",
      status: "active",
      ssl: { status: "active" },
    });
    const res = await GET(createRequest("test-site"), makeParams("test-site"));
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.configured).toBe(true);
    expect(data.sslStatus).toBe("active");
  });

  it("should return pending when SSL not yet active", async () => {
    vi.mocked(auth.requirePaidAuth).mockResolvedValueOnce({ slug: "test-site", isPaid: true });
    vi.mocked(sitesData.getSiteBySlug).mockResolvedValueOnce({
      customDomain: "wedding.example.com",
      cloudflareHostnameId: "cf-123",
      domainVerifiedAt: new Date(),
    } as any);
    vi.mocked(cloudflare.getCustomHostname).mockResolvedValueOnce({
      id: "cf-123",
      status: "pending",
      ssl: { status: "pending_validation" },
    });
    const res = await GET(createRequest("test-site"), makeParams("test-site"));
    const data = await res.json();
    expect(data.configured).toBe(false);
    expect(data.pending).toBe(true);
  });
});

describe("POST /api/sites/[slug]/domain", () => {
  beforeEach(() => vi.clearAllMocks());

  it("should return 401 if not paid auth", async () => {
    vi.mocked(auth.requirePaidAuth).mockResolvedValueOnce(
      NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    );
    const res = await POST(createRequest("test-site", "POST"), makeParams("test-site"));
    expect(res.status).toBe(401);
  });

  it("should return 400 if no custom domain set", async () => {
    vi.mocked(auth.requirePaidAuth).mockResolvedValueOnce({ slug: "test-site", isPaid: true });
    vi.mocked(sitesData.getSiteBySlug).mockResolvedValueOnce({ customDomain: null } as any);
    const res = await POST(createRequest("test-site", "POST"), makeParams("test-site"));
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.error).toMatch(/domain/i);
  });

  it("should return 400 if domain already verified", async () => {
    vi.mocked(auth.requirePaidAuth).mockResolvedValueOnce({ slug: "test-site", isPaid: true });
    vi.mocked(sitesData.getSiteBySlug).mockResolvedValueOnce({
      customDomain: "wedding.example.com",
      domainVerifiedAt: new Date(),
      cloudflareHostnameId: "cf-123",
    } as any);
    const res = await POST(createRequest("test-site", "POST"), makeParams("test-site"));
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.error).toMatch(/already configured/i);
  });

  it("should return 409 if domain is used by another site", async () => {
    vi.mocked(auth.requirePaidAuth).mockResolvedValueOnce({ slug: "test-site", isPaid: true });
    vi.mocked(sitesData.getSiteBySlug).mockResolvedValueOnce({
      slug: "test-site",
      customDomain: "wedding.example.com",
      domainVerifiedAt: null,
      cloudflareHostnameId: null,
    } as any);
    vi.mocked(sitesData.getSiteByDomain).mockResolvedValueOnce({ slug: "other-site" } as any);
    const res = await POST(createRequest("test-site", "POST"), makeParams("test-site"));
    const data = await res.json();
    expect(res.status).toBe(409);
    expect(data.error).toMatch(/already registered/i);
  });

  it("should return 400 if DNS not pointing correctly", async () => {
    vi.mocked(auth.requirePaidAuth).mockResolvedValueOnce({ slug: "test-site", isPaid: true });
    vi.mocked(sitesData.getSiteBySlug).mockResolvedValueOnce({
      slug: "test-site",
      customDomain: "wedding.example.com",
      domainVerifiedAt: null,
      cloudflareHostnameId: null,
    } as any);
    vi.mocked(sitesData.getSiteByDomain).mockResolvedValueOnce(null);
    vi.mocked(dns.promises.resolveCname).mockRejectedValueOnce(new Error("ENOTFOUND"));
    const res = await POST(createRequest("test-site", "POST"), makeParams("test-site"));
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.error).toMatch(/CNAME/i);
  });

  it("should register with Cloudflare when DNS is correct", async () => {
    vi.mocked(auth.requirePaidAuth).mockResolvedValueOnce({ slug: "test-site", isPaid: true });
    vi.mocked(sitesData.getSiteBySlug).mockResolvedValueOnce({
      slug: "test-site",
      customDomain: "wedding.example.com",
      domainVerifiedAt: null,
      cloudflareHostnameId: null,
    } as any);
    vi.mocked(sitesData.getSiteByDomain).mockResolvedValueOnce(null);
    vi.mocked(dns.promises.resolveCname).mockResolvedValueOnce(["proxy.ithinkshewifey.com"]);
    vi.mocked(cloudflare.createCustomHostname).mockResolvedValueOnce({
      id: "cf-new-123",
      status: "pending",
    });
    vi.mocked(sitesData.updateSite).mockResolvedValueOnce({} as any);
    const res = await POST(createRequest("test-site", "POST"), makeParams("test-site"));
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(cloudflare.createCustomHostname).toHaveBeenCalledWith("wedding.example.com");
    expect(sitesData.updateSite).toHaveBeenCalledWith("test-site", {
      cloudflareHostnameId: "cf-new-123",
      domainVerifiedAt: expect.any(Date),
    });
  });
});
