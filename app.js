const puppeteer = require('puppeteer');

async function fetchCardTexts(url, firstButtonSelector, secondButtonSelector, startId, endId) {
  const browser = await puppeteer.launch({
    headless: false, // Headless mode (no visible browser)
    args: ['--no-sandbox', '--disable-setuid-sandbox'], // Required for Docker
  });

  const page = await browser.newPage();

  // Custom delay function
  function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
  }

  try {
    let response;
    console.log(`Navigating to URL: ${url}`);
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    const title = await page.title();
    console.log(`Page title: ${title}`);

    let firstButtonTimedOut = false;
    try {
      console.log(`Waiting for the first button: ${firstButtonSelector}`);
      response = await page.waitForSelector(firstButtonSelector, { visible: true, timeout: 10000 });
      console.log(`First button found '${response}'. Clicking: ${firstButtonSelector}`);
      await page.click(firstButtonSelector);
    } catch (error) {
      if (error.name === 'TimeoutError') {
        console.error(`Timeout occurred while waiting for the first button: ${firstButtonSelector}`);
        firstButtonTimedOut = true; // Flag set when timeout occurs
      } else {
        throw error;  // Rethrow if it's a different error
      }
    }

    // Skip clicking if the first button was not found
    if (firstButtonTimedOut) {
      console.log('Skipping first button click due to timeout.');
    } else {
      console.log('Waiting after first button press...');
      await delay(2000); // 2-second delay
    }

    console.log(`Waiting for the second button: ${secondButtonSelector}`);
    await page.waitForSelector(secondButtonSelector, { visible: true, timeout: 10000 });
    console.log(`Second button found. Clicking: ${secondButtonSelector}`);
    await page.click(secondButtonSelector);
    console.log('Waiting after second button press...');
    await delay(1000);    

    // Iterate over the range of IDs for card texts
    const cardTexts = [];
    for (let i = startId; i <= endId; i++) {
      const targetId = `inner-card-${i}`;
      console.log(`Waiting for target element (label associated with #${targetId})`);
      await page.waitForSelector(`label[for="${targetId}"]`, { visible: true, timeout: 10000 });

      // Extract the text content of the label associated with the input ID
      const textValue = await page.$eval(`label[for="${targetId}"]`, el => el.textContent.trim());
      console.log(`Text value of ${targetId}: ${textValue}`);
      cardTexts.push(textValue); // Add to results array
    }

    try {      
      await page.waitForSelector('div[class="Tooltip-module_close__coDA6"]', { visible: true, timeout: 5000 });
    } catch(error) {
      console.log('ERROR: Timeout waiting for div[class="Tooltip-module_close__coDA6"]');
      throw error;
    }
    await page.click('div[class="Tooltip-module_close__coDA6"]');
    await delay(500);
    await page.click('label[for="inner-card-0"]');
    await page.click('label[for="inner-card-1"]');
    await page.click('label[for="inner-card-2"]');
    await page.click('label[for="inner-card-3"]');
    await delay(500);
    await page.click('button[class="ActionButton-module_button__IlhXt ActionButton-module_xSmall__WP4hl ActionButton-module_filled__zUShw"]');
    await delay(3333);

    await page.click('label[for="inner-card-0"]');
    await page.click('label[for="inner-card-1"]');
    await page.click('label[for="inner-card-2"]');
    await page.click('label[for="inner-card-3"]');
    await page.click('label[for="inner-card-4"]');
    await page.click('label[for="inner-card-5"]');
    await page.click('label[for="inner-card-6"]');
    await page.click('label[for="inner-card-7"]');
    await delay(500);
    await page.click('button[class="ActionButton-module_button__IlhXt ActionButton-module_xSmall__WP4hl ActionButton-module_filled__zUShw"]');
    await delay(3333);

    await page.click('label[for="inner-card-4"]');
    await page.click('label[for="inner-card-5"]');
    await page.click('label[for="inner-card-6"]');
    await page.click('label[for="inner-card-7"]');
    await page.click('label[for="inner-card-8"]');
    await page.click('label[for="inner-card-9"]');
    await page.click('label[for="inner-card-10"]');
    await page.click('label[for="inner-card-11"]');
    await delay(500);
    await page.click('button[class="ActionButton-module_button__IlhXt ActionButton-module_xSmall__WP4hl ActionButton-module_filled__zUShw"]');
    await delay(3333);

    await page.click('label[for="inner-card-8"]');
    await page.click('label[for="inner-card-9"]');
    await page.click('label[for="inner-card-10"]');
    await page.click('label[for="inner-card-11"]');
    await page.click('label[for="inner-card-12"]');
    await page.click('label[for="inner-card-13"]');
    await page.click('label[for="inner-card-14"]');
    await page.click('label[for="inner-card-15"]');
    await delay(500);
    await page.click('button[class="ActionButton-module_button__IlhXt ActionButton-module_xSmall__WP4hl ActionButton-module_filled__zUShw"]');
    await delay(10000);

    // Extracting the group of words (BARB, SPINE, SPUR, THORN) from the section element
    const answerGroupes = await page.evaluate(() => {
      const answerGroupes = [];
    
      // Loop through each data-level (0, 1, 2, 3) and get the aria-label for each section
      for (let level = 0; level <= 3; level++) {
        const section = document.querySelector(`section[data-level="${level}"]`);
        if (section) {
          const ariaLabel = section.getAttribute('aria-label');
    
          // Extract the part between 'group' and the period (.)
          const groupNameMatch = ariaLabel.match(/group\s([^\.]+)/);
          const groupName = groupNameMatch ? groupNameMatch[1].trim() : null;
    
          // Extract words after the period and split by commas
          const words = ariaLabel.split('.')[1]?.split(',').map(word => word.trim()) || [];
    
          // Add the processed result to the answerGroupes array
          answerGroupes.push({ groupName, words });
        }
      }
    
      return answerGroupes; // Return all the extracted groups and words
    });
    

    console.log('Extracted answer group:', answerGroupes);

    return {cards: cardTexts, answers: answerGroupes};
  } catch (error) {
    console.error('Error occurred:', error.message);
    return `Failed to fetch card texts: ${error.message}`;
  } finally {
    await browser.close();
  }
}

// Example usage
(async () => {
  const url = 'https://www.nytimes.com/games/connections';
  const firstButtonSelector = '.purr-blocker-card__button';
  const secondButtonSelector = '[data-testid="moment-btn-play"]';
  const startId = 0; // Starting ID (inner-card-0)
  const endId = 15; // Ending ID (inner-card-15)

  const result = await fetchCardTexts(
    url,
    firstButtonSelector,
    secondButtonSelector,
    startId,
    endId
  );
  console.log('Final Result:', result);
  let i = 0
  console.log(result.answers[i].words);
  i++
  console.log(result.answers[i].words);
  i++
  console.log(result.answers[i].words);
  i++
  console.log(result.answers[i].words);
  i++
})();
