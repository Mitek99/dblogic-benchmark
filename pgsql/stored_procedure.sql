CREATE OR REPLACE FUNCTION find_all_topics()
  RETURNS TEXT AS
$BODY$

DECLARE
retval text = '';

BEGIN
retval = (SELECT row_to_json(d) FROM 
(SELECT (SELECT array_to_json(array_agg(t)) FROM topic t) topics, 
(SELECT array_to_json(array_agg(u)) FROM "user" u WHERE u.user_id in (SELECT user_id from topic t2)) users) d);
RETURN retval;
END;

$BODY$
LANGUAGE plpgsql VOLATILE
COST 100;