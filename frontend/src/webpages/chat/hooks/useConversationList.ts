import { axiosClient } from "../../../lib/axios";
import { useQuery } from "@tanstack/react-query";
import { TConversation } from "../types";
import { useAuthContext } from "../../auth/AuthContext";

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

const useConversationList = () => {
  const { authUser } = useAuthContext();
  return useQuery({
    queryKey: ["conversations", authUser.id],
    queryFn: () => getConversationList(authUser.id),
    staleTime: 0,
  });
};

export default useConversationList;
