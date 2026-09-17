/**
 * Process a simulated notification job.
 * Logs the notification to console (simulating an email/SMS service).
 */
async function processNotification(job) {
  const { bookingId, userId, eventTitle, seatLabels, type } = job.data;

  // Simulate processing delay (like calling an external service)
  await new Promise((resolve) => setTimeout(resolve, 1000));

  console.log('═══════════════════════════════════════════════════════');
  console.log(`[NOTIFICATION] Type: ${type}`);
  console.log(`[NOTIFICATION] Booking: ${bookingId}`);
  console.log(`[NOTIFICATION] User: ${userId}`);
  console.log(`[NOTIFICATION] Event: ${eventTitle}`);
  console.log(`[NOTIFICATION] Seats: ${seatLabels.join(', ')}`);
  console.log('═══════════════════════════════════════════════════════');
}

module.exports = processNotification;
