import { ID, Query } from "react-native-appwrite";
import { appwriteConfig, databases, storage } from "./appwrite";
import dummyData from "./data";

interface Category {
    name: string;
    description: string;
}

interface Customization {
    name: string;
    price: number;
    type: "topping" | "side" | "size" | "crust" | string; // extend as needed
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
    customizations: string[]; // list of customization names
}

interface DummyData {
    categories: Category[];
    customizations: Customization[];
    menu: MenuItem[];
}

// ensure dummyData has correct shape
const data = dummyData as DummyData;

async function clearAll(collectionId: string): Promise<void> {
    const list = await databases.listDocuments(
        appwriteConfig.databaseId,
        collectionId
    );

    await Promise.all(
        list.documents.map((doc) =>
            databases.deleteDocument(appwriteConfig.databaseId, collectionId, doc.$id)
        )
    );
}

async function clearStorage(): Promise<void> {
    const list = await storage.listFiles(appwriteConfig.bucketId);

    await Promise.all(
        list.files.map((file) =>
            storage.deleteFile(appwriteConfig.bucketId, file.$id)
        )
    );
}

async function uploadImageToStorage(imageUrl: string) {
    const response = await fetch(imageUrl);
    const blob = await response.blob();

    const fileObj = {
        name: imageUrl.split("/").pop() || `file-${Date.now()}.jpg`,
        type: blob.type,
        size: blob.size,
        uri: imageUrl,
    };

    const file = await storage.createFile(
        appwriteConfig.bucketId,
        ID.unique(),
        fileObj
    );

    return storage.getFileViewURL(appwriteConfig.bucketId, file.$id);
}

async function seed(): Promise<void> {
    // 1. Clear all
    await clearAll(appwriteConfig.categoriesCollectionId);
    await clearAll(appwriteConfig.customizationsCollectionId);
    await clearAll(appwriteConfig.menuCollectionId);
    await clearAll(appwriteConfig.menuCustomizationsCollectionId);
    await clearStorage();

    // 2. Create Categories
    const categoryMap: Record<string, string> = {};
    for (const cat of data.categories) {
        const doc = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.categoriesCollectionId,
            ID.unique(),
            cat
        );
        categoryMap[cat.name] = doc.$id;
    }

    // 3. Create Customizations
    const customizationMap: Record<string, string> = {};
    for (const cus of data.customizations) {
        const doc = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.customizationsCollectionId,
            ID.unique(),
            {
                name: cus.name,
                price: cus.price,
                type: cus.type,
            }
        );
        customizationMap[cus.name] = doc.$id;
    }

    const menuMap: Record<string, string> = {};

    for (const item of data.menu) {
        try {
            const uploadedImage = await uploadImageToStorage(item.image_url);

            // Check if menu already exists
            const existing = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.menuCollectionId,
                [Query.equal("name", item.name)]
            );

            if (existing.documents.length > 0) {
                console.log(`⚠️ Menu item already exists: ${item.name}, ID: ${existing.documents[0].$id}`);
                menuMap[item.name] = existing.documents[0].$id;
                continue; // Skip creation if it exists
            }

            const payload = {
                name: item.name,
                description: item.description,
                image_url: uploadedImage,
                price: item.price,
                rating: item.rating,
                calories: item.calories,
                protein: item.protein,
                categories: categoryMap[item.category_name],
            };
            console.log("📦 Creating menu item payload:", payload);
            try {
                const result = await databases.listDocuments(
                    "DATABASE_ID",
                    "MENU_COLLECTION_ID"
                );
                console.log("Menu fetched:", result.documents);
            } catch (error) {
                console.error("Appwrite fetch error:", error);
            }
            let doc: any; // <-- declare doc here
            try {
                doc = await databases.createDocument(
                    appwriteConfig.databaseId,
                    appwriteConfig.menuCollectionId,
                    ID.unique(),
                    payload
                );
                console.log("✅ Menu item created:", doc.$id);
            } catch (err) {
                console.error("❌ Failed to create menu item:", item.name, err);
                continue; // Skip customizations if creation fails
            }

            menuMap[item.name] = doc.$id;

            // 5. Create menu_customizations
            for (const cusName of item.customizations) {
                try {
                    const cusDoc = await databases.createDocument(
                        appwriteConfig.databaseId,
                        appwriteConfig.menuCustomizationsCollectionId,
                        ID.unique(),
                        {
                            menu: doc.$id,
                            customizations: customizationMap[cusName],
                        }
                    );
                    console.log(`   🔹 Added customization: ${cusName}, ID: ${cusDoc.$id}`);
                } catch (cusErr) {
                    console.error(`   ❌ Failed to add customization ${cusName}:`, cusErr);
                }
            }

        } catch (err) {
            console.error(`❌ Failed to process menu item ${item.name}:`, err);
        }
    }


    console.log("✅ Seeding complete.");
}

export default seed;