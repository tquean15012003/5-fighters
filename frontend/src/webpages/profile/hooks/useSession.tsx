import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosClient } from "../../../lib/axios";
import { PROFILES } from "../ProfilePage";
import { AxiosError } from "axios";
import { DefaultMutationOptions } from "../../../lib/react-query";

type TCreateConversationResponse = {
  message: string;
  metadata: {
    id: string;
  };
};
const useSession = (options: DefaultMutationOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["createConversation"],
    mutationFn: async (id: string) => {
      try {
        const { data } = await axiosClient.post<TCreateConversationResponse>(
          `/createConversation`,
          {
            chatMembers: [id, PROFILES[PROFILES.length - 1].id],
          }
        );
        const { metadata } = data;
        const conversationId = metadata.id;
        queryClient.setQueryData(["conversation", conversationId], () => []);
        return conversationId;
      } catch (error) {
        console.error(`Unknown Error: ${error}`);
        throw new AxiosError("Failed to create the conversation", "500");
      }
    },
    ...options,
  });
};

export default useSession;
