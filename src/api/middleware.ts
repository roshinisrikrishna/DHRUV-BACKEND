import type { 
    MiddlewaresConfig,
   } from "@medusajs/medusa"
   import cors from "cors"
   export const config: MiddlewaresConfig = {
    routes: [
      {
        matcher: "/store/wishlist/*",
        middlewares: [
          cors({
            origin: "*",
            credentials: true,
          }),
        ],
      },
      {
        matcher: "/store/comments/*",
        middlewares: [
          cors({
            origin: "*",
            credentials: true,
          }),
        ],
      },
      {
        matcher: "/store/categoryImage/*",
        middlewares: [
          cors({
            origin: "*",
            credentials: true,
          }),
        ],
      },
      {
        matcher: "/store/colorImage/*",
        middlewares: [
          cors({
            origin: "*",
            credentials: true,
          }),
        ],
      }
    ],
   }
   