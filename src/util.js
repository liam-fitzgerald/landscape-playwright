
async function waitForNetworkSettled(page, action, longPolls = 0) {
  let networkSettledCallback;
  const networkSettledPromise = new Promise(f => networkSettledCallback = f);

  let requestCounter = 0;
  let actionDone = false;

  const maybeSettle = () => {
    if (actionDone && requestCounter <= longPolls)
      networkSettledCallback();
  };

  const onRequest = request => {
    ++requestCounter;
    console.log(`req: ${requestCounter}`);
  };
  const onRequestDone = request => {
    // Let the page handle responses asynchronously (via setTimeout(0)).
    //
    // Note: this might be changed to use delay, e.g. setTimeout(f, 100),
    // when the page uses delay itself.
    const evaluate = page.evaluate(() => new Promise(f => setTimeout(f, 0)));
    evaluate.catch(e => null).then(() => {
      --requestCounter;
      console.log(`req: ${requestCounter}`);
      maybeSettle();
    });
  };

  page.on('request', onRequest);
  page.on('requestfinished', onRequestDone);
  page.on('requestfailed', onRequestDone);

  let timeoutId;

  const result = await action();
  actionDone = true;
  maybeSettle();
  await networkSettledPromise;

  page.removeListener('request', onRequest);
  page.removeListener('requestfinished', onRequestDone);
  page.removeListener('requestfailed', onRequestDone);


  return result;
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const imgSnap = {
  comparison: 'ssim',
  failureThreshold: 0.01,
  failureThresholdType: 'percent'
};

module.exports = { waitForNetworkSettled, wait, imgSnap };
