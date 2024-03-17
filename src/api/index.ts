// Importing a function from Medusa to register custom validators.
import { registerOverriddenValidators } from "@medusajs/medusa"

// Importing base request types from Medusa for updating customers, users, and products.
import { AdminPostCustomersCustomerReq as MedusaAdminPostCustomersCustomerReq } 
    from "@medusajs/medusa/dist/api/routes/admin/customers/update-customer"
import { AdminUpdateUserRequest as MedusaAdminUpdateUserRequest } 
    from "@medusajs/medusa/dist/api/routes/admin/users/update-user"
import { AdminPostProductsProductReq as MedusaAdminPostProductsProductReq } 
    from "@medusajs/medusa/dist/api/routes/admin/products/update-product"

// Importing class-validator to use validation decorators.
import { IsString } from "class-validator"

// Extending the base Medusa request type for updating customers with additional fields.
class AdminPostCustomersCustomerReq extends MedusaAdminPostCustomersCustomerReq {
 @IsString() // Ensuring the customer_active field is a string.
 customer_active: string
 totalWishlistItems: number // Additional field to track wishlist items.
 totalCartItems: number // Additional field to track cart items.
}

// Extending the base Medusa request type for updating users with additional permission fields.
class AdminUpdateUserRequest extends MedusaAdminUpdateUserRequest {
    order_access: boolean // Access control for orders.
    products_access: boolean // Access control for products.
    customers_access: boolean // Access control for customers.
    discounts_access: boolean // Access control for discounts.
    giftcards_access: boolean // Access control for gift cards.
    pricing_access: boolean // Access control for pricing.
    analytics_access: boolean // Access control for analytics.
    user_access: boolean // Access control for user management.
    settings_access: boolean // Access control for settings.
}

// Extending the base Medusa request type for updating products with additional fields for sales and promotions.
class AdminPostProductsProductReq extends MedusaAdminPostProductsProductReq {
    buy_get_num: number // Additional field for "buy X" part of a promotion.
    buy_get_offer: number // Additional field for "get Y" part of a promotion.
    sales_quantity: number // Additional field for tracking sales quantity.
    ratings: number // Additional field for product ratings.
    multiple_product: boolean // Indicator if the product can be sold as part of a bundle.
    discountCode: string // Field for associating a discount code with the product.
    video: string // Field for a video URL associated with the product.
}

// Registering the overridden validators so Medusa recognizes the additional fields in the request types.
registerOverriddenValidators(AdminPostProductsProductReq)
registerOverriddenValidators(AdminPostCustomersCustomerReq)
registerOverriddenValidators(AdminUpdateUserRequest)
