
MySQL5Dialect
create table NLUWatson.Nlusum (Id BIGINT auto_increment PRIMARY KEY) SELECT year, item, itemtext, SUM(count) as count, AVG(anger) as anger, AVG(disgust)as disgust, AVG(fear) as fear, AVG(joy) as joy, AVG(relevance) as relevance, AVG(sadness) as sadness, AVG(sentiment) as sentiment, type FROM NLUWatson.Nlu group by year, item, itemtext, type;
