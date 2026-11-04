import { API_URL } from '../config';

export type User = { id: string; username: string };
export type Tokens = { accessToken: string; refreshToken: string };

const messages: Record<string, string> = {
  invalid_credentials: 'Wrong username or password',
  user_already_exists: 'This username, email or phone is already used',
  invalid_input: 'Please check the details you entered',
  account_not_active: 'This account is not active',
};

async function post<T>(path: string, body: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(API_URL + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error('Cannot reach the server. Is the API running?');
  }
  const data: any = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(messages[data.error] || data.error || 'Something went wrong');
  }
  return data as T;
}

export const apiRegister = (b: {
  username: string; email?: string; phone?: string; password: string;
}) => post<User>('/auth/register', b);

export const apiLogin = (identifier: string, password: string) =>
  post<Tokens & { user: User }>('/auth/login', { identifier, password });

export const apiRefresh = (refreshToken: string) =>
  post<Tokens>('/auth/refresh', { refreshToken });

export const apiLogout = (refreshToken: string) =>
  post<{ success: boolean }>('/auth/logout', { refreshToken });

export type LiveKitTokenResponse = {
  serverUrl: string;
  token: string;
  roomName: string;
};

export const apiGetLiveKitToken = (
  accessToken: string,
  roomName: string,
) => postAuthenticated<LiveKitTokenResponse>(
  '/livekit/token',
  accessToken,
  { roomName },
);

async function postAuthenticated<T>(
  path: string,
  accessToken: string,
  body: unknown,
): Promise<T> {
  let res: Response;

  try {
    res = await fetch(API_URL + path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error('Cannot reach the server. Is the API running?');
  }

  const data: any = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      messages[data.error] || data.error || 'Something went wrong',
    );
  }

  return data as T;
}
