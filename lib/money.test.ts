import { describe, it, expect } from "vitest";
import { formatMXN } from "./money";

describe("formatMXN", () => {
  it("formatea enteros con dos decimales y signo de pesos", () => {
    expect(formatMXN(150)).toBe("$150.00");
  });

  it("formatea miles con separador", () => {
    expect(formatMXN(1500)).toBe("$1,500.00");
  });

  it("formatea cero", () => {
    expect(formatMXN(0)).toBe("$0.00");
  });
});
