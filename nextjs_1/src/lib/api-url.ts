let cachedApiUrl: string | null = null;

export async function getApiUrl(): Promise<string> {
  if (cachedApiUrl) {
    return cachedApiUrl;
  }

  const pastebinUrl = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL;
  
  if (!pastebinUrl) {
    throw new Error("No API URL configured");
  }

  if (!pastebinUrl.includes("pastebin.com")) {
    cachedApiUrl = pastebinUrl;
    return pastebinUrl;
  }

  try {
    const rawUrl = pastebinUrl.replace("pastebin.com/", "pastebin.com/raw/");
    const response = await fetch(rawUrl);
    const content = await response.text();
    
    const match = content.match(/https?:\/\/[^\s]+/);
    if (match) {
      let extractedUrl = match[0].trim();
      
      // Remover '/login' u otros endpoints si están al final
      extractedUrl = extractedUrl.replace(/\/(login|users|events|registrations)$/, '');
      
      cachedApiUrl = extractedUrl;
      console.log("URL base de API extraída desde Pastebin:", cachedApiUrl);
      return cachedApiUrl;
    }
    
    throw new Error("No se pudo extraer la URL de la API desde Pastebin");
  } catch (error) {
    console.error("Error obteniendo URL desde Pastebin:", error);
    throw error;
  }
}

