// Admin configuration - DO NOT EXPOSE TO CLIENT
const ADMIN_ACCOUNTS = [
  {
    email: "envostructs@gmail.com",
    password: "ADMIN_TUTORIUM",
    role: "admin" as const,
    displayName: "Admin User 1",
  },
  {
    email: "lateefedidi4@gmail.com",
    password: "ADMIN_TUTORIUM",
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
