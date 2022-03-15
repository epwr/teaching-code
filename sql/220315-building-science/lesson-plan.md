# Basics of SQL

Teaching SQL (for BigQuery).
   
## Lesson Plan

- *Part 1 - The Basics:* Setting up a table, insert and update statements.
- *Part 2 - Select Statements:* Getting the values you want out of a table.
- *Part 3 - Joins:* The Hard part (hoping to complete this in this session)
- *Part 4 - Case Statements:* For when you want to get fancy.
- *Part 5 - The Danger Zone:* Delete records and dropping tables.

## PART 1 - 20 mins

The basics.

### Tables & Records

In database parlance, records are the rows of a table. Tables are tables.

More technically, a record is a collection of values (just like a row!) where each value has name (think of column headers)

### Declarative Language

   - Imperative (do this, then do that)
   - Declarative (I want this, I want that)

### Whitespace

Does not matter (a space == 100000 spaces === 40 newlines, tabs, etc )

### Case Convention

SQL is case insensitive. SELECT and select are identical.

The convention I use (which you can decide if you want to follow, James doesn't) is that tables/columns/etc (things I define) are lowercase, and key words and built in functions are uppercase.

### All the quotation marks

\`\` -> around table names with a dash in them
"" or '' -> around a string

### Datatypes

NUMERIC -
DATETIME -
STRING -
DATE -

NULL - the annoying one. It's not 0, "", or anything else. It's the lack of a value. And it's special.

### CONSTRAINTS, & CREATE TABLE

BigQuery only has the NOT NULL constraint.

```sql
CREATE TABLE `audette-development.learning_sql.employees` (
       uid string,
       firstname string,
       lastname string,
       annual_salary numeric,
       type string,
       employment_start_date date NOT NULL,
       employment_end_date date
);
```

### ALTER TABLE

BigQuery let's you remove or add columns (but not replace them, or change the datatype).

```sql
ALTER TABLE `audette-development.learning_sql.employees`
ADD COLUMN age integer,
RENAME COLUMN salary TO annual_salary;
```



### CONSTRAINTS v2, FUNCTIONS, & INSERTING VALUES

Let's add some data to the table. This will get an error, why?

```sql
INSERT INTO `audette-development.learning_sql.employees` ( firstname, lastname, salary, age ) VALUES
       ( 'Bart', 'Simpson', 10000, 10 ),
       ( 'Claude', 'Shannon', 100000, 85 ),
       ( 'Simon', 'Bolivar', 0, 57 ),
       ( NULL, 'Boudica', 15, NULL );
```

This one works:

```sql
INSERT INTO `audette-development.learning_sql.employees` ( firstname, lastname, annual_salary, age, type, employment_start_date ) VALUES
       ( 'Bart',         'Simpson',          10000,   10,   'Famous',     CURRENT_DATE() ),
       ( 'Lisa',         'Simpson',          20000,   8,    'Famous',     CURRENT_DATE() ),
       ( 'Claude',       'Shannon',          100000,  85,   'Deserving',     CURRENT_DATE() ),
       ( 'Simon',        'Bolivar',          0,       57,   'Deserving',  DATE '1783-07-24' ),
       ( NULL,           'Boudica',          15,      NULL, 'Nobility',   CURRENT_DATE() ),
       ( 'Elvis',        'Presley',          500000,  42,   'Famous',  DATE '1977-08-16' ),
       ( 'Marie Louise', 'Duchess of Parma', 1000000, 56,   'Nobility',   DATE '1810-04-01' ),
       ( 'Klemens',      'von Metternich',   200000,  86,   'Nobility',   CURRENT_DATE() );
       
```


### BASIC SELECT STATEMENT

```sql
SELECT * FROM `audette-development.learning_sql.employees`
```

### UPDATE

Functions get called for every record (this is an error though):
```sql
UPDATE `audette-development.learning_sql.employees` SET uid = GENERATE_UUID();
```

Let's fix that by telling it what records to update:
```sql
UPDATE `audette-development.learning_sql.employees` SET uid = GENERATE_UUID() WHERE uid IS NULL;
```




## PART 2 - 20 mins

More complex select statements

### Selecting a subset of columns

You can take a subset of columns in a select statement:
```sql
SELECT
    firstname,
    lastname,
    annual_salary
FROM `audette-development.learning_sql.employees`
```

You can rename output columns:
```sql
SELECT
    firstname as a_collection_of_letters,
    lastname as ancestry_name,
    salary as numbers_dont_matter
FROM `audette-development.learning_sql.employees`
```

### WHERE

Filters records using a predicate:
```sql
SELECT * FROM `audette-development.learning_sql.employees`
WHERE annual_salary >= 10000`
```

Boolean combinations:
```sql
SELECT * FROM `audette-development.learning_sql.employees`
WHERE
    annual_salary >= 20000
    AND
    type = "Nobility"
```

Nested booleans:
```sql
SELECT * FROM `audette-development.learning_sql.employees`
WHERE
    annual_salary >= 20000
    AND
    (type = "Nobility" OR type = "Famous")
```


### Some Operations

There are lots of operations you can use:
```sql
SELECT
    firstname || " " || lastname as name,
    annual_salary + age * 10
FROM `audette-development.learning_sql.employees`
```

### GROUP BY

Grouping allows for aggregate functions:
```sql
SELECT type, count(type) FROM `audette-development.learning_sql.employees`
GROUP BY type;
```

Here are some common aggregate functions:
```sql
SELECT type, avg(annual_salary), max(annual_salary), min(annual_salary), sum(annual_salary) FROM `audette-development.learning_sql.employees`
GROUP BY type;
```

You can group by more than one value:
```sql
SELECT type,  employment_start_date, employment_end_date, avg(annual_salary), max(annual_salary), min(annual_salary) FROM `audette-development.learning_sql.employees`
GROUP BY type, employment_start_date, employment_end_date;
```

This seems like as good a place to remind everyone that you can name the output columns:
```sql
SELECT 
    type, 
    avg(annual_salary) as avg_salary, 
    max(annual_salary) as max_salary, 
    min(annual_salary) as min_salary
FROM `audette-development.learning_sql.employees`
GROUP BY type;
```

### ORDER BY

Rank results by a value:
```sql
SELECT * FROM `audette-development.learning_sql.employees`
ORDER BY annual_salary
```

Doesn't have to be a number:
```sql
SELECT * FROM `audette-development.learning_sql.employees`
ORDER BY type
```

Can combine (descending order of importance):
```sql
SELECT * FROM `audette-development.learning_sql.employees`
ORDER BY type, annual_salary
```








## Part 3 - 20 mins

Joins. They're important.

Start by setting up a couple other tables to join to:
```sql
CREATE TABLE `audette-development.learning_sql.groups` (
    type string NOT NULL,
    description string NOT NULL,
    inherit_value numeric NOT NULL
);

INSERT INTO `audette-development.learning_sql.groups` (
    type,
    description,
    inherit_value
) VALUES
    ( 'Famous', 'The kind of people everyone knows about', 10 ),
    ( 'Nobility', 'Blue blooded, possibly reptiles.', 30 ),
    ( 'Deserving', "People that should be famous, but aren't", 0 )
;

CREATE TABLE `audette-development.learning_sql.stories` (
    firstname string,
    lastname string,
    story string
);

INSERT INTO `audette-development.learning_sql.stories` (
    firstname,
    lastname,
    story
) VALUES
    ( 'Claude', 'Shannon', 'Single handedly created modern information theory, and found a way to cheat at roulette.' ),
    ( 'Simon', 'Bolivar', "'El Libertador' of Columbia, Venezuela, Ecuabor, Panama, Peru, and Bolivia." ),
    ( 'Bart', 'Simpson', 'He has too many stories to write here.' )
    
;

-- SELECT * FROM `audette-development.learning_sql.groups`
-- SELECT * FROM `audette-development.learning_sql.stories`
```

### INNER JOINS:

The most common. Merges the two tables based on the given columns & discards records where the is no matching record in the
other table.

Note: I'm using temporary names for the tables rather than fully writing them out.

```sql
SELECT
    *
FROM
    `audette-development.learning_sql.employees` e
    INNER JOIN
    `audette-development.learning_sql.groups` g
    ON
    e.type = g.type
```

You can use inner join as a filter (but there's likely a better way)
```sql
SELECT
    *
FROM
    `audette-development.learning_sql.employees` e
    INNER JOIN
    `audette-development.learning_sql.stories` s
    ON
    e.firstname = s.firstname
```

### LEFT JOINS

This is the same query, but with a LEFT JOIN instead of an INNER JOIN. Let's see how we
get all the values from the `employees` table.

```sql
SELECT
    *
FROM
    `audette-development.learning_sql.employees` e
    LEFT JOIN
    `audette-development.learning_sql.stories` s
    ON
    e.firstname = s.firstname
```

Remember, we have two Simpsons in the `employees` table. So what happens if we match on the lastname?
```sql
SELECT
    *
FROM
    `audette-development.learning_sql.employees` e
    LEFT JOIN
    `audette-development.learning_sql.stories` s
    ON
    e.lastname = s.lastname
```

### RIGHT JOINS

This is the same query, but with a RIGHT JOIN. We won't see any extra records (because all the records on the right match those on the left)

```sql
SELECT
    *
FROM
    `audette-development.learning_sql.employees` e
    RIGHT JOIN
    `audette-development.learning_sql.stories` s
    ON
    e.firstname = s.firstname
```

### FULL JOIN

Take all the values!

```sql
SELECT
    *
FROM
    `audette-development.learning_sql.stories` s
    FULL JOIN
    `audette-development.learning_sql.employees` e
    ON
    e.firstname = s.firstname
```






## Part 4 - 5 Minutes

Case Statements

### Case Statements

Think about an if statement, but way better. You can use to rename things (eg. Utility ID -> Utility Type),
or check if there was an error (eg. using the 'ELSE' field, then search if anything got that value).

```sql
SELECT
    firstname,
    lastname,
    type,
    CASE
        WHEN type = 'Famous' THEN 'Clap'
        WHEN type = 'Deserving' THEN 'Promote'
        WHEN type = 'Nobility' THEN NULL
        ELSE 'Something Went Wrong'
    END as action
FROM  `audette-development.learning_sql.employees`
```

    



## Part 5 - 5 mins

The Danger Zone

### DELETE Records

You need to have a "WHERE" clause (in BigQuery at least, some databases will just delete all the records if you do this).
```sql
DELETE FROM `audette-development.learning_sql.employees`
WHERE firstname = "Bart"
```

### DROP TABLE

Please, please, please be careful.
```sql
DROP TABLE `audette-development.learning_sql.employees`;
DROP TABLE `audette-development.learning_sql.groups`;
```

