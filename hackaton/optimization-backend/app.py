from flask import Flask, request, jsonify
from flask_cors import CORS

from rl_model import get_optimal_schedule

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
   
@app.route("/get_optimal_gantt", methods=['POST'])
def get_optimal_gantt():
    
    tasks_json = request.get_json()

    optimal_json = get_optimal_schedule(tasks_json)

    if optimal_json:
        return optimal_json, 200
    else:
        return jsonify({"error": "Could not find an optimal schedule"}), 500

@app.route("/", methods=['GET'])
def home():
    return "Optimization Backend is running", 200

if __name__ == "__main__":
    app.run(host='localhost', port=5000, debug=True)