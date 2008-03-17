
ALTER TABLE fermentable ADD COLUMN priming;

UPDATE fermentable SET priming = 1.0 WHERE name='Kristalsuiker';
UPDATE fermentable SET priming = 1.0 WHERE name='Witte kandijsuiker';
UPDATE fermentable SET priming = 1.0 WHERE name='Witte basterdsuiker';
UPDATE fermentable SET priming = 1.0 WHERE name='Bruine kandijsuiker';
UPDATE fermentable SET priming = 1.0 WHERE name='Bruine basterdsuiker';
UPDATE fermentable SET priming = 0.95 WHERE name='Glucose';
UPDATE fermentable SET priming = 0.95 WHERE name='Honing';
INSERT INTO fermentable (category, name, priming) VALUES ('Suiker, stroop en honing', 'Moutextract', 0.58);
INSERT INTO fermentable (category, name, priming) VALUES ('Suiker, stroop en honing', 'Molasse', 0.28);

INSERT INTO fermentable (category, name, yield, moisture, ebc, priming) VALUES ('Suiker, stroop en honing', 'Dextrose', 100, 0, 0, 0.95);

UPDATE brewgear SET value='3' where key='db';

