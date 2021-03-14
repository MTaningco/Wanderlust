alter table landmarks alter column landmark_description drop not null;
alter table PathInfo add column path_name varchar(255);
alter table AppUsers add column access_hash varchar(255);
alter table AppUsers add column refresh_hash varchar(255);