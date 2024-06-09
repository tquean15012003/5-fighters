import { axiosClient } from "../../../lib/axios";
import { useQuery } from "@tanstack/react-query";

import { IConversationMessage, TResponseMessageMetaData } from "../types";
import { useAuthContext } from "../../auth/AuthContext";

type TResponseGetConversationContent = {
  message: string;
  metadata: TResponseMessageMetaData[];
};

const transformData = (
  data: TResponseMessageMetaData[],
  currentUserId: string
) => {
  const transformed: IConversationMessage[] = [];
  data.forEach((message) => {
    transformed.push({
      role: message.senderId === currentUserId ? "user" : "assistant",
      content: message.message,
    });
  });
  return transformed;
};

const useConversation = (id?: string) => {
  const { authUser } = useAuthContext();
  return useQuery({
    queryKey: ["conversation", id],
    queryFn: async () => {
      const { data } = await axiosClient.post<TResponseGetConversationContent>(
        `/getConversationContent/${id}`
      );
      const { metadata } = data;

      return transformData(metadata, authUser.id);
    },
    enabled: !!id,
    staleTime: Infinity,
  });
};

export default useConversation;
