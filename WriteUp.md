# Write-up

## 1. What did you build for Part B, and why that?

For part B, I noticed that there was a visits table in the schema but nothing using it. 
Feeding Brennen is supposed to track Brennen's data eating out. For that, I copied the same processes at A2, building a REST API for the exact same operations as resturants simply for visits. Then, I implemented the same error checkign as Part A. I wanted to do something simple, so I added a total per resturant, and a modal for each resturant showing the total and the visit history. Additionally, I added a small tag that says most recent resturant. I chose these features because they are simple, but they serve the purpose of Brennen's webapp, it shows him where he ate recently, and the costs. I think a lot of times before I try to make the most impressive feature possible, but I think that a lot of times, for people, they appreciate the simplicity and effectiveness of a proper solution.

## 2. What did you decide, and what did you rule out?
I reused the existing visits schema and mirrored the A2/A3 patterns for editing visits and the error handling. 

I also computed spend total and recency ordering on the client end since the dataset is small, I looped through and sorted the resturants by most recent date.

I ruled out an add/edit/delete visit UI. The API is complete and testable, but the frontend only reads. Focusing on frontend features gave me time to check over if the api was functioning properly, which I believe the add/edit/delete visit UI is simply a frontend addition that I can add later.

## 3. Where did you cut corners?
Same as above, the lack of a create / edit a visit UI. You can only use curl or postman to add to the write side. Theres no filtering on visits, it just returns everything, which is fine with a smaller end app, but doesn't scale. 

## 4. What should we look at first?

`client/app/api/visits/route.ts` and `client/app/api/visits/[id]/route.ts`
for the API; `client/lib/visitStats.ts` for the sort logic; `client/app/components/RestaurantVisits.tsx`
plus `client/app/page.tsx` for the additions to the frontend.

---

## Part B: routes

| Method and path         | What it does                             | Success                | Errors                                                                                          |
| ------------------------ | ----------------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------ |
| `GET /api/visits`        | List all visits, most recent date first   | `200` + JSON array      | -                                                                                                 |
| `GET /api/visits/:id`    | Fetch one visit                           | `200` + visit           | `404` if missing _or_ if `:id` isn't a positive integer                                          |
| `POST /api/visits`       | Create a visit                            | `201` + created visit   | `400` on invalid body; `400` if `restaurantId` doesn't reference an existing restaurant |
| `PUT /api/visits/:id`    | Update a visit                            | `200` + updated visit   | `404` if missing, `400` on invalid body                                 |
| `DELETE /api/visits/:id` | Delete a visit                            | `204`, no body          | `404` if missing                                                                                  |

Visit shape:

```json
{
  "id": 4,
  "restaurantId": 1,
  "date": "2026-01-15",
  "amountSpent": 24.5,
  "notes": "Brought Brennen along",
  "createdAt": "2026-01-15T18:03:00.000Z"
}
```

**`POST /api/visits`**

```jsonc
// request
{
  "restaurantId": 1,
  "date": "2026-01-15",
  "amountSpent": 24.5,
  "notes": "Brought Brennen along" // optional
}

// 201 response
{
  "id": 4,
  "restaurantId": 1,
  "date": "2026-01-15",
  "amountSpent": 24.5,
  "notes": "Brought Brennen along",
  "createdAt": "2026-01-15T18:03:00.000Z"
}
```

on POST and PUT amountSpent and notes are optional and nullable ;
restaurantId and date are required. date must be YYYY-MM-DD.

## Schema changes
No schema changes, visits were already implemented through client/db/migrations/001_create_tables.sql. The Delete cascade for visits.resturantID also acts as a deliberate feature rather than a flaw.

## How I verified this

**Part A** - the contract table in CHALLENGE.md, every row including the error
cases:

```bash
curl -i http://localhost:3000/api/restaurants          # 200 + array
curl -i http://localhost:3000/api/restaurants/1         # 200 + one restaurant
curl -i http://localhost:3000/api/restaurants/99999     # 404
curl -i http://localhost:3000/api/restaurants/abc       # 404, not 500
curl -i -X POST http://localhost:3000/api/restaurants \
  -H 'Content-Type: application/json' \
  -d '{"name":"Valid Spot","cuisine":"Test","address":"2 Test St","rating":4.5}'  # 201
curl -i -X POST http://localhost:3000/api/restaurants \
  -H 'Content-Type: application/json' \
  -d '{"name":"Out Of Range","rating":6}'                # 400
curl -i -X POST http://localhost:3000/api/restaurants \
  -H 'Content-Type: application/json' \
  -d '{"rating":3}'                                      # 400, missing name
curl -i -X PUT http://localhost:3000/api/restaurants/1 \
  -H 'Content-Type: application/json' \
  -d '{"name":"Renamed","cuisine":"Test","address":"2 Test St","rating":3}'  # 200
curl -i -X PUT http://localhost:3000/api/restaurants/99999 \
  -H 'Content-Type: application/json' \
  -d '{"name":"Nope","cuisine":"Test","address":"x","rating":3}'  # 404
curl -i -X DELETE http://localhost:3000/api/restaurants/1  # 204
curl -i -X DELETE http://localhost:3000/api/restaurants/99999  # 404
```

**Part B** - the equivalent cases for visits:

```bash
curl -i http://localhost:3000/api/visits                # 200 + array
curl -i http://localhost:3000/api/visits/1               # 200 + one visit
curl -i http://localhost:3000/api/visits/99999            # 404
curl -i http://localhost:3000/api/visits/abc               # 404, not 500

curl -i -X POST http://localhost:3000/api/visits \
  -H 'Content-Type: application/json' \
  -d '{"restaurantId":1,"date":"2026-01-15","amountSpent":24.5,"notes":"Brought Brennen along"}'  # 201

curl -i -X POST http://localhost:3000/api/visits \
  -H 'Content-Type: application/json' \
  -d '{"date":"2026-01-15","amountSpent":24.5}'           # 400, missing restaurantId

curl -i -X POST http://localhost:3000/api/visits \
  -H 'Content-Type: application/json' \
  -d '{"restaurantId":1,"date":"not-a-date","amountSpent":24.5}'  # 400, bad date

curl -i -X POST http://localhost:3000/api/visits \
  -H 'Content-Type: application/json' \
  -d '{"restaurantId":1,"date":"2026-01-15","amountSpent":-5}'    # 400, negative amount

curl -i -X POST http://localhost:3000/api/visits \
  -H 'Content-Type: application/json' \
  -d '{"restaurantId":99999,"date":"2026-01-15","amountSpent":10}'  # 400, FK violation -> mapped, not a 500

curl -i -X PUT http://localhost:3000/api/visits/1 \
  -H 'Content-Type: application/json' \
  -d '{"restaurantId":1,"date":"2026-01-16","amountSpent":30,"notes":"updated"}'  # 200

curl -i -X PUT http://localhost:3000/api/visits/99999 \
  -H 'Content-Type: application/json' \
  -d '{"restaurantId":1,"date":"2026-01-16","amountSpent":30}'  # 404

curl -i -X DELETE http://localhost:3000/api/visits/1     # 204
curl -i -X DELETE http://localhost:3000/api/visits/99999  # 404
```

## Known issues / what I'd do next

- No UI to create, edit, or delete a visit 
- `GET /api/visits` has no  filtering
- The homepage still has no loading or error state 
