import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

/**
 * Get the current session on the server
 */
export async function getSession() {
  return await getServerSession();
}

/**
 * Get the current authenticated user on the server
 */
export async function getCurrentUser() {
  const session = await getSession();
  return session?.user;
}

/**
 * Check if the current user is authenticated on the server
 */
export async function isAuthenticated() {
  const user = await getCurrentUser();
  return !!user;
}

/**
 * Check if the current user has admin role
 */
export async function isAdmin() {
  const user = await getCurrentUser();
  return user?.role === 'owner' || user?.role === 'barber' || user?.role === 'receptionist';
}

/**
 * Check if the current user has owner role
 */
export async function isOwner() {
  const user = await getCurrentUser();
  return user?.role === 'owner';
}

/**
 * Require authentication or redirect to login
 */
export async function requireAuth() {
  const isAuthed = await isAuthenticated();
  if (!isAuthed) {
    redirect('/login');
  }
}

/**
 * Require admin role or redirect to login
 */
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || !(user.role === 'owner' || user.role === 'barber' || user.role === 'receptionist')) {
    redirect('/login');
  }
}

/**
 * Require owner role or redirect to login
 */
export async function requireOwner() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'owner') {
    redirect('/login');
  }
}

export async function requireBarberAuth() {
  const user = await getCurrentUser();
  
  if (!user || user.role !== "barber") {
    redirect("/login");
  }
  
  return user;
}

export async function requireClientAuth() {
  const user = await getCurrentUser();
  
  if (!user || user.role !== "client") {
    redirect("/login");
  }
  
  return user;
} 