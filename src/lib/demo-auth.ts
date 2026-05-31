import type { UserRole } from "./types";

export const demoAuthCookieName = "aigenius_demo_role";
export const demoAuthPassword = "aigenius123";

export type DemoAccount = {
  email: string;
  password: string;
  role: UserRole;
  dashboardPath: string;
};

export const demoAccounts: DemoAccount[] = [
  {
    email: "admin@aigenius.test",
    password: demoAuthPassword,
    role: "admin",
    dashboardPath: "/admin",
  },
  {
    email: "teacher@aigenius.test",
    password: demoAuthPassword,
    role: "teacher",
    dashboardPath: "/teacher",
  },
  {
    email: "student@aigenius.test",
    password: demoAuthPassword,
    role: "student",
    dashboardPath: "/student",
  },
  {
    email: "parent@aigenius.test",
    password: demoAuthPassword,
    role: "parent",
    dashboardPath: "/parent",
  },
];

export function findDemoAccount(email: string, password: string) {
  return demoAccounts.find(
    (account) =>
      account.email.toLowerCase() === email.toLowerCase() &&
      account.password === password,
  );
}

export function isUserRole(value: string | undefined): value is UserRole {
  return value === "admin" || value === "teacher" || value === "student" || value === "parent";
}
