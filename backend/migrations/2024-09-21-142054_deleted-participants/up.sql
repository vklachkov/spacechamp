ALTER TABLE participants
ADD deleted_by INTEGER DEFAULT NULL;

ALTER TABLE participants
ADD CONSTRAINT fk_deleted_by FOREIGN KEY (deleted_by) REFERENCES adults(id);