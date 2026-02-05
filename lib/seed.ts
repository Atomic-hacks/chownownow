import { ID } from "react-native-appwrite";
import { appwriteConfig, databases, storage } from "./appwrite";
import dummyData from "./data";

interface Category {
  name: string;
  description: string;
}

interface Customization {
  name: string;
  price: number;
  type: "topping" | "side" | "size" | "crust" | string;
}

interface MenuItem {
  name: string;
  description: string;
  image_url: string;
  price: number;
  rating: number;
  calories: number;
  protein: number;
  category_name: string;
  customizations: string[];
}

interface DummyData {
  categories: Category[];
  customizations: Customization[];
  menu: MenuItem[];
}

const data = dummyData as DummyData;

async function clearAll(collectionId: string): Promise<void> {
  console.log(`🧹 Clearing documents in collection: ${collectionId}`);
  const list = await databases.listDocuments(
    appwriteConfig.databaseId,
    collectionId,
  );
  console.log(`Found ${list.documents.length} documents to delete.`);

  await Promise.all(
    list.documents.map((doc) => {
      console.log(`Deleting document: ${doc.$id}`);
      return databases.deleteDocument(
        appwriteConfig.databaseId,
        collectionId,
        doc.$id,
      );
    }),
  );
}

async function clearStorage(): Promise<void> {
  console.log("🧹 Clearing storage files...");
  const list = await storage.listFiles(appwriteConfig.bucketId);
  console.log(`Found ${list.files.length} files to delete.`);

  await Promise.all(
    list.files.map((file) => {
      console.log(`Deleting file: ${file.$id} (${file.name})`);
      return storage.deleteFile(appwriteConfig.bucketId, file.$id);
    }),
  );
}

async function uploadImageToStorage(imageUrl: string, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(
        `📤 [Attempt ${attempt}/${retries}] Uploading image from URL: ${imageUrl}`,
      );

      const response = await fetch(imageUrl);

      if (!response.ok) {
        console.error(`❌ Failed to fetch image (status: ${response.status})`);
        throw new Error(`Fetch failed: ${response.statusText}`);
      }

      const blob = await response.blob();

      if (!blob.size) {
        console.error(`⚠️ Blob size is 0 — possible invalid image data.`);
        throw new Error("Blob size is zero");
      }

      const fileObj = {
        name: imageUrl.split("/").pop() || `file-${Date.now()}.jpg`,
        type: blob.type || "image/jpeg",
        size: blob.size,
        uri: imageUrl,
      };

      console.log(`🗂️ Creating file in Appwrite storage: ${fileObj.name}`);
      const file = await storage.createFile(
        appwriteConfig.bucketId,
        ID.unique(),
        fileObj,
      );
      console.log(`✅ Successfully uploaded ${fileObj.name} (ID: ${file.$id})`);

      const fileUrl = storage.getFileViewURL(appwriteConfig.bucketId, file.$id);
      console.log(`🔗 File URL: ${fileUrl}`);
      return fileUrl;
    } catch (error) {
      console.error(
        `❌ Upload attempt ${attempt} failed for ${imageUrl}:`,
        error,
      );

      // If not last attempt, wait a bit before retrying
      if (attempt < retries) {
        const waitTime = 1000 * attempt; // exponential backoff
        console.log(`⏳ Retrying in ${waitTime / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      } else {
        console.error(
          `💀 All ${retries} upload attempts failed for ${imageUrl}`,
        );
        return null;
      }
    }
  }
}

async function seed(): Promise<void> {
  console.log("🚀 Starting seed process...");

  // 1. Clear existing data
  await clearAll(appwriteConfig.categoriesCollectionId);
  await clearAll(appwriteConfig.customizationsCollectionId);
  await clearAll(appwriteConfig.menuCollectionId);
  await clearAll(appwriteConfig.menuCustomizationsCollectionId);
  await clearStorage();

  // 2. Create Categories
  const categoryMap: Record<string, string> = {};
  console.log("📂 Creating categories...");
  for (const cat of data.categories) {
    console.log(`→ Creating category: ${cat.name}`);
    const doc = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.categoriesCollectionId,
      ID.unique(),
      cat,
    );
    categoryMap[cat.name] = doc.$id;
    console.log(`✅ Category '${cat.name}' created with ID: ${doc.$id}`);
  }

  // 3. Create Customizations
  const customizationMap: Record<string, string> = {};
  console.log("⚙️ Creating customizations...");
  for (const cus of data.customizations) {
    console.log(`→ Creating customization: ${cus.name}`);
    const doc = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.customizationsCollectionId,
      ID.unique(),
      {
        name: cus.name,
        price: cus.price,
        type: cus.type,
      },
    );
    customizationMap[cus.name] = doc.$id;
    console.log(`✅ Customization '${cus.name}' created with ID: ${doc.$id}`);
  }

  // 4. Create Menu Items
  const menuMap: Record<string, string> = {};
  console.log("🍽️ Creating menu items...");
  for (const item of data.menu) {
    console.log(`→ Processing menu item: ${item.name}`);
    const uploadedImage = await uploadImageToStorage(item.image_url);

    if (!uploadedImage) {
      console.error(
        `❌ Failed to upload image for ${item.name}. Skipping this item.`,
      );
      continue;
    }

    const categoryId = categoryMap[item.category_name];
    if (!categoryId) {
      console.error(
        `⚠️ No category found for '${item.category_name}'. Skipping item '${item.name}'.`,
      );
      continue;
    }

    const doc = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.menuCollectionId,
      ID.unique(),
      {
        name: item.name,
        description: item.description,
        image_url: uploadedImage,
        price: item.price,
        rating: item.rating,
        calories: item.calories,
        protein: item.protein,
        categories: categoryId,
      },
    );

    console.log(`✅ Menu item '${item.name}' created with ID: ${doc.$id}`);
    menuMap[item.name] = doc.$id;

    // 5. Create menu_customizations
    for (const cusName of item.customizations) {
      const cusId = customizationMap[cusName];
      if (!cusId) {
        console.error(
          `⚠️ Customization '${cusName}' not found for menu '${item.name}'`,
        );
        continue;
      }

      await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.menuCustomizationsCollectionId,
        ID.unique(),
        {
          menu: doc.$id,
          customization: cusId,
        },
      );
      console.log(
        `🔗 Linked customization '${cusName}' to menu '${item.name}'`,
      );
    }
  }

  console.log("✅ Seeding complete.");
}

export default seed;
