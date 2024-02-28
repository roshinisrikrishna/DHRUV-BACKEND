// Define an asynchronous default function
export default async function () {
    // Dynamically import the 'customers/index' module from the Medusa package
    const imports = (await import(
      "@medusajs/medusa/dist/api/routes/store/customers/index"
    )) as any
  
    // Extend the allowedStoreCustomersFields array with additional fields
    // This array defines which fields are allowed to be sent to the store front
    imports.allowedStoreCustomersFields = [
      ...imports.allowedStoreCustomersFields, // Include existing fields
      "customer_active", // Add 'customer_active' to the allowed fields
      "totalWishlistItems", // Add 'totalWishlistItems' to the allowed fields
      "totalCartItems" // Add 'totalCartItems' to the allowed fields
    ]
  
    // Extend the defaultStoreCustomersFields array with additional fields
    // This array defines the default fields that are sent to the store front
    imports.defaultStoreCustomersFields = [
      ...imports.defaultStoreCustomersFields, // Include existing fields
      "customer_active", // Add 'customer_active' to the default fields
      "totalWishlistItems", // Add 'totalWishlistItems' to the default fields
      "totalCartItems" // Add 'totalCartItems' to the default fields
    ]
  }
  