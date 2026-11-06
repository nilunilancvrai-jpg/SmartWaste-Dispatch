# SmartWaste Dispatch — Public Mode Handover

**Project:** SmartWaste Dispatch
**Module:** Public Mode
**Status:** Core functionality implemented and tested using simulated GPS and demo bin data.

## 1. Purpose of Public Mode

Public Mode helps ordinary users find the nearest suitable waste bin.

The system:

- Detects the user's location using browser GPS.
- Displays the user's position on an interactive map.
- Finds nearby suitable waste bins.
- Recommends the nearest suitable bin.
- Displays the bin's fill level and distance.
- Provides walking directions.
- Updates the user's marker when GPS coordinates change.

## 2. Completed Features

| Feature                | Implementation              |
| ---------------------- | --------------------------- |
| Interactive map        | Leaflet                     |
| Map tiles              | OpenStreetMap               |
| GPS tracking           | Browser Geolocation API     |
| Live location marker   | Leaflet marker              |
| Distance calculation   | JavaScript                  |
| Bin recommendation     | Custom recommendation logic |
| Availability filtering | Fill level and status       |
| Search radius          | Maximum 5 km                |
| Walking directions     | Leaflet Routing Machine     |
| Local data storage     | Browser LocalStorage        |
| Mobile layout          | Responsive HTML/CSS         |

Core features have been tested using Chrome's simulated GPS coordinates. Physical outdoor GPS testing is still pending.

## 3. Project Folder Structure

```text
smartwaste-dispatch/
│
├── index.html
│
├── css/
│   └── style.css
│
├── data/
│   └── sample-bins.js
│
├── js/
│   ├── app.js
│   ├── binService.js
│   ├── distance.js
│   ├── location.js
│   ├── recommendation.js
│   ├── routing.js
│   ├── storage.js
│   └── workerActions.js
│
└── README.md
```

## 4. JavaScript Module Responsibilities

### app.js

Main application controller.

Responsibilities:

- Initializes the map.
- Starts live GPS tracking.
- Updates the blue user marker.
- Displays the recommended bin.
- Handles user interface buttons.
- Triggers walking-route updates.

### location.js

Handles browser geolocation and exposes the location-related functionality.

### distance.js

Calculates geographic distance between two coordinates and formats the distance for display.

### recommendation.js

Finds suitable bins.

Rules:

- Bin status must be `available`.
- Fill level must be at least 0 and below 80%.
- Latitude and longitude must be valid.
- Bin must be within 5 km.
- The nearest suitable bin is recommended.

Progressive search radii:

`0.5 km → 1 km → 2 km → 5 km`

### binService.js

Manages bin records.

Responsibilities:

- Get all bins.
- Find a bin by ID.
- Update a bin.
- Restore demo data.

### storage.js

Stores and retrieves bin records using browser LocalStorage.

Storage key:

`smartwaste_bins`

This is local browser storage, not a shared cloud database.

### routing.js

Handles walking-route display and route clearing using Leaflet Routing Machine.

### sample-bins.js

Contains simulated demo bin data around Somwarpet.

These coordinates are not verified real municipal bin locations.

### workerActions.js

Contains worker-related actions. Its current implementation must be reviewed before integration.

## 5. Important Integration Points

The Public Mode and Worker Mode must eventually use a shared source of bin data.

Important bin fields:

```javascript
{
    id: 1,
    name: "Demo Bin Station 01",
    address: "Demo location",
    lat: 12.5970,
    lng: 75.8496,
    fill: 35,
    status: "available",
    updatedAt: Date.now()
}
```

Important shared fields:

- `id`
- `name`
- `lat`
- `lng`
- `fill`
- `status`
- `updatedAt`

When a worker completes a collection, the system should update the relevant bin record.

Public Mode should then use the updated fill level and status when recommending bins.

Important: The current LocalStorage implementation only shares data within the same browser origin and browser storage context. It is not a multi-user backend.

## 6. Known Limitations

1. Bin information is simulated demo data.
2. No real municipal bin sensors are connected.
3. No shared cloud database is currently implemented.
4. GPS testing has been performed using Chrome simulation; physical GPS testing is pending.
5. Public walking-route services may have availability or rate-limit restrictions.
6. Worker and Supervisor integration is pending.
7. LocalStorage is not suitable as the final shared multi-user database.

## 7. Testing Checklist

- [x] Map loads.
- [x] OpenStreetMap tiles load.
- [x] Browser GPS updates are received.
- [x] Blue GPS marker moves under simulated GPS.
- [x] Distance calculation works.
- [x] Suitable bin is recommended.
- [x] Bins at 80% or higher are excluded.
- [x] Out-of-service bins are excluded.
- [x] Alternative suitable bin is recommended.
- [x] No-suitable-bin message is displayed.
- [x] GPS permission-denied handling is tested.
- [x] GPS permission recovery is tested.
- [x] Initial mobile layout is visually checked.
- [ ] Physical GPS testing.
- [ ] Complete route recalculation response verification.
- [ ] Real multi-user database integration.
- [ ] Final integration with Worker and Supervisor modules.

## 8. Integration Rules

1. Do not rename shared bin fields without coordinating with the other modules.
2. Keep bin IDs consistent across Public, Worker and Supervisor modules.
3. Do not directly modify another module's files without coordination.
4. Test bin updates after every integration change.
5. Do not treat simulated demo data as real municipal data.

## 9. Current Project Status

Public Mode's core frontend and recommendation functionality are implemented.

The next major milestone is integration with Worker and Supervisor modules after their completion.
