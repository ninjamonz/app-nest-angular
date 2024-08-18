create table permissions
(
    id          text not null,
    name        text not null,
    description text,
    constraint permissions_id_pk
        primary key (id),
    constraint permissions_name_unique
        unique (name)
);

create table roles
(
    id          text not null,
    name        text not null,
    description text,
    constraint roles_id_pk
        primary key (id),
    constraint roles_name_unique
        unique (name)
);

create table users
(
    id   text not null,
    name text not null,
    constraint users_id_pk
        primary key (id)
);

create table role_user
(
    role_id text not null,
    user_id text not null,
    constraint role_user_pk
        primary key (role_id, user_id),
    constraint role_user_roles_id_fk
        foreign key (role_id) references roles,
    constraint role_user_users_id_fk
        foreign key (user_id) references users
);

create table permission_role
(
    permission_id text not null,
    role_id       text not null,
    constraint permission_role_pk
        primary key (permission_id, role_id),
    constraint permission_role_permissions_id_fk
        foreign key (permission_id) references permissions,
    constraint permission_role_roles_id_fk
        foreign key (role_id) references roles
);

create table products
(
    id          text                     not null,
    name        text                     not null,
    slug        text                     not null,
    sales_price numeric                  not null,
    sku         text,
    barcode     text,
    created_at  timestamp with time zone not null,
    updated_at  timestamp with time zone,
    archived_at timestamp with time zone,
    constraint products_id_pk
        primary key (id),
    constraint products_slug_unique
        unique (slug),
    constraint products_sku_unique
        unique (sku),
    constraint products_barcode_unique
        unique (barcode)
);

