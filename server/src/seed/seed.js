require('dotenv').config();

const mongoose = require('mongoose');
const Venue = require('../models/Venue');
const Event = require('../models/Event');
const Seat = require('../models/Seat');
const Booking = require('../models/Booking');
const { getSeatLabel, EVENT_CATEGORIES } = require('../../../shared/constants');

const isProd = process.argv.includes('--prod');

// Demo venues
const venueData = [
  { name: 'Grand Arena', rows: 8, columns: 10 },
  { name: 'Skyline Theater', rows: 10, columns: 15 },
];

// Demo events — dates are set in the future relative to seed time
const getEventData = (venueMap) => {
  const now = new Date();
  const daysFromNow = (days) => {
    const d = new Date(now);
    d.setDate(d.getDate() + days);
    return d;
  };

  return [
    {
      title: 'Rock Concert 2026',
      description:
        'Experience the electrifying energy of live rock music with top bands performing their greatest hits. Prepare for an unforgettable night of powerful guitar riffs, thundering drums, and roaring vocals.',
      venue: venueMap['Grand Arena'],
      date: daysFromNow(7),
      time: '19:00',
      category: 'concert',
      price: 75,
      imageUrl: '',
    },
    {
      title: 'Jazz Night Under the Stars',
      description:
        'An intimate evening of smooth jazz, soulful melodies, and improvisational brilliance. Enjoy world-class musicians in a relaxed, open-air setting with craft cocktails.',
      venue: venueMap['Skyline Theater'],
      date: daysFromNow(14),
      time: '20:00',
      category: 'concert',
      price: 60,
      imageUrl: '',
    },
    {
      title: 'Championship Basketball Finals',
      description:
        'The biggest game of the season! Watch the top two teams battle it out for the championship title in this high-stakes, action-packed matchup.',
      venue: venueMap['Grand Arena'],
      date: daysFromNow(10),
      time: '18:30',
      category: 'sports',
      price: 120,
      imageUrl: '',
    },
    {
      title: 'Shakespeare: A Midsummer Night\'s Dream',
      description:
        'A magical retelling of Shakespeare\'s beloved comedy, featuring stunning costumes, enchanting set design, and a talented ensemble cast that brings the fairy realm to life.',
      venue: venueMap['Skyline Theater'],
      date: daysFromNow(21),
      time: '19:30',
      category: 'theater',
      price: 50,
      imageUrl: '',
    },
    {
      title: 'Stand-Up Comedy Showcase',
      description:
        'Get ready to laugh until your sides hurt! Featuring five of the hottest rising comedians, this showcase delivers an evening of sharp wit, hilarious observations, and non-stop entertainment.',
      venue: venueMap['Grand Arena'],
      date: daysFromNow(5),
      time: '21:00',
      category: 'comedy',
      price: 35,
      imageUrl: '',
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
    console.log('\nCreating venues...');
    const venues = [];
    const venueMap = {};
    for (const data of venueData) {
      const venue = await Venue.create(data);
      venues.push(venue);
      venueMap[data.name] = venue._id;
      console.log(`  ✓ ${venue.name} (${venue.rows}×${venue.columns} = ${venue.totalSeats} seats)`);
    }

    // Create events and generate seats
    console.log('\nCreating events and generating seats...');
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
        `  ✓ ${event.title} (${event.category}) — ${seats.length} seats @ $${event.price}`
      );
    }

    // Summary
    console.log('\n═══════════════════════════════════════════');
    console.log('  Seed Summary');
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
