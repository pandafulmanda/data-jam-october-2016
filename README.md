# Houston Meetup Data

For this month's [data jam](http://www.meetup.com/Houston-Data-Visualization-Meetup/events/232548862/), we will be working with 2016 US primary election results.  This data is sourced from Kaggle.

We have the data available in **csv**, each in their respective directories.

## Data

The data are found in the following files:

1. **groups.csv**: groups.csv

  | Column    | Description                                |
  |----------:|--------------------------------------------|
  | id     | unique group id|
  | name | group name|
  | urlname    | url to meetup page|
  | rating     | average rating for meetup events |
  | created | date of creation |
  | description    | meetup description |
  | organizerName      | organizer's name |
  | organiserMemberID | organizer's unique member ID |

1. **members.csv**: members.csv

  | Column    | Description                                |
  |----------:|--------------------------------------------|
  | state     | state where the primary or caucus was held |
  | state_abbreviation | two letter state abbreviation     |
  | county    | county where the results come from         |
  | fips      | [FIPS county code](https://en.wikipedia.org/wiki/FIPS_county_code) |
  | party     | Democrat or Republican                     |
  | candidate | name of the candidate                      |
  | votes     | number of votes the candidate received in the corresponding state and county (may be missing) |
  | fraction_votes | fraction of votes the president received in the corresponding state, county, and primary |

1. **venues.csv**: Each row contains the schedule and type of the primary election by state and party

  | Column | Description                                |
  | ------:| ------------------------------------------ |
  | date   | date when the primary of caucus was held   |
  | state  | state where the primary or caucus was held |
  | party  | political party                            |
  | type   | election type                              |

Additionally, we have each county's shapefiles

**county_shapefiles**: directory containing county shapefiles at three different resolutions for mapping

## Sources
- [micahstubbs/modeling-worked-example](https://github.com/micahstubbs/modeling-worked-example)
- [Neo4j example](https://github.com/neo4j-meetups/modeling-worked-example)
- [Meetup's API](https://www.meetup.com/meetup_api/)