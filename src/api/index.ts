import { registerOverriddenValidators } from "@medusajs/medusa"
import { 
    AdminPostCustomersCustomerReq as MedusaAdminPostCustomersCustomerReq } 
    from "@medusajs/medusa/dist/api/routes/admin/customers/update-customer"

import { 
            AdminUpdateUserRequest as MedusaAdminUpdateUserRequest } 
            from "@medusajs/medusa/dist/api/routes/admin/users/update-user"
import { IsString } from "class-validator"
import { 
  AdminPostProductsProductReq as MedusaAdminPostProductsProductReq } 
  from "@medusajs/medusa/dist/api/routes/admin/products/update-product"

class AdminPostCustomersCustomerReq extends MedusaAdminPostCustomersCustomerReq {
 @IsString()
 customer_active: string
 totalWishlistItems: number
 totalCartItems: number

}
  class AdminUpdateUserRequest extends MedusaAdminUpdateUserRequest {
    order_access: boolean
    products_access: boolean
    customers_access: boolean
    discounts_access: boolean
    giftcards_access: boolean
    pricing_access: boolean
    analytics_access: boolean
    user_access: boolean
    settings_access: boolean

   
   }
   class AdminPostProductsProductReq extends MedusaAdminPostProductsProductReq {
    buy_get_num: number
    buy_get_offer: number
    sales_quantity: number
    ratings: number
    multiple_product: boolean 
    discountCode: string  
    video: string  
  
   }

registerOverriddenValidators(AdminPostProductsProductReq)

registerOverriddenValidators(AdminPostCustomersCustomerReq)
registerOverriddenValidators(AdminUpdateUserRequest)



