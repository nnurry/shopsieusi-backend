CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.sessions;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.products_categories;
DROP TABLE IF EXISTS public.product_price_history;
DROP TABLE IF EXISTS public.product_images;
DROP TABLE IF EXISTS public.category_images;

-- we will be using bcrypt library so password length = 60
-- do not store raw password in database, only hashed one
CREATE TABLE public.users (
    user_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
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
    slug VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.products (
    product_id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(50),
    current_price DECIMAL(13, 3) NOT NULL, -- 3 digits for fraction-part, 10 digits for pre-decimal number (0 -> 9 bil. 999 mil)
    current_stock INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    is_deleted BOOLEAN DEFAULT false,
    CONSTRAINT not_negative_stock CHECK (current_stock >= 0),
    CONSTRAINT positive_price CHECK (current_price > 0)
);

CREATE TABLE public.products_categories (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES public.products(product_id),
    category_id INT REFERENCES public.categories(category_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() -- convenient when check if the product is tagged with such category
);

CREATE TABLE public.product_price_history (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES public.products(product_id),
    price DECIMAL(13, 3) NOT NULL,
    effective_date TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE public.sessions (
    session_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id INT REFERENCES public.users(user_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE public.product_images (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES public.products(product_id),
    image_key VARCHAR(255) NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    image_type VARCHAR(50), -- e.g., 'thumbnail' or 'detail',
    hosting_type VARCHAR(20) NOT NULL, -- e.g., 's3' or 'external'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.category_images (
    id SERIAL PRIMARY KEY,
    category_id INT REFERENCES public.categories(category_id),
    image_key VARCHAR(255) NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    hosting_type VARCHAR(20) NOT NULL, -- e.g., 's3' or 'external'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

