dblogic-benchmark
=================

Comparing speeds of different JSON-generation strategies

Test data:

3000+ topics
27000+ users, some of which are authors of topics

JSON being generated:

```
{ 
  topics: {array of topic objects}, 
  users: {array of user objects, only those who are authors}
}
```
