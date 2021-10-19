# iTwinEndpoints
This tool is designed to handle incoming requests.
It originated as a webhook API for iModel events.
It then took on an additional roll for PowerBI to get some of those hard to reach items :)

To use as is.
You need to use a service app (or create a new one at https://developer.bentley.com/my-apps/).
Give it access to at least these scopes - imodels:read projects:read connections:modify synchronization:read itwinjs 
or alernatively update the scopes in the logInToBentleyAPI function
Input the client_id and client_secret into the blank spaces in the logInToBentleyAPI function.

Add the client_id email to the project and give it appropriate project permissions.

The console.log will show in Heroku using the theory from https://devcenter.heroku.com/articles/logging
when debugging or running remotely you can watch it using heroku logs --tail

