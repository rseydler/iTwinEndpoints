import express from "express";

const app = express();
app.use(express.text({ type: "application/json" }));

const fetch = require('node-fetch')

//#region sample endpoints using different methods
//example GET request
app.get("/test", (req,res) => {
  res.status(200);
  res.json({test:"You reached test as a GET endpoint"});
  console.log("You hit the test GET endpoint");
});

// example POST request
app.post("/test", (req,res) => {
  res.status(200);
  res.json({test:"You reached test as a POST endpoint"});
  console.log("You hit the test POST endpoint");
});

//you can infer PATCH etc from the above
//#endregion

// if you call this from PowerBI it will give you all the changesets for a model.
// call it like this:
// https://imodelwebhooksample.herokuapp.com/changesets?iModelId=5dfbcb2e-34e8-4adb-88ff-04633cff512a
app.get("/changesets", async (req,res) => {
  if (!req.query.iModelId){
    res.status(404);
    res.send(`<div><h1>You forgot to include the iModelId</h1></div>`);
    return;
  }
  var tokenHousing = await logInToBentleyAPI();
  const iModelId:string = req.query.iModelId as string;
  res.setHeader("Content-Type", "application/json");
  res.status(200);
  const changeSetsResult = await getiModelChangesets(tokenHousing,iModelId);
  res.json(changeSetsResult);
  return;
});

// https://imodelwebhooksample.herokuapp.com/namedversions?iModelId=5dfbcb2e-34e8-4adb-88ff-04633cff512a 
app.get("/namedversions", async (req,res) => {
  if (!req.query.iModelId){
    res.status(404);
    res.send(`<div><h1>You forgot to include the iModelId</h1></div>`);
    return;
  }
  var tokenHousing = await logInToBentleyAPI();
  const iModelId:string = req.query.iModelId as string;
  res.setHeader("Content-Type", "application/json");
  res.status(200);
  const namedVersionsResult = await getiModelNamedVersions(tokenHousing,iModelId);
  res.json(namedVersionsResult);
  return;
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

app.post("/events", async (req, res) => {
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
      // check the job status!
      var authToken = await logInToBentleyAPI();
      var jobStatus = await checkJobStatus(authToken, content.imodelId);
      console.log("The job status is showing as ", jobStatus);
      break;
    }
    default:
      res.sendStatus(400); //Unexpected event type
  }
});


async function logInToBentleyAPI(){
  console.log("Attempting a service login");
  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');
  params.append('client_id', '');
  params.append('client_secret', '');
  params.append('scope', 'imodels:read projects:read connections:modify synchronization:read itwinjs');

  const loginResponse = await fetch("https://ims.bentley.com/connect/token", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
      body: params
  });
  const loginData = await loginResponse;
  if (loginData.status !== 200){
    return "Failed to login";
  }
  const json = await loginData.json();
  return json.token_type + " " + json.access_token;
}


async function getiModelNamedVersions(authToken:string, iModelId:string){
  var looper=true;
  var urlToQuery : string = `https://api.bentley.com/imodels/${iModelId}/namedversions?$top=1000`;
  const namedversionData: any[] = [];
  while (looper) {
      const response = await fetch(urlToQuery, {
          mode: 'cors',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': authToken,
              'Prefer': 'return=representation',
            },
      })
      const data = await response;
      if (data.status !== 200){
        //res.json({test:"You reached fred post"});
        return "Failed to connect. Check that the service has access to the Project and iModel - service-iGaiS0dGxpPR93DXby1dT4PhO@apps.imsoidc.bentley.com";
      }
      const json = await data.json();
      json.namedVersions.forEach((namedversion: any) => {
        namedversionData.push(namedversion);
      });

      try {
          if (json._links.next.href){
              looper = true;
              urlToQuery = json._links.next.href;
          }
          else{
              looper = false;
          }
      } catch (error) {
          // better than === undefined?
          //swallow the missing link error and stop the loop
          looper = false;
      }
  }
  return namedversionData;
}

 async function getiModelChangesets(authToken:string, iModelId:string){
  var looper=true;
  var urlToQuery : string = `https://api.bentley.com/imodels/${iModelId}/changesets?$top=1000`;
  const changesetsData: any[] = [];
  while (looper) {
      const response = await fetch(urlToQuery, {
          mode: 'cors',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': authToken,
              'Prefer': 'return=representation',
            },
      })
      const data = await response;
      if (data.status !== 200){
        return "Failed to connect. Check that the service has access to the Project and iModel - service-iGaiS0dGxpPR93DXby1dT4PhO@apps.imsoidc.bentley.com";
      }
     
      const json = await data.json();
 
      json.changesets.forEach((changeset: any) => {
        changesetsData.push(changeset);
      });

      //let see if we are continuing.
      try {
          if (json._links.next.href){
              looper = true;
              urlToQuery = json._links.next.href;
              console.log("contURL", urlToQuery);
          }
          else{
              looper = false;
          }
      } catch (error) {
          // better than === undefined?
          //swallow the missing link error and stop the loop
          looper = false;
          console.log("Checking continuation resulted in catching an error");
      }
  }
  return changesetsData;
}

async function getConnectionList(authToken:string, iModelId:string){
  var urlToQuery : string = `https://api.bentley.com/synchronization/imodels/connections?imodelId=${iModelId}&$top=1000`;
  const connectionData: any[] = [];
  const response = await fetch(urlToQuery, {
      mode: 'cors',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken,
        },
  })
  
  const data = await response;
  const json = await data.json();

  json.connections.forEach((connection: any) => {
    connectionData.push(connection);
  });
  console.log("connection listing",connectionData);
  return connectionData;
}

async function isLatestConnectionRunning(authToken:string, connectionId:string){
  var looper=true;
  var urlToQuery : string = `https://api.bentley.com/synchronization/imodels/storageConnections/${connectionId}/runs`;
  const runData: any[] = [];
  while (looper) {
      const response = await fetch(urlToQuery, {
          mode: 'cors',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': authToken,
            },
      })
      const data = await response;
      const json = await data.json();

      json.runs.forEach((run: any) => {
        runData.push(run);
        console.log("runData",runData);
      });
      try {
          if (json._links.next.href){
              looper = true;
              urlToQuery = json._links.next.href;
              console.log("Got continuation - ", json._links.next.href);
              looper=false;
          }
      }
      catch (error) {
          looper = false;
      }
  }
  //find last run and check the state
  //console.log("Run Data", runData);
  if (runData.length === 0){
    return true;
  }
  if (runData[runData.length -1].state === "Completed") {
    return true;
  }
  else
  {
    return false;
  }
}

async function checkJobStatus(authToken:string, iModelId:string){
  //first get the connection list
  // https://api.bentley.com/synchronization/imodels/connections?imodelId=773fd702-c1bc-4453-b6f9-02c0efd26d8f
  const connectionData = await getConnectionList(authToken, iModelId);
  var jobsRunning = 1;
  for (var i = 0; i < connectionData.length; i++){
    const tmpJobsRunning = await isLatestConnectionRunning(authToken, connectionData[i].id);
    jobsRunning &= tmpJobsRunning as unknown as number;
  }
  if (jobsRunning === 0){
    console.log("Jobs are still running", jobsRunning );
  }
  else{
    console.log("Jobs are finished", jobsRunning );
  }
  //then iterate through each connection and check the status.
}
 