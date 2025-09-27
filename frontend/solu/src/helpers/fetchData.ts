// const API_BASE_URL: string = import.meta.env.VITE_SOLUTRAVO_API_URL;

// /**
//  * Fonction générique pour appeler l'API backend
//  * @param endpoint - ex: "users/register"
//  * @param method - GET | POST | PUT | DELETE (default: GET)
//  * @param data - body de la requête (JSON)
//  * @param token - JWT facultatif
//  * @param headers - headers personnalisés
//  * @returns Promise<{ result: any, status: number }>
//  */
// export async function fetchData<T = any>(
//   endpoint: string,
//   method: string = "GET",
//   data: unknown = null,
//   token: string = "",
//   headers: Record<string, string> = {}
// ): Promise<{ result: T | null; status: number }> {
//   try {
//     // Configuration de la requête
//     const config: RequestInit = {
//       method: method.toUpperCase(),
//       headers: {
//         "Content-Type": "application/json",
//         Accept: "application/json",
//         ...headers,
//       } as Record<string, string>,
//       credentials: "include", // ✅ cookies JWT inclus
//     };

//     // Ajouter l’Authorization si token
//     if (token) {
//       (config.headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
//     }

//     // Ajouter le body si ce n'est pas un GET
//     if (data && method.toUpperCase() !== "GET") {
//       config.body = JSON.stringify(data);
//     }

//     // Exécuter la requête
//     const response = await fetch(`${API_BASE_URL}/${endpoint}`, config);
//     console.log(response)
//     const status = response.status;

//     // Cas particuliers : pas de contenu
//     if (status === 204 || status === 304) {
//       return { result: null, status };
//     }

//     // Essayer de parser le JSON
//     let json: any = null;
//     try {
//       json = await response.json();
//     } catch {
//       json = null;
//     }

//     // Succès (2xx)
//     if (status >= 200 && status < 300) {
//       return { result: json, status };
//     }

//     // Erreurs (4xx et 5xx)
//     const message =
//   json?.error || // backend Solutravo
//   json?.message || // autre backend possible
//   (status >= 400 && status < 500
//     ? "Une erreur côté client s'est produite"
//     : "Une erreur côté serveur s'est produite");

// throw { message, status };
//   } catch (error: any) {
//     throw {
//       message: error.message || "Une erreur réseau s'est produite",
//       status: error.status || 0,
//     };
//   }
// }



const API_BASE_URL: string = import.meta.env.VITE_SOLUTRAVO_API_URL;

/**
 * Fonction générique pour appeler l'API backend
 * @param endpoint - ex: "users/register"
 * @param method - GET | POST | PUT | DELETE (default: GET)
 * @param data - body de la requête (JSON)
 * @param token - JWT facultatif
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

    // Ajouter body si ce n'est pas GET
    if (data && method.toUpperCase() !== "GET") {
      config.body = JSON.stringify(data);
    }

    // Exécuter la requête
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
      json?.error || // ton middleware errorHandler
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
