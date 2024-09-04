const db = require("../db/db.singleton");

class ProductRepository {
    static async findProductById(productId) {
        try {
            const res = await db.sql`
                SELECT
                    p.product_id,
                    p.name,
                    p.slug,
                    p.current_price,
                    p.current_stock,
                    p.updated_at,
                    array_agg(
                        json_build_object(
                            'image_id', pi.id,
                            'image_key', pi.image_key,
                            'image_url', pi.image_url,
                            'image_type', pi.image_type,
                            'hosting_type', pi.hosting_type
                        )
                    ) AS images,
                    array_agg(
                        json_build_object(
                            'category_id', c.category_id,
                            'category_name', c.name,
                            'category_slug', c.slug
                        )
                    ) AS categories

                FROM public.products p
                LEFT JOIN public.product_images pi ON p.product_id = pi.product_id
                LEFT JOIN public.product_price_history ph ON p.product_id = ph.product_id
                LEFT JOIN public.products_categories pc ON p.product_id = pc.product_id
                LEFT JOIN public.categories c ON pc.category_id = c.category_id

                WHERE p.product_id = ${productId} AND p.is_deleted = false
                GROUP BY
                    p.product_id, p.name, p.slug, 
                    p.current_price, p.current_stock, 
                    p.created_at, p.updated_at, p.is_deleted
                ;
            `;
            if (res.length !== 0) {
                const [productData] = res;
                return {
                    product: {
                        productId: productData.product_id,
                        name: productData.name,
                        slug: productData.slug,
                        currentPrice: productData.current_price,
                        currentStock: productData.current_stock,
                        updatedAt: productData.updated_at,
                        images: productData.images.map(image => {
                            return {
                                imageId: image.image_id,
                                imageKey: image.image_key,
                                imageUrl: image.image_url,
                                imageType: image.image_type,
                                hostingType: image.hosting_type,
                            }
                        }),
                        categories: productData.categories.map(category => {
                            return {
                                categoryId: category.category_id,
                                categoryName: category.category_name,
                            }
                        }),
                    },
                    err: null
                };
            }
            return {
                product: null,
                err: null
            };
        } catch (err) {
            console.error("Error fetching product:", err);
            return {
                product: null,
                err: err
            };
        }
    }

    static async findAll() {
        try {
            const res = await db.sql`
                SELECT
                    p.product_id,
                    p.name,
                    p.slug,
                    p.current_price,
                    p.current_stock,
                    p.updated_at,
                    array_agg(
                        json_build_object(
                            'image_id', pi.id,
                            'image_key', pi.image_key,
                            'image_url', pi.image_url,
                            'image_type', pi.image_type,
                            'hosting_type', pi.hosting_type
                        )
                    ) AS images,
                    array_agg(
                        json_build_object(
                            'category_id', c.category_id,
                            'category_name', c.name,
                            'category_slug', c.slug
                        )
                    ) AS categories

                FROM public.products p
                LEFT JOIN public.product_images pi ON p.product_id = pi.product_id
                LEFT JOIN public.product_price_history ph ON p.product_id = ph.product_id
                LEFT JOIN public.products_categories pc ON p.product_id = pc.product_id
                LEFT JOIN public.categories c ON pc.category_id = c.category_id

                WHERE p.is_deleted = false
                GROUP BY
                    p.product_id, p.name, p.slug, 
                    p.current_price, p.current_stock, 
                    p.created_at, p.updated_at, p.is_deleted
                ;
            `;
            const products = res.map(product => {
                return {
                    productId: product.product_id,
                    name: product.name,
                    slug: product.slug,
                    currentPrice: product.current_price,
                    currentStock: product.current_stock,
                    updatedAt: product.updated_at,
                    images: product.images.map(image => {
                        return {
                            imageId: image.image_id,
                            imageKey: image.image_key,
                            imageUrl: image.image_url,
                            imageType: image.image_type,
                            hostingType: image.hosting_type,
                        }
                    }),
                    categories: product.categories.map(category => {
                        return {
                            categoryId: category.category_id,
                            categoryName: category.category_name,
                        }
                    }),
                };
            });
            return {
                products: products,
                err: null
            };
        } catch (err) {
            console.error("Error fetching products:", err);
            return {
                products: null,
                err: err
            };
        }
    }

    static async findProductsByCategoryId(categoryId) {
        try {
            const res = await db.sql`
                SELECT
                    p.product_id,
                    p.name,
                    p.slug,
                    p.current_price,
                    p.current_stock,
                    p.updated_at,
                    array_agg(
                        json_build_object(
                            'image_id', pi.id,
                            'image_key', pi.image_key,
                            'image_url', pi.image_url,
                            'image_type', pi.image_type,
                            'hosting_type', pi.hosting_type
                        )
                    ) AS images,
                    array_agg(
                        json_build_object(
                            'category_id', c.category_id,
                            'category_name', c.name,
                            'category_slug', c.slug
                        )
                    ) AS categories

                FROM (
                    SELECT 
                        p.product_id, p.name, p.slug, 
                        p.current_price, p.current_stock, 
                        p.created_at, p.updated_at, p.is_deleted
                    FROM public.products p
                    JOIN public.products_categories pc
                    ON p.product_id = pc.product_id AND pc.category_id = ${categoryId} 
                ) p
                LEFT JOIN public.product_images pi ON p.product_id = pi.product_id
                LEFT JOIN public.product_price_history ph ON p.product_id = ph.product_id
                LEFT JOIN public.products_categories pc ON p.product_id = pc.product_id
                LEFT JOIN public.categories c ON pc.category_id = c.category_id

                WHERE p.is_deleted = false
                GROUP BY
                    p.product_id, p.name, p.slug, 
                    p.current_price, p.current_stock, 
                    p.created_at, p.updated_at, p.is_deleted
                ;
            `;
            const products = res.map(product => {
                return {
                    productId: product.product_id,
                    name: product.name,
                    slug: product.slug,
                    currentPrice: product.current_price,
                    currentStock: product.current_stock,
                    updatedAt: product.updated_at,
                    images: product.images.map(image => {
                        return {
                            imageId: image.image_id,
                            imageKey: image.image_key,
                            imageUrl: image.image_url,
                            imageType: image.image_type,
                            hostingType: image.hosting_type,
                        }
                    }),
                    categories: product.categories.map(category => {
                        return {
                            categoryId: category.category_id,
                            categoryName: category.category_name,
                        }
                    }),
                };
            });
            return {
                products: products,
                err: null
            };
        } catch (err) {
            console.error("Error fetching products by category ID:", err);
            return {
                products: null,
                err: err
            };
        }
    }

    static async findProductsByCategoryIds(categoryIds) {
        try {
            const res = await db.sql`
                SELECT
                    p.product_id,
                    p.name,
                    p.slug,
                    p.current_price,
                    p.current_stock,
                    p.updated_at,
                    array_agg(
                        json_build_object(
                            'image_id', pi.id,
                            'image_key', pi.image_key,
                            'image_url', pi.image_url,
                            'image_type', pi.image_type,
                            'hosting_type', pi.hosting_type
                        )
                    ) AS images,
                    array_agg(
                        json_build_object(
                            'category_id', c.category_id,
                            'category_name', c.name,
                            'category_slug', c.slug
                        )
                    ) AS categories

                FROM (
                    SELECT 
                        p.product_id, p.name, p.slug, 
                        p.current_price, p.current_stock, 
                        p.created_at, p.updated_at, p.is_deleted
                    FROM public.products p
                    JOIN public.products_categories pc
                    ON p.product_id = pc.product_id AND pc.category_id IN ${db.sql(categoryIds)}
                ) p
                LEFT JOIN public.product_images pi ON p.product_id = pi.product_id
                LEFT JOIN public.product_price_history ph ON p.product_id = ph.product_id
                LEFT JOIN public.products_categories pc ON p.product_id = pc.product_id
                LEFT JOIN public.categories c ON pc.category_id = c.category_id

                WHERE p.is_deleted = false
                GROUP BY
                    p.product_id, p.name, p.slug, 
                    p.current_price, p.current_stock, 
                    p.created_at, p.updated_at, p.is_deleted
                ;
            `;
            const products = res.map(product => {
                return {
                    productId: product.product_id,
                    name: product.name,
                    slug: product.slug,
                    currentPrice: product.current_price,
                    currentStock: product.current_stock,
                    updatedAt: product.updated_at,
                    images: product.images.map(image => {
                        return {
                            imageId: image.image_id,
                            imageKey: image.image_key,
                            imageUrl: image.image_url,
                            imageType: image.image_type,
                            hostingType: image.hosting_type,
                        }
                    }),
                    categories: product.categories.map(category => {
                        return {
                            categoryId: category.category_id,
                            categoryName: category.category_name,
                        }
                    }),
                };
            });
            return {
                products: products,
                err: null
            };
        } catch (err) {
            console.error("Error fetching products by category ID:", err);
            return {
                products: null,
                err: err
            };
        }
    }

    static async createProduct({ name, price, stock, images, categories }) {
        try {
            const createResult = await db.sql.begin(async sql => {
                const [product] = await sql`
                    INSERT INTO products (
                        name, current_price, current_stock
                    )
                    VALUES (
                        ${name}, ${price}, ${stock}
                    )
                    RETURNING product_id
                `;
                const productId = product.product_id;
                console.log("created product, proceed to adding images");
                const imagePayload = images.map(image => {
                    return {
                        product_id: productId,
                        image_key: image.imageKey,
                        image_url: image.imageUrl,
                        image_type: image.imageType,
                        hosting_type: image.hostingType,
                    }
                })
                const productImages = (await sql.savepoint(sql => sql`
                    INSERT INTO product_images ${sql(imagePayload, "product_id", "image_key", "image_url", "image_type", "hosting_type")}
                    RETURNING id
                `)
                    .then(res => {
                        return res.map(val => {
                            return {
                                id: val.id
                            }
                        });
                    })
                    .catch(err => {
                        console.error("Error saving images in transaction:", err);
                    })) || [];

                const categoryPayload = categories.map(category => {
                    return {
                        product_id: productId,
                        category_id: category.categoryId,
                    }
                })

                const productCategories = (await sql.savepoint(sql => sql`
                    INSERT INTO products_categories ${sql(categoryPayload, "category_id", "product_id")}
                    RETURNING id
                `)
                    .then(res => {
                        return res.map(val => {
                            return {
                                id: val.id,
                            }
                        });
                    })
                    .catch(err => {
                        console.error("Error create link between product and category:", err);
                    })) || [];

                return {
                    product: {
                        id: productId,
                    },
                    images: productImages,
                    categories: productCategories,
                }
            })
                .then(({ product }) => {
                    return {
                        productId: product.id,
                        err: null,
                    }
                });

            return createResult;
        } catch (err) {
            console.error("Error creating product:", err);
            return {
                productId: null,
                err: err
            };
        }
    }
    static async updateProduct(productId, updatedData) {
        try {
            const res = await db.sql`
                UPDATE products
                SET 
                    name = ${updatedData.name}, 
                    slug = ${updatedData.slug},
                    thumbnail_image = ${updatedData.thumbnailImage}, 
                    current_price = ${updatedData.currentPrice}, 
                    current_stock = ${updatedData.currentStock},
                    updated_at = now()
                WHERE product_id = ${productId}
                RETURNING product_id, name, slug, thumbnail_image, current_price, current_stock, created_at, updated_at;
            `;

            if (res.length !== 0) {
                const [updatedProduct] = res;
                return {
                    product: {
                        productId: updatedProduct.product_id,
                        name: updatedProduct.name,
                        slug: updatedProduct.slug,
                        thumbnailImage: updatedProduct.thumbnail_image,
                        currentPrice: updatedProduct.current_price,
                        currentStock: updatedProduct.current_stock,
                        createdAt: updatedProduct.created_at,
                        updatedAt: updatedProduct.updated_at,
                    },
                    err: null
                };
            }
            return {
                product: null,
                err: null,
            };
        } catch (err) {
            console.error("Error updating product:", err);
            return {
                product: null,
                err: err,
            };
        }
    }
    static async softDeleteProduct(productId) {
        try {
            const res = await db.sql`
                UPDATE products
                SET is_deleted = TRUE, updated_at = now()
                WHERE product_id = ${productId}
                RETURNING product_id;
            `;

            if (res.length !== 0) {
                const [deletedProduct] = res;
                return {
                    product: {
                        productId: deletedProduct.product_id,
                    },
                    err: null
                };
            }
            return {
                product: null,
                err: null,
            };
        } catch (err) {
            console.error("Error soft deleting product:", err);
            return {
                product: null,
                err: err,
            };
        }
    }

    static async updateProductPrice(productId, newPrice) {
        try {
            const res = await db.sql`
                    UPDATE products
                    SET current_price = ${newPrice}, updated_at = NOW()
                    WHERE product_id = ${productId}
                    RETURNING product_id, current_price
                `;
            if (res.length !== 0) {
                const [updatedProduct] = res;
                return {
                    product: {
                        productId: updatedProduct.product_id,
                        currentPrice: updatedProduct.current_price,
                    },
                    err: null
                };
            }
            return {
                product: null,
                err: null,
            };
        } catch (err) {
            console.error("Error changing product price:", err);
            return {
                product: null,
                err: err,
            };
        }
    }

    static async updateProductStock(productId, newStock) {
        try {
            const res = await db.sql`
                    UPDATE products
                    SET current_stock = ${newStock}, updated_at = NOW()
                    WHERE product_id = ${productId}
                    RETURNING product_id, current_stock
                `;
            if (res.length !== 0) {
                const [updatedProduct] = res;
                return {
                    product: {
                        productId: updatedProduct.product_id,
                        currentStock: updatedProduct.current_stock,
                    },
                    err: null
                };
            }
            return {
                product: null,
                err: null,
            };
        } catch (err) {
            console.error("Error changing product stock:", err);
            return {
                product: null,
                err: err,
            };
        }
    }

    static async updateProductImages(productId, uploadImages, deleteImages) {
        try {
            const createResult = await db.sql.begin(async sql => {
                const imagePayload = uploadImages.map(image => {
                    return {
                        product_id: productId,
                        image_key: image.imageKey,
                        image_url: image.imageUrl,
                        image_type: image.imageType,
                        hosting_type: image.hostingType,
                    }
                })
                const uploadProductImages = (await sql.savepoint(sql => sql`
                    INSERT INTO product_images ${sql(imagePayload, "product_id", "image_key", "image_url", "image_type", "hosting_type")}
                    RETURNING id
                `)
                    .then(res => {
                        return res.map(val => {
                            return {
                                id: val.id
                            }
                        });
                    })
                    .catch(err => {
                        console.error("Error saving images in transaction:", err);
                    })) || [];

                const deleteImageIds = deleteImages.map(image => image.imageId);
                const deleteProductImages = (await sql.savepoint(sql => sql`
                    DELETE FROM product_images
                    WHERE id IN ${sql(deleteImageIds)}
                    RETURNING id
                    `)
                    .then()
                    .catch(err => {
                        console.error("Error deleting image in transaction:", err);
                    })
                ) || [];

                return {
                    product: {
                        id: productId,
                    },
                    uploadImages: uploadProductImages,
                    deleteImages: deleteProductImages,
                }
            })
                .then(({ product, uploadImages, deleteImages }) => {
                    return {
                        productId: product.id,
                        uploadImages: uploadImages,
                        deleteImages: deleteImages,
                        err: null,
                    }
                });

            return createResult;
        } catch (err) {
            console.error("Error creating product:", err);
            return {
                productId: null,
                uploadImages: null,
                deleteImages: null,
                err: err
            };
        }
    }
}

module.exports = ProductRepository;