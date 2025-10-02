export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const emitHttp = (method: string, path: string) =>
  fetch(API_URL + path, {
    method
  });

export const emitHttpRaw = (method: string, path: string, body: any = undefined) =>
  fetch(API_URL + path, {
    method,
    headers: { "Content-Type": "application/json" },
    body,
  });

export const emitHttpJson = (method: string, path: string, body: any = undefined) =>
  fetch(API_URL + path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body && JSON.stringify(body),
  });

export const emitHttpForm = (method: string, path: string, body: any = undefined) => {
  const formData = new FormData();
  body && Object.keys(body).map((key) => {
    formData.append(key, body[key]);
  });
  return fetch(API_URL + path, {
    method,
    body: formData,
  });
};
