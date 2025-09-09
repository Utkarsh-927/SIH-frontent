const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Simulated data
let busData = {
  routes: {
    '101': { name: 'Central ↔ Mall', buses: ['101-A', '101-B'], status: 'active' },
    '205': { name: 'Airport ↔ City', buses: ['205-A'], status: 'active' },
    '312': { name: 'Hospital ↔ Station', buses: ['312-A', '312-B'], status: 'active' },
    '450': { name: 'University ↔ Tech Park', buses: ['450-A'], status: 'active' }
  },
  buses: {
    '101-A': { route: '101', passengers: 23, status: 'active', location: 'Market Square', delay: 0 },
    '101-B': { route: '101', passengers: 18, status: 'active', location: 'University', delay: 2 },
    '205-A': { route: '205', passengers: 31, status: 'active', location: 'Airport', delay: 0 },
    '312-A': { route: '312', passengers: 15, status: 'maintenance', location: 'Depot', delay: 0 },
    '312-B': { route: '312', passengers: 27, status: 'active', location: 'Hospital', delay: 5 },
    '450-A': { route: '450', passengers: 22, status: 'active', location: 'Tech Park', delay: 1 }
    
  },
  arrivals: [
    { route: '101', destination: 'Market Square', time: '3 min', status: 'on-time' },
    { route: '205', destination: 'Airport Terminal', time: '7 min', status: 'on-time' },
    { route: '450', destination: 'University Gate', time: '5 min', status: 'on-time' },
    { route: '312', destination: 'Hospital Main', time: '12 min', status: 'delayed' }
  ]
};

// Passenger API

// Get arrivals
app.get('/api/passenger/arrivals', (req, res) => {
  res.json(busData.arrivals);
});

// Search buses by route query param
app.get('/api/passenger/search', (req, res) => {
  const route = req.query.route;
  if (!route) return res.status(400).json({ error: 'Route query param required' });

  const buses = Object.entries(busData.buses)
    .filter(([busId, bus]) => bus.route === route)
    .map(([busId, bus]) => ({
      number: busId,
      status: bus.status,
      passengers: bus.passengers,
      location: bus.location,
      delay: bus.delay
    }));

  res.json(buses);
});

// Driver API

// Update location
app.post('/api/driver/update-location', (req, res) => {
  const { busId, lat, lon } = req.body;
  if (!busId || !lat || !lon) return res.status(400).json({ error: 'busId, lat, lon required' });

  // For demo, just acknowledge
  console.log(`Bus ${busId} location updated to lat:${lat}, lon:${lon}`);
  res.json({ message: 'Location updated' });
});

// Update passenger count
app.post('/api/driver/update-passengers', (req, res) => {
  const { busId, passengers } = req.body;
  if (!busId || passengers == null) return res.status(400).json({ error: 'busId and passengers required' });

  if (busData.buses[busId]) {
    busData.buses[busId].passengers = passengers;
    res.json({ message: 'Passenger count updated' });
  } else {
    res.status(404).json({ error: 'Bus not found' });
  }
});

// Admin API

// Get fleet info
app.get('/api/admin/fleet', (req, res) => {
  const fleet = Object.entries(busData.buses).map(([busId, bus]) => ({
    number: busId,
    route: bus.route,
    status: bus.status,
    passengers: bus.passengers
  }));
  res.json(fleet);
});

// Get routes
app.get('/api/admin/routes', (req, res) => {
  const routes = Object.entries(busData.routes).map(([number, route]) => ({
    number,
    name: route.name,
    status: route.status,
    buses: route.buses
  }));
  res.json(routes);
});

// Add new route
app.post('/api/admin/routes', (req, res) => {
  const { number, stops } = req.body;
  if (!number || !stops || !Array.isArray(stops)) {
    return res.status(400).json({ error: 'number and stops array required' });
  }
  if (busData.routes[number]) {
    return res.status(400).json({ error: 'Route number already exists' });
  }
  busData.routes[number] = { name: stops.join(' ↔ '), buses: [], status: 'active' };
  res.json({ message: 'Route added', route: busData.routes[number] });
});

// Start server
app.listen(port, () => {
  console.log(`CityTrack backend running at http://localhost:${port}`);
});
