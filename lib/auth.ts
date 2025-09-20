interface User {
  id: string
  email: string
}

interface Profile {
  id: string
  email: string
  full_name: string
  role: "admin" | "employee"
}

export async function 
signInWithPassword(email: string, password: string) {
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include", // if you're setting cookies too
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Login failed");
    }

    // User object
    const user = {
      id: data.user.id,
      email: data.user.email,
    };

    // Profile object (instead of role, keep full profile)
    const profile = {
      id: data.user.id,
      email: data.user.email,
      full_name: data.user.fullName,
      role: data.user.role,
      salary: data.user.salary,
      group: data.user.group,
      address: data.user.address,
      creationtimestamp: data.user.creationtimestamp,
    };

    // Save to localStorage
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("profile", JSON.stringify(profile));
    localStorage.setItem("token", data.token); // Store JWT

    return { user, profile, token: data.token, error: null };
  } catch (error: any) {
    return { user: null, profile: null, token: null, error };
  }
}


export function getCurrentUser() {
  if (typeof window === "undefined") return null

  const userStr = localStorage.getItem("user")
  const profileStr = localStorage.getItem("profile")

  if (userStr && profileStr) {
    return {
      user: JSON.parse(userStr) as User,
      profile: JSON.parse(profileStr) as Profile,
    }
  }

  return null
}

export function signOut() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("user")
    localStorage.removeItem("profile")
  }
}
