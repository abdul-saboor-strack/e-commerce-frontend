type ProductLike = {
  image?: string | null;
  imageUrl?: string | null;
  images?: Array<string | null | undefined> | null;
};

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1520975682031-a9ce0f55c35c?auto=format&fit=crop&w=1200&q=60";

function getBackendOrigin() {
  const envOrigin = (import.meta as any).env?.VITE_BACKEND_ORIGIN as string | undefined;
  if (envOrigin) return envOrigin.replace(/\/$/, "");

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return "http://localhost:5174";
    }
    return window.location.origin;
  }

  return "";
}

export function resolveImageSrc(src?: string | null) {
  const value = String(src || "").trim();
  if (!value) return FALLBACK_IMAGE;

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:") ||
    value.startsWith("blob:")
  ) {
    return value;
  }

  const backendOrigin = getBackendOrigin();
  const normalized = value.replace(/^\/+/, "");

  if (normalized.startsWith("uploads/")) {
    return backendOrigin ? `${backendOrigin}/${normalized}` : `/${normalized}`;
  }

  return backendOrigin ? `${backendOrigin}/uploads/${normalized}` : `/uploads/${normalized}`;
}

export function getProductImage(product?: ProductLike | null) {
  if (!product) return FALLBACK_IMAGE;

  const firstImage = Array.isArray(product.images) ? product.images.find(Boolean) : null;
  const candidate = firstImage || product.imageUrl || product.image;
  return resolveImageSrc(candidate || FALLBACK_IMAGE);
}

export { FALLBACK_IMAGE };

