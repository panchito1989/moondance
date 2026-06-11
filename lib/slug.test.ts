import { describe, it, expect } from "vitest";
import { slugify } from "./slug";

describe("slugify", () => {
  it("convierte a minúsculas y guiones", () => {
    expect(slugify("Festival Navideño 2026")).toBe("festival-navideno-2026");
  });

  it("quita acentos y caracteres especiales", () => {
    expect(slugify("¡Gran Función: Año Nuevo!")).toBe("gran-funcion-ano-nuevo");
  });

  it("no deja guiones al inicio o final", () => {
    expect(slugify("  hola mundo  ")).toBe("hola-mundo");
  });
});
