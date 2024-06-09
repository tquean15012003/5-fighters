/// <reference types="react-scripts" />

declare namespace NodeJS {
  interface ProcessEnv {
    readonly PUBLIC_URL: string;
    readonly REACT_APP_BASE_API_URL: string;
  }
}
