import axios from "axios";
import { CLICKUP_API_KEY } from "../config";

const clickUp = axios.create({
    baseURL: "https://api.clickup.com/api/v2",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });
  
  clickUp.interceptors.request.use(
    (config) => {
      config.headers.Authorization = CLICKUP_API_KEY;
      return config;
    },
    (error) => Promise.reject(error)
  );