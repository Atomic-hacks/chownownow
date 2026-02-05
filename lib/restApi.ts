import { appwriteConfig } from "./appwrite";

const rawEndpoint = appwriteConfig.endpoint;
const normalizedEndpoint = rawEndpoint?.replace(/\/v1\/?$/, "");
const BASE = normalizedEndpoint ? `${normalizedEndpoint}/v1` : "";

const headers = {
  "Content-Type": "application/json",
  "X-Appwrite-Project": appwriteConfig.projectId,
};


const parseErrorBody = async (res: Response) => {
  const text = await res.text();
  try {
    const json = JSON.parse(text);
    return { text, json };
  } catch {
    return { text };
  }
};

const ensureBase = () => {
  if (!BASE) {
    throw new Error(
      "REST API base URL is missing. Check EXPO_PUBLIC_APPWRITE_ENDPOINT.",
    );
  }
};

type AppwriteDoc = {
  $id: string;
  name?: string;
  price?: number;
  image_url?: string;
  description?: string;
  category_name?: string;
  categories?: string | string[] | { $id?: string; name?: string } | { $id?: string; name?: string }[];
  type?: string;
  rating?: number;
  inStock?: boolean;
};

const extractCategory = (doc: AppwriteDoc) => {
  if (doc.category_name) return doc.category_name;
  if (typeof doc.categories === "string") return doc.categories;
  if (Array.isArray(doc.categories)) {
    const first = doc.categories[0];
    if (typeof first === "string") return first;
    if (first && typeof first === "object" && "$id" in first)
      return (first as { $id?: string }).$id || undefined;
    if (first && typeof first === "object" && "name" in first)
      return (first as { name?: string }).name || undefined;
  }
  if (doc.categories && typeof doc.categories === "object") {
    const maybe = doc.categories as { $id?: string; name?: string };
    return maybe.$id || maybe.name;
  }
  if (doc.type) return doc.type;
  return "General";
};

const mapDocToProduct = (doc: AppwriteDoc) => ({
  id: doc.$id,
  name: doc.name ?? "Unnamed Product",
  price: typeof doc.price === "number" ? doc.price : 0,
  image: doc.image_url ?? "",
  description: doc.description ?? "",
  category: extractCategory(doc),
  rating: doc.rating,
  inStock: doc.inStock,
});

export const getProducts = async ({
  category,
  query,
}: { category?: string; query?: string } = {}) => {
  try {
    ensureBase();
    const url = `${BASE}/databases/${appwriteConfig.databaseId}/collections/${appwriteConfig.menuCollectionId}/documents`;
    const res = await fetch(url, { method: "GET", headers });

    if (!res.ok) {
      const body = await parseErrorBody(res);
      throw new Error(
        `Server error: ${res.status} ${res.statusText} - ${body.text || ""}`,
      );
    }

    const json = await res.json();
    const docs: AppwriteDoc[] = json.documents || [];
    let items = docs;

    if (category) {
      items = items.filter((d: any) => {
        // attempt to support different shapes: `category_name` or `categories`
        return (
          d.category_name === category ||
          d.categories === category ||
          (Array.isArray(d.categories) && d.categories.includes(category)) ||
          (d.categories && typeof d.categories === "object" && d.categories.$id === category)
        );
      });
    }

    if (query) {
      const q = String(query).toLowerCase();
      items = items.filter((d: any) =>
        String(d.name || "")
          .toLowerCase()
          .includes(q),
      );
    }

    return items.map(mapDocToProduct);
  } catch (e) {
    throw e;
  }
};

export const getProductById = async (id: string) => {
  try {
    ensureBase();
    const url = `${BASE}/databases/${appwriteConfig.databaseId}/collections/${appwriteConfig.menuCollectionId}/documents/${id}`;
    const res = await fetch(url, { method: "GET", headers });

    if (!res.ok) {
      const body = await parseErrorBody(res);
      throw new Error(
        `Server error: ${res.status} ${res.statusText} - ${body.text || ""}`,
      );
    }

    const json: AppwriteDoc = await res.json();
    return mapDocToProduct(json);
  } catch (e) {
    throw e;
  }
};

export const getCategoriesRest = async () => {
  try {
    ensureBase();
    const url = `${BASE}/databases/${appwriteConfig.databaseId}/collections/${appwriteConfig.categoriesCollectionId}/documents`;
    const res = await fetch(url, { method: "GET", headers });

    if (!res.ok) {
      const body = await parseErrorBody(res);
      throw new Error(
        `Server error: ${res.status} ${res.statusText} - ${body.text || ""}`,
      );
    }

    const json = await res.json();
    return json.documents || [];
  } catch (e) {
    throw e;
  }
};

export default { getProducts, getProductById, getCategoriesRest };
