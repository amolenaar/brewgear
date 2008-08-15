CREATE TABLE brewgear (
    key TEXT,
	value);

INSERT INTO brewgear VALUES ( 'db', 1 );

CREATE TABLE style (
	style_id INTEGER PRIMARY KEY AUTOINCREMENT,
	class CHAR,
	name TEXT,
	description TEXT,
	gravity_min INTEGER,
	gravity_max INTEGER,
	alcohol_min REAL,
	alcohol_max REAL,
	attenuation_min INTEGER,
	attenuation_max INTEGER,
	ebc_min INTEGER,
	ebc_max INTEGER,
	ibu_min INTEGER,
	ibu_max INTEGER,
	co2g_min REAL,
	co2g_max REAL,
	co2v_min REAL,
	co2v_max REAL,
	ph_min REAL,
	ph_max REAL);
	

CREATE TABLE recipe (
	recipe_id INTEGER primary key autoincrement,
	name TEXT,
	batch TEXT,
	style_id INTEGER,
	brew_date TEXT,
	target_gravity INTEGER,
	target_volume REAL,
	efficiency REAL,
	notes TEXT);

CREATE TABLE fermentable (
	fermentable_id INTEGER primary key autoincrement,
	category TEXT,
	name TEXT,
	yield REAL,
	moisture REAL,
	ebc INTEGER,
	priming REAL);

CREATE TABLE recipe_fermentable (
	recipe_id INTEGER,
	fermentable_id INTEGER,
	amount REAL,
	added TEXT);

CREATE TABLE hop (
	recipe_id INTEGER,
	name TEXT,
	alpha REAL,
	addition INTEGER,
	amount REAL,
	boiltime TEXT);
 -- addition: first_wort? dry-hopping? mash hopping?

CREATE TABLE mash (
	recipe_id INTEGER,
	step INTEGER,
	name TEXT,
	temperature REAL,
	water REAL,
	duration REAL,
	ph REAL);

CREATE TABLE filter (
	recipe_id INTEGER,
	water_added REAL,
	og_before_boil REAL,
	loss REAL);

CREATE TABLE boil (
	recipe_id INTEGER,
	boiltime REAL,
	evaporation REAL,
	volume_begin_boil REAL,
	volume_after_boil REAL,
	loss REAL);

CREATE TABLE fermentation (
	recipe_id INTEGER,
	volume REAL,
        yeast TEXT,
        volume_starter REAL,
        starter_t REAL,
	og REAL,
	primary_date TEXT,
	primary_fg INTEGER,
	primary_t REAL,
	primary_aeration TEXT,
	secundary_date TEXT,
	secundary_fg INTEGER,
	secundary_t REAL);

-- bottling and the amount of a certain fermentable used.
CREATE TABLE bottling (
	recipe_id INTEGER,
	bottle_date TEXT,
	volume,
	fermentable_id,
	amount);


