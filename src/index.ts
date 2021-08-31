import express from "express";

const app = express();
app.use(express.text({ type: "application/json" }));

const fetch = require('node-fetch')

app.get("/test2", (req,res) => {
  res.status(200);
  res.json({test:"You reached fred"});
  console.log("You hit the fred endpoint");
});

app.get("/test", (req,res) => {
  console.log("Hit Test");
  res.setHeader("Content-Type", "application/json");
  res.status(200);
  console.log("Asking for test data");

  const sampleTest = {test:"You reached fred"};// test();
  //res.json({test:"You reached Test"});
  console.log(sampleTest);
  res.json(sampleTest);
  console.log(`You hit the test endpoint`);
});

app.get("/fred", (req,res) => {
  res.status(200);
  res.json({test:"You reached fred"});
  console.log("You hit the fred endpoint");
});

app.get("/freddy", (req,res) => {
  res.status(200);
  res.json({test:"You reached fred"});
  console.log("You hit the fred endpoint");
});

app.get("/try", (req,res) => {
  console.log("Hit Test");
  res.setHeader("Content-Type", "application/json");
  res.status(200);
  console.log("Asking for token");

  const sampleToken = (async () => {await logInToBentleyAPI();})();
  //res.json({test:"You reached Test"});
  res.json(sampleToken);
  console.log(`You hit the test endpoint`);
});


const port = 5000;
app.listen(process.env.PORT || port, () => {
  console.log(`Application was started and listening on port ${process.env.PORT || port}`);
});

import crypto from "crypto";

function validateSignature(payload: string, signatureHeader: string): boolean {
    // Replace with your own webhook secret later
    const secret = "637d07728dc5bed7a71ef407810c963ff7584be104cd26b7e3cfb428d1aef6ec";
  
    const [algorithm, signature] = signatureHeader.split("=");
    const generated_sig = crypto.createHmac(algorithm, secret).update(payload, "utf-8").digest("hex");
  
    return generated_sig.toLowerCase() === signature.toLowerCase();
  }

import { Event, NamedVersionCreatedEvent } from "./models";

app.post("/events", (req, res) => {
  const signatureHeader = req.headers["signature"] as string;
  if (!signatureHeader || !req.body){
    res.sendStatus(401);
    return;
  }; //someone poking the URL maybe?

  const event = JSON.parse(req.body) as Event;
  switch (event.contentType) {
    case "NamedVersionCreatedEvent": {
      const content = event.content as NamedVersionCreatedEvent;
      console.log(`New named version (ID: ${content.versionId}, Name: ${content.versionName}) was created for iModel (ID: ${content.imodelId}) ${req.body} `);
      res.sendStatus(200);
      break;
    }
    case "iModelDeletedEvent": {
        const content = event.content as NamedVersionCreatedEvent;
        console.log(`iModel Deleted ${req.body} (ID: ${content.imodelId})`);
        res.sendStatus(200);
        break;
    }
    case "ChangeSetPushedEvent": {
      const content = event.content as NamedVersionCreatedEvent;
      console.log(`New change set was pushed for ${req.body} iModel (ID: ${content.imodelId})`);
      res.sendStatus(200);
      break;
    }
    default:
      res.sendStatus(400); //Unexpected event type
  }
});

function test() {
  return ({test:"You reached Test"});
}

async function logInToBentleyAPI(){
  console.log("Attempting a service login");
  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');
  params.append('client_id', 'service-iGaiS0dGxpPR93DXby1dT4PhO');
  params.append('client_secret', 'zn/ZXz7OpGA53Y+UxYMxAtoXmxybW5VFo/JGsswxliVlYBm4zgMgi6necOB5c/zxTOcY7zk7o+poFn05PZPAjw==');
  params.append('scope', 'imodels:read projects:read connections:modify');

  const loginResponse = await fetch("https://ims.bentley.com/connect/token", {
   // mode: 'no-cors',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
     // 'Access-Control-Allow-Origin' : 'http://localhost:3000',
    },
      body: params
   // body: 'grant_type=client_credentials&client_id=service-uFqb5RX7yFhJFXAlp6bUI3A82&client_secret=zn/ZXz7OpGA53Y+UxYMxAtoXmxybW5VFo/JGsswxliVlYBm4zgMgi6necOB5c/zxTOcY7zk7o+poFn05PZPAjw==&scope=imodels:read',
  });
  const loginData = await loginResponse;
  console.log("headers",loginData.headers);
  console.log("body",loginData.body);
  console.log("url",loginData.url);
  console.log("status",loginData.status);
  console.log("logindata",loginData);
  const json = await loginData.json();
  console.log("json",json);
  console.log("access_token", json.access_token);
  console.log("access_token_type",json.token_type);
  console.log("expires_in", json.expires_in);
  return json.token_type + " " + json.access_token;
}

  /*
{
    "webhook": {
        "secret": "c7f4a7489f62ed5d70191ae2b1afbc9fcb3079f447f86949e8a2d4ff49569583"
    }
}

{
    "imodelId": "773fd702-c1bc-4453-b6f9-02c0efd26d8f",
    "eventTypes": [
        "iModelDeletedEvent",
"NamedVersionCreatedEvent",
"ChangeSetPushedEvent"
    ],
    "callbackUrl": "https://imodelwebhooksample.herokuapp.com/events",
}

New change set was pushed for 
{"content":
  {"briefcaseId":"2",
  "changesetId":"4e65fa6dbd182527f358c509ede3dad3948004a0",
  "changesetIndex":"15",
  "imodelId":"773fd702-c1bc-4453-b6f9-02c0efd26d8f",
  "projectId":"2ad52e0d-3ce7-4177-ae71-a2bea7da31df"}
,"contentType":"ChangeSetPushedEvent",
"enqueuedDateTime":"Fri, 27 Aug 2021 02:23:49 GMT",
"messageId":"43d0fd2e53944fde9cfe190abc50a41e",
"subscriptionId":"4f49f011-33f3-46d4-b5ca-7f84bd0a31e0"}
 iModel (ID: 773fd702-c1bc-4453-b6f9-02c0efd26d8f)


//client secret for app 

service-uFqb5RX7yFhJFXAlp6bUI3A82
0nkAGHJ1jiAfbkCUvyrdewN1PkPaLcNDsODltDtVC5DvtUbuGHyqkk2aRIZsnLZMKNjm2yG/TT5Fa3V0CNuDIw==
service-uFqb5RX7yFhJFXAlp6bUI3A82@apps.imsoidc.bentley.com


*/