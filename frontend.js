import React, { useState } from 'react'
import { useEffect } from 'react'

import { GoogleLogin } from 'google-auth-library'
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props'
import { TwitterLogin } from 'twitter-api-client'

const OAuthLogin = () => {
  const [userInfo, setUserInfo] = useState(null)

  useEffect(() => {
    // Check for the token in localStorage on page load
    const googleToken = localStorage.getItem('googleToken')
    const facebookToken = localStorage.getItem('facebookToken')
    const twitterToken = localStorage.getItem('twitterToken')
    const twitterTokenSecret = localStorage.getItem('twitterTokenSecret')

    if (googleToken) {
      handleGoogleLogin({ tokenId: googleToken })
    } else if (facebookToken) {
      handleFacebookLogin({ accessToken: facebookToken })
    } else if (twitterToken && twitterTokenSecret) {
      handleTwitterLogin({
        oauth_access_token: twitterToken,
        oauth_access_token_secret: twitterTokenSecret
      })
    }
  }, [])

  // Google OAuth 2.0 example
  const handleGoogleLogin = async response => {
    try {
      const res = await fetch('/login/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: response.tokenId })
      })

      if (res.ok) {
        const userInfo = await res.json()
        // Store the Google ID token in localStorage
        localStorage.setItem('googleToken', response.tokenId)
        setUserInfo(userInfo)
      } else {
        console.error('Error logging in with Google:', res.status)
      }
    } catch (error) {
      console.error('Error logging in with Google:', error)
    }
  }

  // Facebook OAuth 2.0 example
  const handleFacebookLogin = async response => {
    try {
      const res = await fetch('/login/facebook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: response.accessToken })
      })

      if (res.ok) {
        const userInfo = await res.json()
        // Store the Facebook access token in localStorage
        localStorage.setItem('facebookToken', response.accessToken)
        setUserInfo(userInfo)
      } else {
        console.error('Error logging in with Facebook:', res.status)
      }
    } catch (error) {
      console.error('Error logging in with Facebook:', error)
    }
  }

  // Twitter OAuth 2.0 example
  const handleTwitterLogin = async response => {
    try {
      const res = await fetch('/login/twitter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token: response.oauth_access_token,
          tokenSecret: response.oauth_access_token_secret
        })
      })

      if (res.ok) {
        const userInfo = await res.json()
        // Store the Twitter access token and token secret in localStorage
        localStorage.setItem('twitterToken', response.oauth_access_token)
        localStorage.setItem(
          'twitterTokenSecret',
          response.oauth_access_token_secret
        )
        setUserInfo(userInfo)
      } else {
        console.error('Error logging in with Twitter:', res.status)
      }
    } catch (error) {
      console.error('Error logging in with Twitter:', error)
    }
  }

  return (
    <div>
      {!userInfo ? (
        <>
          <GoogleLogin
            clientId='your_google_client_id'
            onSuccess={handleGoogleLogin}
            onFailure={error => console.error('Google login failed:', error)}
            cookiePolicy={'single_host_origin'}
          />
          <FacebookLogin
            appId='your_facebook_app_id'
            fields='name,email,picture.type(large)'
            callback={handleFacebookLogin}
            render={renderProps => (
              <button onClick={renderProps.onClick}>Login with Facebook</button>
            )}
          />
          <TwitterLogin
            apiKey='your_twitter_api_key'
            apiSecret='your_twitter_api_secret'
            onSuccess={handleTwitterLogin}
            onFailure={error => console.error('Twitter login failed:', error)}
          />
        </>
      ) : (
        <div>
          <img
            src={
              userInfo.picture
                ? userInfo.picture.data.url
                : userInfo.profile_image_url
            }
            alt={userInfo.name}
          />
          <h2>{userInfo.name}</h2>
          <p>{userInfo.email || userInfo.screen_name}</p>
        </div>
      )}
    </div>
  )
}

export default OAuthLogin
