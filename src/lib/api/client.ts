import axios from "axios";

export const api = axios.create({
  validateStatus: () => true,
});

export function isApiSuccess(status: number) {
  return status >= 200 && status < 300;
}
