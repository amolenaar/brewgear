
ALTER TABLE fermentation ADD COLUMN primary_aeration text;

CREATE TABLE judgement (
        recipe_id INTEGER,
        date TEXT,
        name TEXT,
        color TEXT,
        clear TEXT,
        foam TEXT,
        aroma TEXT,
        taste TEXT,
        mouthfeel TEXT,
        after TEXT,
        remark TEXT);

UPDATE brewgear SET value='2' where key='db';

