import axios, { AxiosError } from 'axios';
import { parseCookies, setCookie } from 'nookies'
import { signOut } from '../contexts/AuthContext';
import { AuthTokenError } from './errors/AuthTokenError';


let isRefresing = false;
let failedRequestsQueue = [];

export const api = axios.create({
  baseURL: 'http://localhost:3000/api'
})



export function setupAPIClient(ctx = undefined) {
  let cookies = parseCookies(ctx)

  const apiAuth = axios.create({
    baseURL: 'http://localhost:3333',
    headers: {
      Authorization: `Bearer ${cookies['dashgo.token']}`
    }
  })

  apiAuth.interceptors.response.use(response => {
    return response;
  }, (error: AxiosError) => {
    if (error.response.status === 401) {
      if (error.response?.data?.code === 'token.expired') {
        cookies = parseCookies(ctx)

        const { 'dashgo.refreshToken': refreshToken } = cookies;
        const originalConfig = error.config

        if (!isRefresing) {
          isRefresing = true;

          apiAuth.post('/refresh', { refreshToken }).then(response => {
            const { token } = response.data;

            setCookie(ctx, 'dashgo.token', token, {
              maxAge: 60 * 60 * 24 * 30, //30 dias
              path: '/'
            })
            setCookie(ctx, 'dashgo.refreshToken', response.data.refreshToken, {
              maxAge: 60 * 60 * 24 * 30, //30 dias
              path: '/'
            })

            apiAuth.defaults.headers['Authorization'] = `Bearer ${token}`

            failedRequestsQueue.forEach(request => request.onSuccess(token))
            failedRequestsQueue = [];
          }).catch(err => {
            failedRequestsQueue.forEach(request => request.onFailure(err))
            failedRequestsQueue = [];

            if (process.browser) {
              signOut()
            }
          }).finally(() => {
            isRefresing = false;
          })
        }

        return new Promise((resolve, reject) => {
          failedRequestsQueue.push({
            onSuccess: (token: string) => {
              originalConfig.headers['Authorization'] = `Bearer ${token}`

              resolve(apiAuth(originalConfig))
            },
            onFailure: (err: AxiosError) => {
              reject(err)
            }
          })
        })

      } else {
        if (process.browser) {
          signOut()
        } else {
          return Promise.reject(new AuthTokenError())
        }
      }
    }

    return Promise.reject(error);
  })

  return apiAuth
}