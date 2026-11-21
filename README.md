<div align="right">
  <strong>🇺🇸 English</strong> | <a href="README.ru.md">🇷🇺 Русский</a>
</div>

### 🌹 Fascinating Rose : Responsive Web Interface and AI Proxy for Gemini API in Docker

**Fascinating Rose** is a lightweight, fully mobile-responsive chat web interface with a built-in Python proxy for working with the Google Gemini API (Free Tier). The project is designed using a microservices architecture, fully isolated within a Docker network, and secured with end-to-end SSL encryption powered by Nginx.

It is a custom-tailored modification (a fork of sorts) of the project by `rainy351/gemini_proxy`.

The project folder contains a currently up-to-date `allmodells.txt`.
Key differences include a dedicated Web interface and model selection;

---

#### 🔥 Key Features

* 📱 **Responsive Design (100dvh):** The interface is built with Flexbox. The input field stays firmly fixed above the keyboard on any smartphone and does not get pushed off-screen while typing.
* 🛡️ **API Key Security:** The secret token is entered directly in the browser and is not saved between sessions.
* 🧠 **Modern Model Support:** Out-of-the-box selection between `Gemini 3.5 Flash`, `Gemini 3.7 Flash`, `Gemini 3.1 Pro Preview`, as well as specialized TTS and Transcribe models.
* 📦 **One-Command Deployment:** The entire project—including static assets, the Python server, and the Nginx SSL gateway—spins up via a single Docker Compose manifest.
* 🎨 **Aesthetic Visuals:** Semi-transparent glass chat message cards scroll smoothly over a fixed neon cyber-rose background with a frosted glass effect (`backdrop-filter: blur`).

---

#### 🏗️ Project Architecture

The system is divided into three independent layers of responsibility:

1. **Frontend (`html/`)**: Static files (`index.html` and `chat.js`) served instantly by the Nginx web server directly from the disk, bypassing Python code.
2. **Backend Proxy (`app.py`)**: A lightweight Flask application powered by Gunicorn. It normalizes incoming URL paths, strips duplicate API version prefixes (`/v1beta/`), and proxies the response stream from Google servers.
3. **Security Gateway (`Nginx`)**: A front controller that accepts secured HTTPS traffic on port 443 and forwards it inside the internal Docker network to the port of the private Flask application.

---

#### 🛠️ Deployment and Launch

##### 1. Preparing Folders and Files
Make sure your project structure on the server looks like this:
```text
├── docker-compose.yml
├── Dockerfile
├── app.py
├── .env
├── html/
│   ├── index.html
│   ├── chat.js
│   └── logo.png        # Your cyber-rose background image
└── nginx_conf/
    └── default.conf
```

##### 2. Creating the `.env` Environment File
Create a `.env` file in the root directory and specify the target internal port for the application; it will not be exposed externally and is used solely for communicating with Nginx:
```env
PORT=25200
```

##### 3. Starting the System
To build the images without using old cache and launch the entire infrastructure in the background, run a single command in your server terminal:

```bash
docker-compose up -d --build
```

The project will start up and become accessible over the secure HTTPS protocol.

---

#### 📈 Management and Logging

* **View backend logs in real time:**
  ```bash
  docker logs -f gemini_proxy
  ```
* **View Nginx web server logs:**
  ```bash
  docker logs -f gemini-nginx
  ```
* **Completely stop and remove project containers:**
  ```bash
  docker-compose down
  ```

---

#### ❗ Disclaimer
This project is provided "AS IS". By deploying and using this proxy, you do so at your own risk. Using proxy servers to access the Gemini API from restricted regions may be governed by the Google Cloud Terms of Service.
Nginx itself requires additional header configuration. Currently, the API key is passed via a variable, whereas it should be passed in an Nginx header.

#### 📝 License
This project is distributed under the free MIT License. See the `LICENSE` file for details.
