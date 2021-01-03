create table AppUsers (
  user_uid serial primary key,
  email varchar(255) unique not null,
  password varchar(100) not null
);

create table PathInfo (
  path_uid serial primary key,
  user_uid int not null,
  is_airplane boolean not null,
  constraint fk_pathinfo_useruid
    foreign key(user_uid)
    references AppUsers(user_uid)
    on delete cascade
);

create table PathNodes (
  path_uid int not null,
  path_order int not null,
  latitude numeric not null,
  longitude numeric not null,
  primary key(path_uid, path_order),
  constraint fk_pathnodes_path_uid
    foreign key(path_uid)
    references PathInfo(path_uid)
    on delete cascade
);

create table Landmarks (
  landmark_uid serial primary key,
  user_uid int not null,
  landmark_name varchar(255) not null,
  landmark_description varchar(500) not null,
  longitude numeric not null,
  latitude numeric not null,
  constraint fk_landmarks_useruid
    foreign key(user_uid)
    references AppUsers(user_uid)
    on delete cascade
);