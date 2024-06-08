import { axiosClient } from "../../../lib/axios";
import { useQuery } from "@tanstack/react-query";

import { IConversationMessage } from "../types";

const CONVERSATION: IConversationMessage[] = [
  {
    role: "user",
    content: "Hi",
  },
  {
    role: "assistant",
    content: "Hi. How can I help you?",
  },
];

const useConversation = (id?: string) => {
  return useQuery({
    queryKey: ["conversation", id],
    queryFn: async () => {
      //   const { data } = await axiosClient.get<IConversationMessage[]>(
      //     `/conversations/${id}`
      //   );

      return CONVERSATION;
    },
    enabled: !!id,
    staleTime: Infinity,
  });
};

export default useConversation;
