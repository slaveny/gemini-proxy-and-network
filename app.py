import os
import logging
from flask import Flask, request, jsonify, Response, send_from_directory

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

app = Flask(__name__)

GEMINI_BASE_URL = "https://generativelanguage.googleapis.com"

@app.route('/', methods=['GET'])
def index():
    return send_from_directory('.', 'index.html')

@app.route('/chat.js', methods=['GET'])
def shortcut_js():
    return send_from_directory('.', 'chat.js', mimetype='application/javascript')

@app.route('/<path:path>', methods=['GET', 'POST', 'PUT', 'DELETE'])
def proxy_gemini(path):
    import requests
    query_string = f"?{request.query_string.decode('utf-8')}" if request.query_string else ""
    
    # Полностью очищаем путь от дубликатов v1beta, оставляя только чистую модель
    clean_path = path.replace('v1beta/', '')
    
    # Собираем идеальный URL для Google API
    target_url = f"{GEMINI_BASE_URL}/v1beta/{clean_path}{query_string}"
        
    logging.info(f"Входящий запрос на: {request.full_path}")
    logging.info(f"Перенаправление на: {target_url}")

    outgoing_headers = {
        key: value for key, value in request.headers if key.lower() != 'host'
    }

    request_body = request.get_data()

    try:
        response = requests.request(
            method=request.method,
            url=target_url,
            headers=outgoing_headers,
            data=request_body,
            stream=True,
            timeout=300
        )

        response_headers = [
            (header, value) for header, value in response.headers.items()
            if header.lower() not in ['content-encoding', 'content-length', 'transfer-encoding', 'connection']
        ]

        flask_response = Response(
            response=response.iter_content(chunk_size=8192),
            status=response.status_code,
            headers=response_headers,
            mimetype=response.headers.get('Content-Type')
        )
        
        logging.info(f"Запрос к {target_url} успешно проксирован со статусом {response.status_code}")
        return flask_response

    except requests.exceptions.RequestException as e:
        logging.error(f"Ошибка при запросе к целевому API Gemini: {e}")
        error_message = {"error": "Proxy connection error", "details": str(e)}
        return jsonify(error_message), 502
    except Exception as e:
        logging.critical(f"Произошла непредвиденная ошибка прокси: {e}")
        return jsonify({"error": f"Внутренняя ошибка прокси: {e}"}), 500


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 25200))
    logging.info(f"Сервер запущен на {port} порту")
    app.run(host='0.0.0.0', port=port, debug=False)
