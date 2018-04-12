const puppeteer = require('puppeteer');
const credentials = require('./credentials.json')
const uuidv4 = require('uuid/v4');
const preparePage = require('./prepare-page');

// const runnerConfig = {
//   id: uuidv4(),
//   youtubeLink: "https://www.youtube.com/watch?pbjreload=10&v=yvniseFJbdc&app=desktop",
//   actions: ['like','comment','subscribe','notifications'],
//   comment: "wow this is awesome!"
// };

const runnerConfig = {
  id: uuidv4(),
  youtubeLink: "https://youtu.be/JaPP0j09eII  ",
  actions: ['subscribe'],
  comment: "wow this is awesome!"
};


const run = async (config) => {
  console.log(`Running ${config.id}`)

  const browser = await puppeteer.launch({args: [
      '--no-sandbox',
    ],
    headless: true
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768 })
  await preparePage(page);

  // Login to Google
  await page.goto('https://accounts.google.com/signin/v2/identifier?hl=EN&flowName=GlifWebSignIn&flowEntry=ServiceLogin');
  await page.waitForSelector('#identifierId')
  await page.type('#identifierId', credentials.username, { delay: 5 })
  await page.click('#identifierNext')
  await page.waitForSelector('#password input[type="password"]', { visible: true });
  await page.type('#password input[type="password"]', credentials.password, { delay: 5 })
  await page.waitFor(1000)
  await page.click('#passwordNext')
  await page.waitFor(3000)

  // Go to youtube video/channel link
  await page.goto(config.youtubeLink);
  await page.waitFor(3000)

  if (config.actions.includes('subscribe'))
  {
    const SUBSCRIBE_BUTTON_UNSUBSCRIBED_SELECTOR = 'paper-button.ytd-subscribe-button-renderer[aria-label="Subscribe to this channel."]';
    const NOTIFICATINS_BUTTON_DISABLED_SELECTOR = 'yt-icon-button.style-scope.ytd-toggle-button-renderer.style-grey-text[aria-pressed="false"]'

    // Subscribe to channel if not subscribed
    if (await page.$(SUBSCRIBE_BUTTON_UNSUBSCRIBED_SELECTOR) !== null) {
      await page.click(SUBSCRIBE_BUTTON_UNSUBSCRIBED_SELECTOR)
      console.log("SUBSCRIBED");
      if (config.actions.includes('notifications')) {
        // Enable notifications if not enabled
        if (await page.$(NOTIFICATINS_BUTTON_DISABLED_SELECTOR) !== null) {
          await page.click(NOTIFICATINS_BUTTON_DISABLED_SELECTOR)
          console.log("NOTIFICATIONS ENABLED");
        }
        else {
          console.log("NOTIFICATIONS ALREADY ENABLED");
        }
      }
    }
    else {
      console.log('ALREADY SUBSCRIBED');
      // Enable notifications if not enabled
      if (await page.$(NOTIFICATINS_BUTTON_DISABLED_SELECTOR) !== null) {
        await page.click(NOTIFICATINS_BUTTON_DISABLED_SELECTOR)
        console.log("NOTIFICATIONS ENABLED");
      }
      else {
        console.log('NOTIFICATIONS ALREADY ENABLED')
      }
    }
  }

  if (config.actions.includes('like'))
  {
    const LIKE_BUTTON_ENABLED_SELECTOR = 'ytd-toggle-button-renderer.style-default-active yt-icon.ytd-toggle-button-renderer'
    const LIKE_BUTTON_DISABLED_SELECTOR = 'yt-icon.ytd-toggle-button-renderer'
    // Like video if not liked
    if (await page.$(LIKE_BUTTON_ENABLED_SELECTOR) === null) {
      await page.click(LIKE_BUTTON_DISABLED_SELECTOR)
      console.log("VIDEO LIKED");
    }
    else console.log('VIDEO ALREADY LIKED');
  }

  if (config.actions.includes('comment'))
  {
    // Form buttons (and textarea) only appears after clicking on the container
    const COMMENT_TEXAREA_INACTIVE_CONTAINER_SELECTOR = '#placeholder-area'
    const COMMENT_TEXTAREA_SELECTOR = 'textarea#textarea.style-scope.iron-autogrow-textarea'
    const COMMENT_BUTTON_SELECTOR =' paper-button#button[aria-label="Comment"]'

    // Scroll down to activate loading of comment box
    await page.evaluate(async () => {
      await new Promise((resolve, reject) => {
        try {
          const maxScroll = Number.MAX_SAFE_INTEGER;
          let lastScroll = 0;
          const interval = setInterval(() => {
            window.scrollBy(0, 100);
            const scrollTop = document.documentElement.scrollTop;
            if (scrollTop === maxScroll || scrollTop === lastScroll) {
              clearInterval(interval);
              resolve();
            } else {
              lastScroll = scrollTop;
            }
          }, 100);
        } catch (err) {
          console.log(err);
          reject(err.toString());
        }
      });
    });

    // Comment once ready
    await page.waitForSelector(COMMENT_TEXAREA_INACTIVE_CONTAINER_SELECTOR,  { visible: true })
    await page.click(COMMENT_TEXAREA_INACTIVE_CONTAINER_SELECTOR)
    await page.type(COMMENT_TEXTAREA_SELECTOR, config.comment, {delay: 5})
    await page.waitFor(1500)
    await page.click(COMMENT_BUTTON_SELECTOR)
    console.log("COMMENTED: "  + config.comment);
  }

  // Take screenshot after everything is done
  await page.waitFor(2000)
  await page.screenshot({path: `./screenshots/output_${config.id}.png`});

  await browser.close();
};


run(runnerConfig);