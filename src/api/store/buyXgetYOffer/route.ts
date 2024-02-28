import { MedusaRequest, MedusaResponse } from "@medusajs/medusa";
import Medusa from "@medusajs/medusa-js"
import { AllocationType, DiscountRuleType } from "@medusajs/medusa"
import { DiscountConditionOperator } from "@medusajs/medusa"
import axios from 'axios';
import { ProductService } from "@medusajs/medusa"


const medusa = new Medusa({ baseUrl: "http://195.35.20.220:9000", maxRetries: 3 })

export async function POST(
    req: MedusaRequest,
    res: MedusaResponse
): Promise<void> {
    const productService = req.scope.resolve<ProductService>("productService");

      
  // Retrieve a list of all products
  const products = await productService.list({})

    try {
        console.log('inside buy X get Y offer')

        // Extracting parameters from the request body
        const { productId, xValue, yValue } = req.body;

        const product = products.find(product => product.id === productId);

        // Forming the discount code
        const discountCode = `BUY${xValue}GET${yValue}`;

        const sessionResponse = await medusa.admin.auth.createSession({
            email: 'admin@hb.com',
            password: 'admin'
        });
        const user = sessionResponse.user;
        let api_token = user.api_token;

        // Initialize Medusa with the obtained API token
        const medusaAccessed = new Medusa({
            baseUrl: "http://localhost:9000",
            maxRetries: 3,
            apiKey: api_token
        });

        // Retrieve regions and create discount
        medusaAccessed.regions.list()
            .then(({ regions }) => {
                const regionIds = regions.map(region => region.id);

                medusaAccessed.admin.discounts.retrieveByCode(discountCode)
                    .then(({ discount }) => {
                        if (discount) {
                            console.log("Discount with code " + discountCode + " already exists.");

                            // Check if the condition already exists
                            const existingCondition = discount.rule.conditions.find(condition =>
                                condition.type === 'products' && condition.operator === DiscountConditionOperator.IN
                            );

                            if (!existingCondition) {
                                // Create condition if it doesn't exist
                                return medusaAccessed.admin.discounts.createCondition(discount.id, {
                                    operator: DiscountConditionOperator.IN,
                                    products: [productId]
                                })
                                    .then(({ discount }) => {
                                        console.log("New discount condition created: ", discount);
                                    });
                            } else {
                                // console.log('existingCondition', existingCondition)
                                console.log('condition', existingCondition.id, "discount id ", discount.id)
                                // Call the GET API
                                axios.get('http://localhost:9000/store/productDiscount', {
                                    params: {
                                        discount_id: discount.id,
                                        conditionId: existingCondition.id
                                    }
                                })
                                .then(response => {
                                    console.log("response", response.data);
                                
                                    // Extract product IDs
                                    let productIds = response.data.products.map(product => product.id);
                                
                                    // Check if productId of req.body exists in productIds
                                    if (!productIds.includes(productId)) {
                                        // If it doesn't exist, add it to productIds
                                        productIds.push(productId);
                                        
                                        // Update condition with the new productIds array
                                        medusaAccessed.admin.discounts.updateCondition(discount.id, existingCondition.id, {
                                            products: productIds
                                        })
                                        .then(async({ discount }) => {
                                            console.log("discount updated ",discount);
                                            const productUpdate = await productService.update(
                                                productId,
                                                { discountCode: discountCode }
                                              );
                                              console.log('productUpdate', productUpdate)
                                              res.status(200).json({ message: "New discount created", discount });

                                        })
                                        .catch(error => {
                                            console.error("Error updating condition:", error);
                                            res.status(500).json({ error: "Internal Server Error" });
                                        });

                                        
                                    }
                                })
                                .catch(error => {
                                    console.error("Error:", error);
                                    res.status(500).json({ error: "Internal Server Error" });
                                });
                                

                                console.log("Condition already exists. No action needed.");
                            }
                        } else {
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
                res.status(500).json({ error: "Internal Server Error" });
            });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
