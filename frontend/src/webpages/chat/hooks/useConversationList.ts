import { axiosClient } from "../../../lib/axios";
import { useQuery } from "@tanstack/react-query";
import { TConversation } from "../types";

type TGetAllConversationResponse = {
  message: string;
  metadata: TConversation[];
};

export const getConversationList = async (userId: string) => {
  const { data } = await axiosClient.post<TGetAllConversationResponse>(
    `/allConversation/${userId}`
  );
  const { metadata: converationList } = data;
  return converationList;
};

const useConversationList = (userId: string) => {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: () => getConversationList(userId),
  });
};

export default useConversationList;
