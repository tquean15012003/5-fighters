import { IConversation, IMessage } from "../core/entity";

class Database {
  private static instance: Database;
  private conversations: IConversation[] = [];

  private constructor() {}

  static getInstance = () => {
    if (!Database.instance) {
      Database.instance = new Database();
      console.log("Successfull create a new database");
    }
    return Database.instance;
  };

  public saveConversation(conversation: IConversation): IConversation {
    this.conversations.push(conversation);
    return conversation;
  }

  public getConversations(): IConversation[] {
    return this.conversations;
  }

  public getConversationById(id: string): IConversation | undefined {
    return this.conversations.find((convo) => convo.id === id);
  }

  public saveMessage(
    conversationId: string,
    messsage: IMessage
  ): IMessage | undefined {
    const conversation = this.getConversationById(conversationId);
    conversation?.messages.push(messsage);
    return messsage;
  }
}

const instanceMongodb = Database.getInstance;
const chatModel = Database.getInstance();

export { chatModel, instanceMongodb };
