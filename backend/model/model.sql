create database chat_app;

create extension pgcrypto;

create table users (
	user_id serial not null primary key,
	user_socket_id character varying(60),
	username character varying(50) not null,
	password character varying(256) not null,
	file character varying(256)
);

create table messages (
	message_id serial not null primary key,
	message_body text not null,
	message_type character varying(50) not null,
	message_from int not null references users(user_id),
	message_to int not null references users(user_id),
	message_read boolean default false,
	message_created_at timestamp default current_timestamp
);

insert into users (username, password, file) values
('ali', crypt('1111', gen_salt('bf')), 'ali.jpg'),
('alisher', crypt('1111', gen_salt('bf')), 'alisher.jpg'),
('teshavoy', crypt('1111', gen_salt('bf')), 'teshavoy.png');


insert into messages (message_from, message_to, message_type, message_read, message_body) values
(1, 2, 'text', false, 'salom qalesan?'),
(1, 2, 'text', false, 'nega jimsan?'),

(3, 2, 'text', true, 'Assalomu alaykum'),
(3, 2, 'text', true, 'ertaga qayerga borasan?'),
(2, 3, 'text', true, 'universietga boraman');

