# T05: Vehicle Routing Optimization

## Problem Description

A fleet of vehicles services a set of cities.
Each vehicle starts and ends at a depot (city 0).
Each city has a demand (integer) representing how much cargo is delivered.
Each vehicle has a capacity (integer) — it cannot carry more than its capacity.
A route assigns an ordered sequence of cities to a vehicle.

## Optimization Goals
- **RouteLength**: Minimize total route distance (calculated as the sum of Euclidean distances across all sequential cities in all routes)
- **SolutionLength**: Minimize number of transformation moves used (built-in)

## Metamodel Requirements
- **City**: id (String), x (Double), y (Double), demand (Int)
- **Vehicle**: id (String), capacity (Int), route → City[*] (ordered, non-containment)
- **Model**: cities → City[*] (containment), vehicles → Vehicle[*] (containment)

## Transformation Rule & Allowed Edits
- **reassignCity**: Moves a City from one Vehicle's `route` collection to another Vehicle's `route` collection.
- **Constraints**: 
  - The target vehicle's total assigned city demands must not exceed its capacity after the assignment.
  - The move can transfer a city from any position in one vehicle's route to any position in another vehicle's route.
  - No new cities or vehicles can be created or deleted during the search.

## Initial Instance Definition (Explicit Input Model)
- **Cities (5)**:
  - `city0` (Depot): x = 0.0, y = 0.0, demand = 0
  - `city1`: x = 10.0, y = 10.0, demand = 20
  - `city2`: x = 20.0, y = 20.0, demand = 30
  - `city3`: x = 30.0, y = 30.0, demand = 15
  - `city4`: duration = 40, x = 40.0, y = 40.0, demand = 10
- **Vehicles (3)**:
  - `vehicle0`: capacity = 100, initially holds all 5 cities in its route in sequence: `_city0 _city1 _city2 _city3 _el4` (Worst case: 1 vehicle does all work).
  - `machine1` (empty, capacity = 100)
  - `machine2` (empty, capacity = 100)
