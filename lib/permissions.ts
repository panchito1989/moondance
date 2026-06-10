export type Rol = "duena" | "maestro";

export function canManageConcepts(rol: Rol): boolean {
  return rol === "duena";
}

export function canViewReports(rol: Rol): boolean {
  return rol === "duena";
}

export function canManageUsers(rol: Rol): boolean {
  return rol === "duena";
}

export function canManageStudents(rol: Rol): boolean {
  return rol === "duena" || rol === "maestro";
}

export function canChargeAndAttend(rol: Rol): boolean {
  return rol === "duena" || rol === "maestro";
}
