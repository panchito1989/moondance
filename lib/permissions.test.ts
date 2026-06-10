import { describe, it, expect } from "vitest";
import {
  canManageConcepts,
  canViewReports,
  canManageUsers,
  canManageStudents,
  canChargeAndAttend,
} from "./permissions";

describe("permisos por rol", () => {
  it("solo la dueña gestiona conceptos/precios", () => {
    expect(canManageConcepts("duena")).toBe(true);
    expect(canManageConcepts("maestro")).toBe(false);
  });

  it("solo la dueña ve reportes globales", () => {
    expect(canViewReports("duena")).toBe(true);
    expect(canViewReports("maestro")).toBe(false);
  });

  it("solo la dueña administra usuarios", () => {
    expect(canManageUsers("duena")).toBe(true);
    expect(canManageUsers("maestro")).toBe(false);
  });

  it("dueña y maestro gestionan alumnas", () => {
    expect(canManageStudents("duena")).toBe(true);
    expect(canManageStudents("maestro")).toBe(true);
  });

  it("dueña y maestro cobran y marcan asistencia", () => {
    expect(canChargeAndAttend("duena")).toBe(true);
    expect(canChargeAndAttend("maestro")).toBe(true);
  });
});
