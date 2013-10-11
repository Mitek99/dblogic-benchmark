CREATE OR REPLACE FUNCTION find_all_topics()
  RETURNS TEXT AS
$BODY$

DECLARE
retval text = '';

BEGIN
retval = (SELECT row_to_json(d) FROM 
(SELECT (SELECT array_to_json(array_agg(row_to_json(t))) FROM topic t) topics) d);
RETURN retval;
END;

$BODY$
LANGUAGE plpgsql VOLATILE
COST 100;
