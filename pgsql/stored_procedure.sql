CREATE OR REPLACE FUNCTION find_all_topics()
  RETURNS TEXT AS
$BODY$

DECLARE
retval text = '';

BEGIN
retval = (SELECT row_to_json(d) FROM 
(SELECT array_to_json(array_agg(row_to_json(t))) topics, array_to_json(array_agg(row_to_json(u))) users
FROM topic t INNER JOIN "user" u ON t.user_id=u.user_id) d);
RETURN retval;
END;

$BODY$
LANGUAGE plpgsql VOLATILE
COST 100;
