#!/usr/bin/env python3
"""
Palkon Ki Kitab - Multi-User Permanent Storage Server
Serves the web application and saves all user accounts, private shayaris, and poetry directly to disk.
Run with: python3 server.py
"""

import os
import json
import hashlib
import uuid
import re
from urllib.parse import urlparse, parse_qs
from http.server import HTTPServer, SimpleHTTPRequestHandler

PORT = 5050
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(BASE_DIR, 'shayaris.json')
USERS_FILE = os.path.join(BASE_DIR, 'users.json')
USER_DIARIES_FILE = os.path.join(BASE_DIR, 'user_diaries.json')

def load_json(filepath, default):
    if os.path.exists(filepath):
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            return default
    return default

def save_json(filepath, data):
    try:
        temp_file = filepath + '.tmp'
        with open(temp_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        os.replace(temp_file, filepath)
    except Exception:
        try:
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"Warning: Could not save to {filepath}: {e}")

def hash_password(password):
    return hashlib.sha256(password.encode('utf-8')).hexdigest()

def get_default_items():
    if os.path.exists(DATA_FILE):
        return load_json(DATA_FILE, [])
    return []

class DiaryHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def send_json(self, status_code, payload):
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(payload).encode('utf-8'))

    def do_GET(self):
        parsed_url = urlparse(self.path)
        path = parsed_url.path

        # 1. User private data endpoint
        if path == '/api/user/data':
            query = parse_qs(parsed_url.query)
            email = query.get('email', [''])[0].strip().lower()
            if not email:
                self.send_json(400, {'error': 'Email query parameter required'})
                return
            diaries = load_json(USER_DIARIES_FILE, {})
            items = diaries.get(email, get_default_items())
            self.send_json(200, items)
            return

        # 2. Legacy / Guest Shayaris endpoint
        if path == '/api/shayaris':
            items = load_json(DATA_FILE, get_default_items())
            self.send_json(200, items)
            return

        # Default: Serve static files
        super().do_GET()

    def do_POST(self):
        parsed_url = urlparse(self.path)
        path = parsed_url.path

        content_length = int(self.headers.get('Content-Length', 0))
        post_body = self.rfile.read(content_length)

        try:
            data = json.loads(post_body.decode('utf-8')) if post_body else {}
        except Exception as e:
            self.send_json(400, {'error': f'Invalid JSON: {str(e)}'})
            return

        # 1. Sign Up Endpoint
        if path == '/api/auth/signup':
            name = str(data.get('name', '')).strip()
            email = str(data.get('email', '')).strip().lower()
            password = str(data.get('password', '')).strip()

            email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
            if not email or not re.match(email_pattern, email):
                self.send_json(400, {'error': 'Please enter a valid existing email address (e.g. name@gmail.com).'})
                return
            if len(password) < 4:
                self.send_json(400, {'error': 'Password must be at least 4 characters long.'})
                return
            if not name:
                name = email.split('@')[0].capitalize()

            users = load_json(USERS_FILE, [])
            for u in users:
                if u.get('email') == email:
                    self.send_json(400, {'error': 'This email is already registered. Please click Log In.'})
                    return

            new_user = {
                'id': str(uuid.uuid4()),
                'name': name,
                'email': email,
                'password_hash': hash_password(password)
            }
            users.append(new_user)
            save_json(USERS_FILE, users)

            # Initialize user diary as empty (clean private slate)
            diaries = load_json(USER_DIARIES_FILE, {})
            user_items = []
            diaries[email] = user_items
            save_json(USER_DIARIES_FILE, diaries)

            self.send_json(200, {
                'success': True,
                'user': {'id': new_user['id'], 'name': name, 'email': email},
                'items': user_items
            })
            return

        # 2. Login Endpoint
        if path == '/api/auth/login':
            email = str(data.get('email', '')).strip().lower()
            password = str(data.get('password', '')).strip()

            if not email or not password:
                self.send_json(400, {'error': 'Email and password are required.'})
                return

            users = load_json(USERS_FILE, [])
            user_exists = any(u.get('email') == email for u in users)
            if not user_exists:
                self.send_json(404, {'error': 'No account found with this email. Please click Sign Up to create an account.'})
                return

            hashed = hash_password(password)
            user_match = next((u for u in users if u.get('email') == email and u.get('password_hash') == hashed), None)

            if not user_match:
                self.send_json(401, {'error': 'Incorrect password. Please try again.'})
                return

            diaries = load_json(USER_DIARIES_FILE, {})
            items = diaries.get(email, [])
            self.send_json(200, {
                'success': True,
                'user': {'id': user_match['id'], 'name': user_match['name'], 'email': user_match['email']},
                'items': items
            })
            return

        # 3. Save User Private Items Endpoint
        if path == '/api/user/data':
            email = str(data.get('email', '')).strip().lower()
            items = data.get('items', [])

            if not email:
                self.send_json(400, {'error': 'User email is required'})
                return
            if not isinstance(items, list):
                self.send_json(400, {'error': 'Items must be a list'})
                return

            diaries = load_json(USER_DIARIES_FILE, {})
            diaries[email] = items
            save_json(USER_DIARIES_FILE, diaries)

            self.send_json(200, {'status': 'saved', 'count': len(items)})
            return

        # 4. Legacy Guest Shayaris Endpoint
        if path == '/api/shayaris':
            if isinstance(data, list):
                save_json(DATA_FILE, data)
                self.send_json(200, {'status': 'saved', 'count': len(data)})
                return
            self.send_json(400, {'error': 'Expected array of shayaris'})
            return

        self.send_json(404, {'error': 'Endpoint not found'})

class DiaryServer(HTTPServer):
    allow_reuse_address = True

if __name__ == '__main__':
    web_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(web_dir)
    server_address = ('', PORT)
    httpd = DiaryServer(server_address, DiaryHandler)
    print("==================================================")
    print("  Palako Ki Kitab - Multi-User Permanent Server")
    print(f"  Open in browser: http://localhost:{PORT}")
    print(f"  Users: {USERS_FILE}")
    print(f"  User Diaries: {USER_DIARIES_FILE}")
    print("==================================================")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
