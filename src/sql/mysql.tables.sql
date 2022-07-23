CREATE SCHEMA `task_app` ;

CREATE TABLE `task_app`.`users` (
  `user_id` INT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(45) NOT NULL,
  `email` VARCHAR(45) NOT NULL,
  `password` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE INDEX `user_id_UNIQUE` (`user_id` ASC) VISIBLE,
  UNIQUE INDEX `email_UNIQUE` (`email` ASC) VISIBLE,
  UNIQUE INDEX `username_UNIQUE` (`username` ASC) VISIBLE);

  CREATE TABLE `task_app`.`tasks` (
  `task_id` INT NOT NULL AUTO_INCREMENT,
  `is_done` TINYINT NOT NULL DEFAULT 0,
  `description` LONGTEXT NOT NULL,
  `user_id` INT NOT NULL,
  PRIMARY KEY (`task_id`),
  UNIQUE INDEX `task_id_UNIQUE` (`task_id` ASC) VISIBLE,
  INDEX `user_id_idx` (`user_id` ASC) VISIBLE,
  CONSTRAINT `user_id`
    FOREIGN KEY (`user_id`)
    REFERENCES `task_app`.`users` (`user_id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION);