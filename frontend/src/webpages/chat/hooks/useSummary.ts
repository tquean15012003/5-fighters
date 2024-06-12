import { useQuery, useQueryClient } from "@tanstack/react-query";
import { TSummaryResponse } from "../types";

const useConversation = (id?: string) => {
  const queryClient = useQueryClient();

  const resetSummary = () => {
    queryClient.setQueryData<TSummaryResponse>(["summary", id], () => {
      return {
        summary: "",
        tasks: [],
      };
    });
  };
  return {
    resetSummary,
    summaryQuery: useQuery({
      queryKey: ["summary", id],
      queryFn: async () => {
        const summary = "";
        const tasks: string[] = [];
        return { summary, tasks };
      },
      enabled: !!id,
      staleTime: Infinity,
    }),
  };
};

export default useConversation;
