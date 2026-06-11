import { describe, it, expect } from "vitest";
import { socialUrl } from "./social";

describe("socialUrl", () => {
  it("convierte @usuario a URL por red", () => {
    expect(socialUrl("tiktok", "@moondance")).toBe(
      "https://www.tiktok.com/@moondance"
    );
    expect(socialUrl("instagram", "@moondance")).toBe(
      "https://www.instagram.com/moondance"
    );
    expect(socialUrl("facebook", "moondance")).toBe(
      "https://www.facebook.com/moondance"
    );
  });

  it("respeta links completos", () => {
    expect(socialUrl("instagram", "https://instagram.com/x")).toBe(
      "https://instagram.com/x"
    );
  });

  it("devuelve null si está vacío", () => {
    expect(socialUrl("tiktok", null)).toBeNull();
    expect(socialUrl("tiktok", "  ")).toBeNull();
  });
});
