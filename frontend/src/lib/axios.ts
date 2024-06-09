import axios, { AxiosError } from "axios";

export const axiosClient = axios.create({
  baseURL: process.env.REACT_APP_BASE_API_URL,
});

axiosClient.interceptors.request.use((config) => {
  return config;
});

export const getAxiosErrorMessage = (
  error?: AxiosError<Error> | Error | unknown
) => {
  if (axios.isAxiosError(error)) {
    if (typeof error?.response?.data === "string" && !!error.response.data)
      return error?.response?.data;

    return (
      (error?.response?.data?.message as string) ||
      (error?.response?.data?.error as string) ||
      error?.response?.statusText ||
      error?.message
    );
  }

  if (error instanceof Error) {
    return error?.message;
  }
};
