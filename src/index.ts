import express from "express";

const app = express();
app.use(express.text({ type: "application/json" }));

//app.post("/events", () => {
  // Handle the event
  //console.log(`You hit the events endpoint`);
//});

app.post("/test", (req,res) => {
  res.setHeader("Content-Type", "application/json");
  res.status(200);
  res.json({test:"You reached Test"});
  console.log(`You hit the test endpoint`);
});

app.get("/fred", (req,res) => {
  res.status(400);
  res.json({test:"You reached Test"});
  //res.send("You hit the fred endpoint");
  console.log("You hit the fred endpoint");
});


const port = 5000;
app.listen(process.env.PORT || port, () => {
  console.log(`Application was started and listening on port ${process.env.PORT || port}`);
});

import crypto from "crypto";

function validateSignature(payload: string, signatureHeader: string): boolean {
    // Replace with your own webhook secret later
    const secret = "c7f4a7489f62ed5d70191ae2b1afbc9fcb3079f447f86949e8a2d4ff49569583"; //"4eb25d308ef2a9722ffbd7a2b7e5026f9d1f2feaca5999611d4ef8692b1ad70d";
  
    const [algorithm, signature] = signatureHeader.split("=");
    const generated_sig = crypto.createHmac(algorithm, secret).update(payload, "utf-8").digest("hex");
  
    return generated_sig.toLowerCase() === signature.toLowerCase();
  }

  import { Event, NamedVersionCreatedEvent } from "./models";

  app.post("/events", (req, res) => {
    const signatureHeader = req.headers["signature"] as string;
    if (!signatureHeader || !req.body) res.sendStatus(401);
  
    if (!validateSignature(req.body, signatureHeader)) {
      res.sendStatus(401);
    } else {
      const event = JSON.parse(req.body) as Event;
      switch (event.contentType) {
        case "NamedVersionCreatedEvent": {
          const content = event.content as NamedVersionCreatedEvent;
          console.log(`New named version (ID: ${content.versionId}, Name: ${content.versionName}) was created for iModel (ID: ${content.imodelId}) ${req.body} `);
          res.send(200);
          break;
        }
        case "iModelDeletedEvent": {
            const content = event.content as NamedVersionCreatedEvent;
            console.log(`iModel Deleted ${req.body} (ID: ${content.imodelId})`);
            res.send(200);
            break;
        }
        case "ChangeSetPushedEvent": {
          const content = event.content as NamedVersionCreatedEvent;
          console.log(`New change set was pushed for ${req.body} iModel (ID: ${content.imodelId})`);
          res.send(200);
          break;
        }
        default:
          res.sendStatus(400); //Unexpected event type
      }
    }
  });


  /*
{
    "webhook": {
        "secret": "c7f4a7489f62ed5d70191ae2b1afbc9fcb3079f447f86949e8a2d4ff49569583"
    }
}
*/