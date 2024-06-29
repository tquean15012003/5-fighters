import { useMutation } from "@tanstack/react-query";
import { axiosClient } from "../../../lib/axios";
import { DefaultMutationOptions } from "../../../lib/react-query";

const useSummary = (id?: string, options: DefaultMutationOptions = {}) => {
  return useMutation({
    mutationKey: ["summary", id],
    mutationFn: async () => {
      const { data } = await axiosClient.post(`/summaryChat/${id}`);
      const { metadata } = data;
      const { summary, tasks } = metadata;

      return { summary, tasks };
    },
    ...options,
  });
};

export default useSummary;
