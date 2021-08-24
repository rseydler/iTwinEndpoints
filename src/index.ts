import express from "express";

const app = express();
app.use(express.text({ type: "application/json" }));

app.post("/events", () => {
  // Handle the event
  //console.log(`You hit the events endpoint`);
});

app.get("/fred", (req,res) => {
  res.status(400);
  res.send("You hit the fred endpoint");
  res.json({test:"You reached Test"});
  console.log("You hit the fred endpoint");
});


app.post("/test", (req,res) => {
  res.setHeader("Content-Type", "application/json");
  res.status(200);
  res.json({test:"You reached Test"});
  console.log(`You hit the test endpoint`);
});

const port = 5000;
app.listen(port, () => {
  console.log("Application was started.");
});

import crypto from "crypto";

function validateSignature(payload: string, signatureHeader: string): boolean {
    // Replace with your own webhook secret later
    const secret = "416a84c112704a1073d327919940fa2bfb75c165c8fb8cd17c039e4b031676a5"; //"4eb25d308ef2a9722ffbd7a2b7e5026f9d1f2feaca5999611d4ef8692b1ad70d";
  
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
          console.log(`New named version (ID: ${content.versionId}, Name: ${content.versionName}) was created for iModel (ID: ${content.imodelId})`);
          break;
        }
        case "iModelDeletedEvent": {
            const content = event.content as NamedVersionCreatedEvent;
            console.log(`iModel Deleted (ID: ${content.imodelId})`);
            break;
        }
        case "ChangeSetPushedEvent": {
          const content = event.content as NamedVersionCreatedEvent;
          console.log(`New change set was pushed for iModel (ID: ${content.imodelId})`);
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
        "secret": "416a84c112704a1073d327919940fa2bfb75c165c8fb8cd17c039e4b031676a5"
    }
}

{
    "webhook": {
        "secret": "0835f3e6ca1e0246b12dc9b75975c98e4ed8661d040441029a24aa339a47dd6e"
    }
}
*/