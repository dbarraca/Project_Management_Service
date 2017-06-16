drop database if exists dbarraca;
create database dbarraca;
use dbarraca;

create table User (
   id int auto_increment primary key,
   firstName varchar(30),
   lastName varchar(30) not null,
   email varchar(30) not null,
   phoneNum varchar(30) not null,
   password varchar(50),
   role int unsigned not null,  # 0 normal, 1 admin
   unique key(email)
);

create table Project (
   id int auto_increment primary key,
   ownerId int,
   title varchar(80) not null,
   level varchar(30),
   type varchar(80) not null,
   description varchar(5000) not null,
   constraint FKProject_ownerId foreign key (ownerId) references User(id)
    on delete cascade,
   unique key UK_title(title)
);

create table Skill (
   id int auto_increment primary key,
   name varchar(20) not null
);

create table ProjectSkills (
   prjId int not null,
   sklId int not null,
   constraint FKProjectSkill_prjId foreign key (prjId) references Project(id)
    on delete cascade,
   constraint FKProjectSkill_sklId foreign key (sklId) references Skill(id)
    on delete cascade
);

create table Participation (
   id int auto_increment primary key,
   usrId int not null,
   prjId int not null,
   constraint FKParticipation_usrId foreign key (usrId) references User(id)
    on delete cascade,
   constraint FKParticipation_prjId foreign key (prjId) references Project(id)
    on delete cascade
);

insert into User (firstName, lastName, email, phoneNum, password, role)
            VALUES ("Joe", "Admin", "adm@11.com", "1111111111","password", 1);
