import { useMutation } from "@tanstack/react-query";
import { axiosClient } from "../../../lib/axios";
import { DefaultMutationOptions } from "../../../lib/react-query";

const useSuggestedResponse = (id?: string, options: DefaultMutationOptions = {}) => {
  return useMutation({
    mutationKey: ["summary", id],
    mutationFn: async () => {
      const { data } = await axiosClient.post(`/generateChat/${id}`);
      const { metadata } = data;
      const generatedMessage = metadata;
      return generatedMessage;
    },
    ...options,
  });
};

export default useSuggestedResponse;
