const fetch = global.fetch;

(async () => {
  try {
    const bills = [
      { billingDate: '2026-03-01', unitsConsumed: 150, amountPaid: 900.50 },
      { billingDate: '2026-04-01', unitsConsumed: 120, amountPaid: 720.25 }
    ];

    const res = await fetch('http://localhost:3000/api/ai-insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bills })
    });

    const json = await res.json();
    console.log('STATUS', res.status);
    console.log(JSON.stringify(json, null, 2));
  } catch (err) {
    console.error('ERROR', err);
    process.exit(1);
  }
})();
