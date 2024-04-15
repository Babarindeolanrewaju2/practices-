from flask import Flask, request, jsonify
from flask_cors import CORS
from google.oauth2 import id_token
from google.auth.transport import requests
import facebook
import tweepy

app = Flask(__name__)
CORS(app)

# Set up OAuth 2.0 configurations
GOOGLE_CLIENT_ID = 'your_google_client_id'
FACEBOOK_APP_ID = 'your_facebook_app_id'
FACEBOOK_APP_SECRET = 'your_facebook_app_secret'
TWITTER_API_KEY = 'your_twitter_api_key'
TWITTER_API_SECRET = 'your_twitter_api_secret'

@app.route('/login/google', methods=['POST'])
def login_google():
    token = request.json.get('token')
    if not token:
        return jsonify({'error': 'No token provided'}), 400

    try:
        idinfo = id_token.verify_oauth2_token(token, requests.Request(), GOOGLE_CLIENT_ID)
        user_info = {
            'id': idinfo['sub'],
            'name': idinfo['name'],
            'email': idinfo['email'],
            'picture': idinfo['picture']
        }
        return jsonify(user_info)
    except ValueError as e:
        return jsonify({'error': str(e)}), 401

@app.route('/login/facebook', methods=['POST'])
def login_facebook():
    token = request.json.get('token')
    if not token:
        return jsonify({'error': 'No token provided'}), 400

    try:
        graph = facebook.GraphAPI(access_token=token)
        user_info = graph.get_object('me', fields='id,name,email,picture.type(large)')
        return jsonify(user_info)
    except facebook.exceptions.OAuthException as e:
        return jsonify({'error': str(e)}), 401

@app.route('/login/twitter', methods=['POST'])
def login_twitter():
    token = request.json.get('token')
    token_secret = request.json.get('tokenSecret')
    if not token or not token_secret:
        return jsonify({'error': 'No token or token secret provided'}), 400

    try:
        auth = tweepy.OAuthHandler(TWITTER_API_KEY, TWITTER_API_SECRET)
        auth.set_access_token(token, token_secret)
        api = tweepy.API(auth)
        user = api.verify_credentials()
        user_info = {
            'id': user.id_str,
            'name': user.name,
            'screen_name': user.screen_name,
            'profile_image_url': user.profile_image_url
        }
        return jsonify(user_info)
    except tweepy.TweepyException as e:
        return jsonify({'error': str(e)}), 401

if __name__ == '__main__':
    app.run(debug=True)
