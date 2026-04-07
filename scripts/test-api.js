const fetch = global.fetch;

(async () => {
  try {
    const getRes = await fetch('http://localhost:3000/api/bills');
    const getJson = await getRes.json();
    console.log('GET', getRes.status, JSON.stringify(getJson));

    const postRes = await fetch('http://localhost:3000/api/bills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ billingDate: '2026-04-07', unitsConsumed: 100, amountPaid: 500.75, notes: 'Test entry' }),
    });
    const postJson = await postRes.json();
    console.log('POST', postRes.status, JSON.stringify(postJson));
  } catch (err) {
    console.error('ERROR', err);
    process.exit(1);
  }
})();
