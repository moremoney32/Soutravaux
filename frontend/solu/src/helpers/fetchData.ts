

const API_BASE_URL: string = import.meta.env.VITE_SOLUTRAVO_API_URL;

/**
 * 
 * @param endpoint - ex: "users/register"
 * @param method - GET | POST | PUT | DELETE (default: GET)
 * @param data - body de la requête (JSON)
 * @param token - JWT je ne use pas ca tout le temps
 * @param headers - headers personnalisés
 * @returns Promise<{ result: any, status: number }>
 */
export async function fetchData<T = any>(
  endpoint: string,
  method: string = "GET",
  data: unknown = null,
  token: string = "",
  headers: Record<string, string> = {}
): Promise<{ result: T | null; status: number }> {
  try {
    // Config requête
    const config: RequestInit = {
      method: method.toUpperCase(),
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...headers,
      } as Record<string, string>,
      credentials: "include", // cookies JWT inclus
    };

    // Ajouter Authorization si token
    if (token) {
      (config.headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }

    if (data && method.toUpperCase() !== "GET") {
      config.body = JSON.stringify(data);
    }
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, config);
    const status = response.status;

    // Cas particuliers : pas de contenu
    if (status === 204 || status === 304) {
      return { result: null, status };
    }

    // Essayer de parser le JSON
    let json: any = null;
    try {
      json = await response.json();
    } catch {
      json = null;
    }

    // Succès (2xx)
    if (status >= 200 && status < 300) {
      return { result: json, status };
    }

    // Échec (4xx ou 5xx) → lever une vraie Error
    const message =
      json?.error || // mon middleware errorHandler
      json?.message ||
      (status >= 400 && status < 500
        ? "Une erreur côté client s'est produite"
        : "Une erreur côté serveur s'est produite");

    const error = new Error(message) as any;
    error.status = status;
    throw error;
  } catch (err: any) {
    // Réseau ou autres erreurs
    if (err instanceof Error) {
      const wrapped = new Error(err.message || "Une erreur réseau s'est produite") as any;
    //   wrapped.status = err.status || 0;
      throw wrapped;
    }
    throw new Error("Erreur inconnue");
  }
}
