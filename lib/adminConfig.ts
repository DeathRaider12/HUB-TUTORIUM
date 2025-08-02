// lib/adminConfig.ts
export const ADMIN_EMAILS = ["envostructs@gmail.com", "lateefedidi4@gmail.com"]

export const ADMIN_PASSWORD = "ADMIN_TUTORIUM" // This should ideally be an environment variable in a real app

export function isAdminAccount(email: string): boolean {
  return ADMIN_EMAILS.includes(email)
}

export function validateAdminCredentials(email: string, password: string): boolean {
  return isAdminAccount(email) && password === ADMIN_PASSWORD
}
