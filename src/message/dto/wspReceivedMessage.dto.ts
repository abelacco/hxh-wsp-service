export interface WspReceivedMessageDto {
  entry: Array<{
    changes: Array<{
      value: {
        contacts: Array<IContact>;
        messages: Array<IMessage>;
      };
    }>;
  }>;
}

interface IContact {
  profile: {
    name: string;
  };
  wa_id: string;
}

interface IMessage {
  from: string;
  id: string;
  timestamp: string;
  type: string;
  text?: {
    body: string;
  };
  image?: IImageObject;
  interactive?: IInteractiveObject;
}

interface IImageObject {
  link?: string;
  id?: string;
  sha256?: string;
}

interface IInteractiveObject {
  type: string;
  title: string;
  id: string;
  description: string;
}
