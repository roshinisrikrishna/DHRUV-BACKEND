// Import necessary types and classes from the Medusa packages and axios for HTTP requests.
import { MedusaRequest, MedusaResponse } from "@medusajs/medusa";
import Medusa from "@medusajs/medusa-js";
import { AllocationType, DiscountRuleType } from "@medusajs/medusa";
import { DiscountConditionOperator } from "@medusajs/medusa";
import axios from 'axios';
import { ProductService } from "@medusajs/medusa";

// Initialize a new Medusa client to communicate with the Medusa backend.
const medusa = new Medusa({ baseUrl: "http://195.35.20.220:9000", maxRetries: 3 });

// Define an asynchronous POST function that will handle incoming requests.
export async function POST(
    req: MedusaRequest,
    res: MedusaResponse
): Promise<void> {
    // Resolve the ProductService from the request's dependency injection container.
    const productService = req.scope.resolve<ProductService>("productService");
      
    // Retrieve a list of all products from the Medusa store.
    const products = await productService.list({});

    // Wrap the main logic in a try-catch block to handle any exceptions.
    try {
        console.log('inside buy X get Y offer');

        // Extract relevant parameters from the request's body.
        const { productId, xValue, yValue } = req.body;

        // Find the product in the retrieved list using the provided productId.
        const product = products.find(product => product.id === productId);

        // Construct a discount code string using the provided X and Y values.
        const discountCode = `BUY${xValue}GET${yValue}`;

        // Create an admin session to perform operations that require admin privileges.
        const sessionResponse = await medusa.admin.auth.createSession({
            email: 'admin@hb.com',
            password: 'admin'
        });
        // Extract the user and API token from the session response.
        const user = sessionResponse.user;
        let api_token = user.api_token;

        // Initialize a new Medusa client with admin privileges using the obtained API token.
        const medusaAccessed = new Medusa({
            baseUrl: "http://localhost:9000",
            maxRetries: 3,
            apiKey: api_token
        });

        // Retrieve a list of all regions to which the discount can be applied.
        medusaAccessed.regions.list()
            .then(({ regions }) => {
                // Extract the IDs of all regions.
                const regionIds = regions.map(region => region.id);

                // Attempt to retrieve a discount that matches the generated discount code.
                medusaAccessed.admin.discounts.retrieveByCode(discountCode)
                    .then(({ discount }) => {
                        // Check if a discount with the given code already exists.
                        if (discount) {
                            console.log("Discount with code " + discountCode + " already exists.");

                            // Search for an existing condition that applies to the specified product.
                            const existingCondition = discount.rule.conditions.find(condition =>
                                condition.type === 'products' && condition.operator === DiscountConditionOperator.IN
                            );

                            // If no such condition exists, create a new one.
                            if (!existingCondition) {
                                return medusaAccessed.admin.discounts.createCondition(discount.id, {
                                    operator: DiscountConditionOperator.IN,
                                    products: [productId]
                                })
                                    .then(({ discount }) => {
                                        console.log("New discount condition created: ", discount);
                                    });
                            } else {
                                console.log('condition', existingCondition.id, "discount id ", discount.id);
                                // Fetch additional information for an existing discount condition.
                                axios.get('http://localhost:9000/store/productDiscount', {
                                    params: {
                                        discount_id: discount.id,
                                        conditionId: existingCondition.id
                                    }
                                })
                                .then(response => {
                                    console.log("response", response.data);
                                
                                    // Extract the IDs of products associated with the condition.
                                    let productIds = response.data.products.map(product => product.id);
                                
                                    // If the current product is not in the list, add it and update the condition.
                                    if (!productIds.includes(productId)) {
                                        productIds.push(productId);
                                        
                                        medusaAccessed.admin.discounts.updateCondition(discount.id, existingCondition.id, {
                                            products: productIds
                                        })
                                        .then(async({ discount }) => {
                                            console.log("discount updated ",discount);
                                            // Update the product with the new discount code.
                                            const productUpdate = await productService.update(
                                                productId,
                                                { discountCode: discountCode }
                                              );
                                              console.log('productUpdate', productUpdate)
                                              // Respond with success and the discount details.
                                              res.status(200).json({ message: "New discount created", discount });
                                        })
                                        .catch(error => {
                                            console.error("Error updating condition:", error);
                                            // Handle errors during the condition update.
                                            res.status(500).json({ error: "Internal Server Error" });
                                        });
                                    }
                                })
                                .catch(error => {
                                    console.error("Error:", error);
                                    // Handle errors during the GET request.
                                    res.status(500).json({ error: "Internal Server Error" });
                                });

                                console.log("Condition already exists. No action needed.");
                            }
                        } else {
                            // If no matching discount exists, create a new one with the specified conditions.
                            return medusaAccessed.admin.discounts.create({
                                code: discountCode,
                                rule: {
                                    type: DiscountRuleType.PERCENTAGE,
                                    value: yValue,
                                    allocation: AllocationType.ITEM
                                },
                                regions: regionIds,
                                is_dynamic: false,
                                is_disabled: false
                            })
                                .then(({ discount }) => {
                                    console.log("discount ", discount);
                                    // After creating the discount, create a condition for it.
                                    return medusaAccessed.admin.discounts.createCondition(discount.id, {
                                        operator: DiscountConditionOperator.IN,
                                        products: [productId]
                                    })
                                        .then(async({ discount }) => {
                                            // Update the product with the new discount code.
                                            const productUpdate = await productService.update(
                                                productId,
                                                { discountCode: discountCode }
                                              );
                                              console.log('productUpdate', productUpdate)
                                              // Respond with success and the discount details.
                                              res.status(200).json({ message: "New discount created", discount });
                                        });
                                });
                        }
                    })
                    .catch((error) => {
                        // Create a new discount
                         return medusaAccessed.admin.discounts.create({
                            code: discountCode,
                            rule: {
                                type: DiscountRuleType.PERCENTAGE,
                                value: yValue,
                                allocation: AllocationType.ITEM
                            },
                            regions: regionIds,
                            is_dynamic: false,
                            is_disabled: false
                        })
                            .then(({ discount }) => {
                                console.log("discount ", discount);
                                return medusaAccessed.admin.discounts.createCondition(discount.id, {
                                    operator: DiscountConditionOperator.IN,
                                    products: [productId]
                                })
                                    .then(async({ discount }) => {
                                        const productUpdate = await productService.update(
                                            productId,
                                            { discountCode: discountCode }
                                          );
                                          console.log('productUpdate', productUpdate)
                                          res.status(200).json({ message: "New discount created", discount });
                                          console.log("New discount condition created: ", discount);
                                    });
                            });
                    
                        
                    });

            }).catch((error) => {
                console.error("Error fetching regions:", error);
                // Handle any errors that occur while fetching regions.
                res.status(500).json({ error: "Internal Server Error" });
            });
    } catch (error) {
        console.error("Error:", error);
        // Handle any other errors that occur in the try block.
        res.status(500).json({ error: "Internal Server Error" });
    }
}
