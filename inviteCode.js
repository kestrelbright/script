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

const method = "GET";
const headers = {
        "Accept": "*/*",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "zh-cn",
        "Connection": "keep-alive",
        "Host": "api.turinglabs.net",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.66 Safari/537.36"
      };
const data = {"info": "abc"};


const ddFactoryRequest = {
    url: ddFactoryUrl,
    method: method, // Optional, default GET.
    headers: headers, // Optional.
    body: JSON.stringify(data) // Optional.
};
const jxFactoryRequest = {
    url: jxFactoryUrl,
    method: method, // Optional, default GET.
    headers: headers, // Optional.
    body: JSON.stringify(data) // Optional.
};
const farmRequest = {
    url: farmUrl,
    method: method, // Optional, default GET.
    headers: headers, // Optional.
    body: JSON.stringify(data) // Optional.
};
const petRequest = {
    url: petUrl,
    method: method, // Optional, default GET.
    headers: headers, // Optional.
    body: JSON.stringify(data) // Optional.
};
const beanRequest = {
    url: beanUrl,
    method: method, // Optional, default GET.
    headers: headers, // Optional.
    body: JSON.stringify(data) // Optional.
};

$task.fetch(ddFactoryRequest).then(response => {
    // response.statusCode, response.headers, response.body
    console.log(response.body);
    $notify("Title", "Subtitle", response.body); // Success!
}, reason => {
    // reason.error
    $notify("Title", "Subtitle", reason.error); // Error!
});

$task.fetch(jxFactoryRequest).then(response => {
    // response.statusCode, response.headers, response.body
    console.log(response.body);
    $notify("Title", "Subtitle", response.body); // Success!
}, reason => {
    // reason.error
    $notify("Title", "Subtitle", reason.error); // Error!
});

$task.fetch(farmRequest).then(response => {
    // response.statusCode, response.headers, response.body
    console.log(response.body);
    $notify("Title", "Subtitle", response.body); // Success!
}, reason => {
    // reason.error
    $notify("Title", "Subtitle", reason.error); // Error!
});

$task.fetch(petRequest).then(response => {
    // response.statusCode, response.headers, response.body
    console.log(response.body);
    $notify("Title", "Subtitle", response.body); // Success!
}, reason => {
    // reason.error
    $notify("Title", "Subtitle", reason.error); // Error!
});

$task.fetch(beanRequest).then(response => {
    // response.statusCode, response.headers, response.body
    console.log(response.body);
    $notify("Title", "Subtitle", response.body); // Success!
}, reason => {
    // reason.error
    $notify("Title", "Subtitle", reason.error); // Error!
});

$done();
