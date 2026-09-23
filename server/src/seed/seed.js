require('dotenv').config();

const mongoose = require('mongoose');
const Venue = require('../models/Venue');
const Event = require('../models/Event');
const Seat = require('../models/Seat');
const Booking = require('../models/Booking');
const { getSeatLabel, EVENT_CATEGORIES } = require('../../../shared/constants');

const isProd = process.argv.includes('--prod');

// Demo Indian venues
const venueData = [
  { name: 'Nita Mukesh Ambani Cultural Centre (NMACC), Mumbai', rows: 8, columns: 10 },
  { name: 'Bharat Mandapam, New Delhi', rows: 10, columns: 15 },
];

// Demo Indian events — dates are set in the future relative to seed time
const getEventData = (venueMap) => {
  const now = new Date();
  const daysFromNow = (days) => {
    const d = new Date(now);
    d.setDate(d.getDate() + days);
    return d;
  };

  return [
    {
      title: 'Arijit Singh Live — Soulful Symphony Tour',
      description:
        'Experience the magical voice of India’s favourite playback singer live with a 40-piece grand orchestra. Sing along to Tum Hi Ho, Kesariya, Channa Mereya, and more.',
      venue: venueMap['Nita Mukesh Ambani Cultural Centre (NMACC), Mumbai'],
      date: daysFromNow(7),
      time: '19:00',
      category: 'concert',
      price: 1999,
      imageUrl: '/images/arijit-singh.jpg',
    },
    {
      title: 'IPL 2026: Mumbai Indians vs Chennai Super Kings',
      description:
        'The El Clásico of Indian cricket! Catch Rohit Sharma and MS Dhoni’s squads clash in an electrifying high-stakes T20 encounter under the stadium lights.',
      venue: venueMap['Bharat Mandapam, New Delhi'],
      date: daysFromNow(10),
      time: '19:30',
      category: 'sports',
      price: 2499,
      imageUrl: '/images/ipl-cricket.jpg',
    },
    {
      title: 'Zakir Khan: Tathastu & Beyond Live',
      description:
        'The Sakht Launda returns with an all-new 90-minute stand-up special featuring hilarious and heartwarming stories of childhood, relationships, and modern Indian life.',
      venue: venueMap['Nita Mukesh Ambani Cultural Centre (NMACC), Mumbai'],
      date: daysFromNow(5),
      time: '20:00',
      category: 'comedy',
      price: 999,
      imageUrl: '/images/zakir-khan.jpg',
    },
    {
      title: 'Mughal-e-Azam: The Grand Musical',
      description:
        'Director Feroz Abbas Khan’s award-winning Broadway-scale musical with opulent Manish Malhotra costumes, live Kathak performances, and timeless classic songs.',
      venue: venueMap['Bharat Mandapam, New Delhi'],
      date: daysFromNow(21),
      time: '18:30',
      category: 'theater',
      price: 1499,
      imageUrl: '/images/mughal-e-azam.jpg',
    },
    {
      title: 'Anoushka Shankar & Ustad Zakir Hussain: Sitar & Tabla Jugalbandi',
      description:
        'A transcendent evening of Indian classical music uniting Grammy-nominated sitar virtuoso Anoushka Shankar with living legend Ustad Zakir Hussain.',
      venue: venueMap['Nita Mukesh Ambani Cultural Centre (NMACC), Mumbai'],
      date: daysFromNow(14),
      time: '19:00',
      category: 'concert',
      price: 1299,
      imageUrl: '/images/jugalbandi.jpg',
    },
  ];
};

/**
 * Generate seat documents for an event based on venue dimensions.
 */
function generateSeats(eventId, rows, columns) {
  const seats = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      seats.push({
        event: eventId,
        row,
        column: col,
        label: getSeatLabel(row, col),
      });
    }
  }
  return seats;
}

async function seed() {
  try {
    // Connect to MongoDB
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('MONGODB_URI is not set. Create server/.env from server/.env.example');
      process.exit(1);
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    if (isProd) {
      console.log('\n⚠️  Running in PRODUCTION mode');
    }

    // Clear existing data
    console.log('\nClearing existing data...');
    await Promise.all([
      Booking.deleteMany({}),
      Seat.deleteMany({}),
      Event.deleteMany({}),
      Venue.deleteMany({}),
    ]);
    console.log('  ✓ Cleared all collections');

    // Create venues
    console.log('\nCreating Indian venues...');
    const venues = [];
    const venueMap = {};
    for (const data of venueData) {
      const venue = await Venue.create(data);
      venues.push(venue);
      venueMap[data.name] = venue._id;
      console.log(`  ✓ ${venue.name} (${venue.rows}×${venue.columns} = ${venue.totalSeats} seats)`);
    }

    // Create events and generate seats
    console.log('\nCreating Indian events and generating seats...');
    const eventDataList = getEventData(venueMap);
    let totalSeatsGenerated = 0;

    for (const data of eventDataList) {
      const event = await Event.create(data);

      // Find the venue to get dimensions
      const venue = venues.find((v) => v._id.toString() === data.venue.toString());
      const seats = generateSeats(event._id, venue.rows, venue.columns);
      await Seat.insertMany(seats);

      totalSeatsGenerated += seats.length;
      console.log(
        `  ✓ ${event.title} (${event.category}) — ${seats.length} seats @ ₹${event.price}`
      );
    }

    // Summary
    console.log('\n═══════════════════════════════════════════');
    console.log('  Seed Summary (Indian Context & INR)');
    console.log('═══════════════════════════════════════════');
    console.log(`  Venues created:    ${venues.length}`);
    console.log(`  Events created:    ${eventDataList.length}`);
    console.log(`  Seats generated:   ${totalSeatsGenerated}`);
    console.log('═══════════════════════════════════════════');
    console.log('\n✅ Seed complete!\n');

  } catch (err) {
    console.error('\n❌ Seed failed:', err.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
}

seed();
