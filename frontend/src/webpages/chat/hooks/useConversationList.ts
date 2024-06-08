import { axiosClient } from "../../../lib/axios";
import { useQuery } from "@tanstack/react-query";
import { TConversation } from "../types";

const CONVERSATION_LIST: TConversation[] = [
  {
    conversationId: "1",
    conversationTitle: "Linear Algebra",
  },
];

export const getConversationList = async () => {
//   const { data } = await axiosClient.get<TConversation[]>("/conversations");
  return CONVERSATION_LIST;
  //   return data;
};

const useConversationList = () => {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: () => getConversationList(),
  });
};

export default useConversationList;
