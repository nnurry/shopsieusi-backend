CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- DROP TABLE IF EXISTS public.product_variants;
-- DROP TABLE IF EXISTS public.variant_attributes;
-- DROP TABLE IF EXISTS public.variant_attribute_values;
-- DROP TABLE IF EXISTS public.product_variant_prices;
-- DROP TABLE IF EXISTS public.product_variant_stocks;


-- DROP TABLE IF EXISTS public.category_images;
-- DROP TABLE IF EXISTS public.categories CASCADE;

-- DROP TABLE IF EXISTS public.sessions;
-- DROP TABLE IF EXISTS public.users CASCADE;

-- DROP TABLE IF EXISTS public.product_price_history;
-- DROP TABLE IF EXISTS public.product_images;
-- DROP TABLE IF EXISTS public.products_categories;
-- DROP TABLE IF EXISTS public.products CASCADE;

-- we will be using bcrypt library so password length = 60
-- do not store raw password in database, only hashed one
CREATE TABLE public.users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(60) NOT NULL,
    verified BOOLEAN DEFAULT false,
    role VARCHAR(20) DEFAULT 'user',
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.categories (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    slug VARCHAR(50) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.products (
    product_id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(50) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    is_deleted BOOLEAN DEFAULT false
);

CREATE TABLE public.products_categories (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES public.products(product_id) ON DELETE CASCADE,
    category_id INT REFERENCES public.categories(category_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() -- convenient when checking if the product is tagged with such category
);

-- CREATE TABLE public.product_price_history (
--     id SERIAL PRIMARY KEY,
--     product_id INT REFERENCES public.products(product_id),
--     price DECIMAL(13, 3) NOT NULL,
--     effective_date TIMESTAMP WITH TIME ZONE NOT NULL
-- );

CREATE TABLE public.sessions (
    session_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id INT REFERENCES public.users(user_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE public.product_images (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES public.products(product_id) ON DELETE CASCADE,
    image_key VARCHAR(255) NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    image_type VARCHAR(50), -- e.g., 'thumbnail' or 'detail',
    hosting_type VARCHAR(20) NOT NULL, -- e.g., 's3' or 'external'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.category_images (
    id SERIAL PRIMARY KEY,
    category_id INT REFERENCES public.categories(category_id) ON DELETE CASCADE,
    image_key VARCHAR(255) NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    hosting_type VARCHAR(20) NOT NULL, -- e.g., 's3' or 'external'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.product_variants (
    variant_id SERIAL PRIMARY KEY,
    product_id INT REFERENCES public.products(product_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.variant_attributes (
    attribute_id SERIAL PRIMARY KEY,
    attribute_name VARCHAR(50) NOT NULL, -- e.g., 'size', 'color'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.variant_attribute_values (
    value_id SERIAL PRIMARY KEY,
    variant_id INT REFERENCES public.product_variants(variant_id) ON DELETE CASCADE,
    attribute_id INT REFERENCES public.variant_attributes(attribute_id) ON DELETE CASCADE,
    attribute_value VARCHAR(50) NOT NULL, -- e.g., '50 ml', 'red'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.product_variant_prices (
    price_id SERIAL PRIMARY KEY,
    variant_id INT REFERENCES public.product_variants(variant_id) ON DELETE CASCADE,
    price DECIMAL(13, 3) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT positive_price CHECK (price > 0)
);

CREATE TABLE public.product_variant_stocks (
    stock_id SERIAL PRIMARY KEY,
    variant_id INT REFERENCES public.product_variants(variant_id) ON DELETE CASCADE,
    stock INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT not_negative_stock CHECK (stock >= 0)
);
