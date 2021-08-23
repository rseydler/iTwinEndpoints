export type Event = {
    content: IModelEvent | NamedVersionCreatedEvent;
    contentType: string;
    enqueuedDateTime: string;
    messageId: string;
    subscriptionId: string;
  };
  
  export type IModelEvent = {
    imodelId: string;
    projectId: string;
  };
  
  export type NamedVersionCreatedEvent = {
    changesetId: string;
    changesetIndex: string;
    versionId: string;
    versionName: string;
  } & IModelEvent;
  