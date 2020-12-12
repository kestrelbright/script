/**
 * @fileoverview Example to compose HTTP request
 * and handle the response.
 *
 */

const ddFactoryUrl = "http://api.turinglabs.net/api/v1/jd/ddfactory/create/P04z54XCjVWnYaS5n1NUCW4iCId-gI";

const jxFactoryUrl = "http://api.turinglabs.net/api/v1/jd/jxfactory/create/SSyMdnbbb1AktdXFepABRw==";

const farmUrl = "http://api.turinglabs.net/api/v1/jd/farm/create/01a307cbfdb14317a44c4711dc273cac/";

const petUrl = "http://api.turinglabs.net/api/v1/jd/pet/create/MTE1NDAxNzYwMDAwMDAwMzkzODEyODM%3D/";

const beanUrl = "http://api.turinglabs.net/api/v1/jd/bean/create/b5ag64gok3rggz25h54ku3hjqi/";

$task.fetch(await jdBeanHome).then(response => {
    // response.statusCode, response.headers, response.body
    console.log(response.body);
    $notify("Title", "Subtitle", response.body); // Success!
    $done();
}, reason => {
    // reason.error
    $notify("Title", "Subtitle", reason.error); // Error!
    $done();
});

async function jdBeanHome() {
  await ddFactoryRequest()
  await jxFactoryRequest()
  await farmRequest();
  await petRequest();
  await beanRequest();
}

function ddFactoryRequest() {
  return new Promise(resolve => {
    $.get({url: ddFactoryUrl,headers:{
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1 Edg/87.0.4280.88"
      }}, async (err, resp, data) => {
      try {
        if (err) {
        } else {
          console.log(data)
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}

function jxFactoryRequest() {
  return new Promise(resolve => {
    $.get({url: jxFactoryUrl,headers:{
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1 Edg/87.0.4280.88"
      }}, async (err, resp, data) => {
      try {
        if (err) {
        } else {
          console.log(data)
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}

function farmRequest() {
  return new Promise(resolve => {
    $.get({url: farmUrl,headers:{
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1 Edg/87.0.4280.88"
      }}, async (err, resp, data) => {
      try {
        if (err) {
        } else {
          console.log(data)
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}

function petRequest() {
  return new Promise(resolve => {
    $.get({url: petUrl,headers:{
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1 Edg/87.0.4280.88"
      }}, async (err, resp, data) => {
      try {
        if (err) {
        } else {
          console.log(data)
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}

function beanRequest() {
  return new Promise(resolve => {
    $.get({url: beanUrl,headers:{
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1 Edg/87.0.4280.88"
      }}, async (err, resp, data) => {
      try {
        if (err) {
        } else {
          console.log(data)
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}
