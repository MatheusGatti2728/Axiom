// ================================================================
// AXIOM -- User helpers (thin wrapper over db layer)
// ================================================================

export type { AxiomUser } from "./db"
export {
  dbGetUser       as getUserById,
  dbSaveUser      as upsertUser,
  dbGetAllUsers   as getAllUsers,
} from "./db"

import type { AxiomUser }  from "./db"
import { dbGetUserByEmail, dbGetUserByStripeId } from "./db"

export async function getUserByEmail(email: string): Promise<AxiomUser | null> {
  return await dbGetUserByEmail(email)
}

export async function getUserByStripeCustomerId(cid: string): Promise<AxiomUser | null> {
  return await dbGetUserByStripeId(cid)
}

export function isActive(user: AxiomUser): boolean {
  return user.subscriptionStatus === "active" || user.subscriptionStatus === "trialing"
}
