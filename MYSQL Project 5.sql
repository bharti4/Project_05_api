create database MovieSchema;

CREATE TABLE MovieSchema.Users (userId int(11) NOT NULL AUTO_INCREMENT, surname varchar(50) NOT NULL,firstname varchar(50) NOT NULL , email varchar(255) NOT NULL UNIQUE, userpassword varchar(250) NOT NULL,PRIMARY KEY (userId));

CREATE table MovieSchema.userRating  (ratingId int(11) NOT NULL AUTO_INCREMENT, userId int(11)  NOT NULL,  movieId smallInt NOT NULL, rating smallInt NOT NULL ,PRIMARY KEY (ratingId) , 
CONSTRAINT fk_category
    FOREIGN KEY (userId) REFERENCES MovieSchema.users(userId)  ON UPDATE CASCADE ON DELETE CASCADE )
    

Select * from MovieSchema.users;   
Select * from MovieSchema.userRating;

Insert into MovieSchema.userRating (userId, movieId ,rating) values (1,17897,3);
Insert into MovieSchema.userRating (userId, movieId ,rating) values (2,17897,4);


/*delete queries */

SET SQL_SAFE_UPDATES = 0;
delete	 from MovieSchema.userRating;
delete from MovieSchema.users;