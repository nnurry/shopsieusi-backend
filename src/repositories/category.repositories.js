const db = require("../db/db.singleton");

class CategoryRepository {
    static async findCategoryById(categoryId) {
        try {
            const res = await db.sql`
                SELECT c.category_id, c.name, c.slug, ci.hosting_type, ci.image_url
                FROM categories c
                JOIN category_images ci
                ON c.category_id = ci.category_id
                WHERE c.category_id = ${categoryId};
            `;
            if (res.length !== 0) {
                const [categoryData] = res;
                return {
                    category: {
                        categoryId: categoryData.category_id,
                        name: categoryData.name,
                        slug: categoryData.slug,
                        hostingType: categoryData.hosting_type,
                        imageUrl: categoryData.image_url,
                    },
                    err: null,
                }
            }
            return {
                category: null,
                err: null,
            }
        } catch (err) {
            console.error("Error fetching category:", err);
            return {
                category: null,
                err: err,
            }
        }
    }
    static async findAll() {
        try {
            const res = await db.sql`
                SELECT c.category_id, c.name, c.slug, ci.hosting_type, ci.image_url
                FROM categories c
                JOIN category_images ci
                ON c.category_id = ci.category_id;
            `;
            const categories = res.map(category => {
                return {
                    categoryId: category.category_id,
                    name: category.name,
                    slug: category.slug,
                    hostingType: category.hosting_type,
                    imageUrl: category.image_url,
                };
            });
            return {
                categories: categories,
                err: null,
            }
        } catch (err) {
            console.error("Error fetching categories:", err);
            return {
                categories: null,
                err: err,
            }
        }
    }
    static async createCategory({ name, images }) {
        try {
            const createResult = await db.sql.begin(async sql => {
                const [category] = await sql`
                    INSERT INTO categories (
                        name
                    )
                    VALUES (
                        ${name}
                    )
                    RETURNING category_id
                `;
                const categoryId = category.category_id;
                console.log("created category, proceed to adding images");
                const imagePayload = images.map(image => {
                    return {
                        category_id: categoryId,
                        image_key: image.imageKey,
                        image_url: image.imageUrl,
                        hosting_type: image.hostingType,
                    }
                })
                const categoryImages = (await sql.savepoint(sql => sql`
                    INSERT INTO category_images ${sql(imagePayload, "category_id", "image_key", "image_url", "hosting_type")}
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

                return {
                    category: {
                        id: categoryId,
                    },
                    images: categoryImages,
                }
            })
                .then(({ category }) => {
                    return {
                        categoryId: category.id,
                        err: null,
                    }
                });

            return createResult;
        } catch (err) {
            console.error("Error creating category:", err);
            return {
                categoryId: null,
                err: err
            };
        }
    }
}

module.exports = CategoryRepository;