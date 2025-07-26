create table user{
    id int primary key auto_increment,
    name varchar(50) not null unique,
    password varchar(255) not null,
    email varchar(100) not null unique,
    role varchar(20)
    status varchar(20) default 'active',
    phone varchar(20) not null unique,
    UNIQUE (email)
    created_at datetime default current_timestamp,
    updated_at datetime default current_timestamp on update current_timestamp
};

insert into user( name, password, email, role, phone)
values ('user','user123','user@gmail.com','admin', '0717594343')

ALTER TABLE user 
  ADD COLUMN reset_token_hash VARCHAR(255) NULL,
  ADD COLUMN reset_token_expires DATETIME NULL,
  ADD COLUMN password_updated_at DATETIME NULL;
