alter table landmarks alter column landmark_description drop not null;
alter table PathInfo add column path_name varchar(255);