// lib/adminConfig.ts
// In a production environment, sensitive data like passwords should not be hardcoded
// directly in client-side code due to security risks. Consider using server-side checks
// (e.g., Firebase Cloud Functions, Next.js API Routes, or Server Actions) for admin authentication.

const ADMIN_ACCOUNTS = [
  {
    email: "envostructs@gmail.com",
    password: "ADMIN_TUTORIUM", // This password will be used for Firebase Auth account creation if not exists
    role: "admin" as const,
    displayName: "Admin User 1",
  },
  {
    email: "lateefedidi4@gmail.com",
    password: "ADMIN_TUTORIUM", // This password will be used for Firebase Auth account creation if not exists
    role: "admin" as const,
    displayName: "Admin User 2",
  },
]

export function isAdminAccount(email: string): boolean {
  return ADMIN_ACCOUNTS.some((admin) => admin.email.toLowerCase() === email.toLowerCase())
}

export function validateAdminCredentials(email: string, password: string): boolean {
  const admin = ADMIN_ACCOUNTS.find((admin) => admin.email.toLowerCase() === email.toLowerCase())
  return admin ? admin.password === password : false
}

export function getAdminAccountInfo(email: string) {
  return ADMIN_ACCOUNTS.find((admin) => admin.email.toLowerCase() === email.toLowerCase())
}
