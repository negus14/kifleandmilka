/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// Set env vars before importing the module
process.env.CLOUDFLARE_API_TOKEN = "test-token";
process.env.CLOUDFLARE_ZONE_ID = "test-zone-id";

import {
  createCustomHostname,
  getCustomHostname,
  deleteCustomHostname,
} from "@/lib/cloudflare";

describe("Cloudflare API Client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createCustomHostname", () => {
    it("should call Cloudflare API and return hostname ID", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          result: { id: "cf-hostname-123", status: "pending" },
        }),
      });

      const result = await createCustomHostname("wedding.example.com");

      expect(result).toEqual({ id: "cf-hostname-123", status: "pending" });
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.cloudflare.com/client/v4/zones/test-zone-id/custom_hostnames",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: "Bearer test-token",
            "Content-Type": "application/json",
          }),
          body: JSON.stringify({
            hostname: "wedding.example.com",
            ssl: { method: "http", type: "dv", settings: { min_tls_version: "1.2" } },
          }),
        })
      );
    });

    it("should throw on Cloudflare API error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          errors: [{ message: "Hostname already exists" }],
        }),
      });

      await expect(createCustomHostname("taken.example.com")).rejects.toThrow(
        "Hostname already exists"
      );
    });
  });

  describe("getCustomHostname", () => {
    it("should return hostname status", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          result: { id: "cf-123", status: "active", ssl: { status: "active" } },
        }),
      });

      const result = await getCustomHostname("cf-123");

      expect(result).toEqual({
        id: "cf-123",
        status: "active",
        ssl: { status: "active" },
      });
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.cloudflare.com/client/v4/zones/test-zone-id/custom_hostnames/cf-123",
        expect.objectContaining({ method: "GET" })
      );
    });
  });

  describe("deleteCustomHostname", () => {
    it("should delete hostname", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await deleteCustomHostname("cf-123");

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.cloudflare.com/client/v4/zones/test-zone-id/custom_hostnames/cf-123",
        expect.objectContaining({ method: "DELETE" })
      );
    });
  });

  describe("missing config", () => {
    it("should throw if env vars are missing", async () => {
      const origToken = process.env.CLOUDFLARE_API_TOKEN;
      const origZone = process.env.CLOUDFLARE_ZONE_ID;
      delete process.env.CLOUDFLARE_API_TOKEN;
      delete process.env.CLOUDFLARE_ZONE_ID;

      await expect(createCustomHostname("test.com")).rejects.toThrow(
        /CLOUDFLARE_API_TOKEN/
      );

      process.env.CLOUDFLARE_API_TOKEN = origToken;
      process.env.CLOUDFLARE_ZONE_ID = origZone;
    });
  });
});
