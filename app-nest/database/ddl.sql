create table permissions
(
    id          text not null
        constraint permissions_id_pk
            primary key,
    name        text not null
        constraint permissions_name_unique
            unique,
    description text
);

alter table permissions
    owner to postgres;

grant delete, insert, references, select, trigger, truncate, update on permissions to anon;

grant delete, insert, references, select, trigger, truncate, update on permissions to authenticated;

grant delete, insert, references, select, trigger, truncate, update on permissions to service_role;

create table roles
(
    id          text not null
        constraint roles_id_pk
            primary key,
    name        text not null
        constraint roles_name_unique
            unique,
    description text
);

alter table roles
    owner to postgres;

grant delete, insert, references, select, trigger, truncate, update on roles to anon;

grant delete, insert, references, select, trigger, truncate, update on roles to authenticated;

grant delete, insert, references, select, trigger, truncate, update on roles to service_role;

create table users
(
    id   text not null
        constraint users_id_pk
            primary key,
    name text not null
);

alter table users
    owner to postgres;

grant delete, insert, references, select, trigger, truncate, update on users to anon;

grant delete, insert, references, select, trigger, truncate, update on users to authenticated;

grant delete, insert, references, select, trigger, truncate, update on users to service_role;

create table role_user
(
    role_id text not null
        constraint role_user_roles_id_fk
            references roles,
    user_id text not null
        constraint role_user_users_id_fk
            references users,
    constraint role_user_pk
        primary key (role_id, user_id)
);

alter table role_user
    owner to postgres;

grant delete, insert, references, select, trigger, truncate, update on role_user to anon;

grant delete, insert, references, select, trigger, truncate, update on role_user to authenticated;

grant delete, insert, references, select, trigger, truncate, update on role_user to service_role;

create table permission_role
(
    permission_id text not null
        constraint permission_role_permissions_id_fk
            references permissions,
    role_id       text not null
        constraint permission_role_roles_id_fk
            references roles,
    constraint permission_role_pk
        primary key (permission_id, role_id)
);

alter table permission_role
    owner to postgres;

grant delete, insert, references, select, trigger, truncate, update on permission_role to anon;

grant delete, insert, references, select, trigger, truncate, update on permission_role to authenticated;

grant delete, insert, references, select, trigger, truncate, update on permission_role to service_role;

create table products
(
    id           text                     not null
        constraint products_id_pk
            primary key,
    name         text                     not null,
    slug         text                     not null
        constraint products_slug_unique
            unique,
    sales_price numeric(15, 2)           not null,
    sku          text
        constraint products_sku_unique
            unique,
    barcode      text
        constraint products_barcode_unique
            unique,
    created_at   timestamp with time zone not null,
    updated_at   timestamp with time zone,
    archived_at  timestamp with time zone
);

alter table products
    owner to postgres;

grant delete, insert, references, select, trigger, truncate, update on products to anon;

grant delete, insert, references, select, trigger, truncate, update on products to authenticated;

grant delete, insert, references, select, trigger, truncate, update on products to service_role;

