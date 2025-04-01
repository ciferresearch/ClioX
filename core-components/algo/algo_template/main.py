import os
import pandas as pd
import json
from flask import Flask, render_template, jsonify

app = Flask(__name__)

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DATA_DIR = os.path.join(BASE_DIR, "outputs")

@app.route("/")
def sentiment():
    return render_template("readcsv.html")

if __name__ == "__main__":
    app.run(port=5001, debug=True)