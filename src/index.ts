import express from "express";

const app = express();
app.use(express.text({ type: "application/json" }));

app.post("/events", () => {
  // Handle the event
});

const port = 5000;
app.listen(port, () => {
  console.log("Application was started.");
});

import crypto from "crypto";

function validateSignature(payload: string, signatureHeader: string): boolean {
    // Replace with your own webhook secret later
    const secret = "4eb25d308ef2a9722ffbd7a2b7e5026f9d1f2feaca5999611d4ef8692b1ad70d";
  
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
        default:
          res.sendStatus(400); //Unexpected event type
      }
    }
  });
