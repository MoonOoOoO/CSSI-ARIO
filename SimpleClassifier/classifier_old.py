# USAGE
# Start the server:
#     On Windows Powershell:
#     $env:FLASK_APP = "classifier.py"
#     On Windows CMD:
#     set FLASK_APP=classifier.py
#     On Linux:
#     export FLASK_APP=classifier.py
#     python -m flask run --port=16000
# Submit a request via cURL:
#     curl -X POST -F file=@dog.jpg 'http://localhost:16000/predict'

# import the necessary packages
import io
import collections

import tensorflow as tf
import tensorflow.keras.backend as K
from tensorflow.python.keras.applications.xception import preprocess_input
from tensorflow.python.keras.models import load_model

import cv2

import numpy as np

import flask

from glob import glob
import collections
from tqdm import tqdm

import cv2, os, shutil
import numpy as np
import pandas as pd
from sklearn.utils.class_weight import compute_class_weight
from copy import deepcopy
import pickle


# File containing the model to load
MODEL_FILE = 'model.h5'
# Names of the classes
CLASSES = [
    'CD',
    'CDM',
    'CDR2',
    'CDR3',
    'CPBEAM',
    'CPCOL',
    'CPWAL',
    'DWG',
    'GPS',
    'IRR',
    'LOCEX',
    'LOCIN',
    'MEAS',
    'NON',
    'OD0',
    'OD1',
    'OD2',
    'OVCAN',
    'OVFRT',
    'SGN',
    'WAT'
]
# Multiplier for positive targets, needs to be tuned
POS_WEIGHT = 10
IMAGE_HEIGHT = 299
IMAGE_WIDTH = 299

# initialise Flask application and Keras model 
app = flask.Flask(__name__)
model = None
graph = None


def prepare_image(raw_image):
    image = cv2.resize(raw_image, dsize=(IMAGE_HEIGHT, IMAGE_WIDTH), interpolation=cv2.INTER_LINEAR).astype(np.float64)
    image = np.expand_dims(image, axis=0)
    image = preprocess_input(image)
    return image


def precision(y_true, y_pred):
    """Precision metric.
    Only computes a batch-wise average of precision.
    Computes the precision, a metric for multi-label classification of
    how many selected items are relevant.
    """
    true_positives = K.sum(K.round(K.clip(y_true * y_pred, 0, 1)))
    predicted_positives = K.sum(K.round(K.clip(y_pred, 0, 1)))
    precision = true_positives / (predicted_positives + K.epsilon())
    return precision


def recall(y_true, y_pred):
    """Recall metric.
    Only computes a batch-wise average of recall.
    Computes the recall, a metric for multi-label classification of
    how many relevant items are selected.
    """
    true_positives = K.sum(K.round(K.clip(y_true * y_pred, 0, 1)))
    possible_positives = K.sum(K.round(K.clip(y_true, 0, 1)))
    recall = true_positives / (possible_positives + K.epsilon())
    return recall


def fbeta(y_true, y_pred, threshold_shift=0):
    beta = 2

    # just in case of hipster activation at the final layer
    y_pred = K.clip(y_pred, 0, 1)

    # shifting the prediction threshold from .5 if needed
    y_pred_bin = K.round(y_pred + threshold_shift)

    tp = K.sum(K.round(y_true * y_pred_bin)) + K.epsilon()
    fp = K.sum(K.round(K.clip(y_pred_bin - y_true, 0, 1)))
    fn = K.sum(K.round(K.clip(y_true - y_pred, 0, 1)))

    precision = tp / (tp + fp)
    recall = tp / (tp + fn)

    beta_squared = beta ** 2
    return (beta_squared + 1) * (precision * recall) / (beta_squared * precision + recall + K.epsilon())


def specificity(y_true, y_pred):
    """Specificity/True Negative Rate"""
    y_pred_pos = K.round(K.clip(y_pred, 0, 1))
    y_pred_neg = 1 - y_pred_pos
    y_pos = K.round(K.clip(y_true, 0, 1))
    y_neg = 1 - y_pos
    # tp = K.sum(y_pos * y_pred_pos)
    tn = K.sum(y_neg * y_pred_neg)
    fp = K.sum(y_neg * y_pred_pos)
    # fn = K.sum(y_pos * y_pred_neg)
    tnr = tn/(tn+fp+K.epsilon())
    return tnr


def focal_loss(gamma=2, alpha=0.6):
    # https://github.com/Atomwh/FocalLoss_Keras
    def focal_loss_fixed(y_true, y_pred):
        pt_1 = tf.where(tf.equal(y_true, 1), y_pred, tf.ones_like(y_pred))
        pt_0 = tf.where(tf.equal(y_true, 0), y_pred, tf.zeros_like(y_pred))
        return -K.sum(alpha * K.pow(1. - pt_1, gamma) * K.log(pt_1))-K.sum((1-alpha) * K.pow( pt_0, gamma) * K.log(1. - pt_0))
    return focal_loss_fixed


def get_weighted_loss(weights):
    def weighted_loss(y_true, y_pred):
        return K.mean((weights[:, 0]**(1-y_true))*(weights[:,1]**(y_true))*K.binary_crossentropy(y_true, y_pred), axis=-1)
    return weighted_loss


def get_weights(data, columns):
    number_dim = np.shape(data[columns].values)[1]
    weights = np.empty([number_dim, 2])
    for i in range(number_dim):
        weights[i] = compute_class_weight('balanced', [0., 1.], data[columns].values[:, i])
    return weights


# Load the pre-trained Keras model
def create_model(model_file):
    n = len(CLASSES)
    cols = [str(l) for l in list(range(n))]
    data = pd.DataFrame(np.random.random_integers(0, 1, (n, n)), columns=cols)
    global model
    model = load_model(model_file, custom_objects={
        'fbeta': fbeta,
        'recall': recall,
        'weighted_loss': get_weighted_loss(get_weights(data, cols)),
        'precision': precision,
        'specificity': specificity})
    # Workaround to use the model from another thread
    model._make_predict_function()
    # model.summary()
    global graph
    graph = tf.get_default_graph()


def decode_predictions(prediction_batch):
    if len(prediction_batch.shape) != 2 or prediction_batch.shape[1] != len(CLASSES):
        raise ValueError('`decode_predictions` expects a batch of predictions')

    results = []
    for predictions in prediction_batch:
        for index, prediction in enumerate(predictions):
            # If the prediction is greater than 0.5
            # This image belongs to the category
            if prediction >= 0.5:
                results.append((CLASSES[index], prediction))
    
    return results


def init():
    print("Init method for the app")
    create_model(MODEL_FILE)


@app.route("/predict", methods=["POST"])
def predict():
    # initialize the data dictionary that will be returned from the
    # view
    data = {"success": False}

    # ensure an image was properly uploaded to our endpoint
    if flask.request.method == "POST":
        if flask.request.files.get("file"):
            # read the image in OpenCV format
            image_file = flask.request.files["file"].read()
            image_buffer = io.BytesIO(image_file)
            image_data = np.fromstring(image_buffer.getvalue(), dtype=np.uint8)
            image_decoded = cv2.imdecode(image_data, cv2.IMREAD_COLOR)

            # Preprocess the image and prepare it for classification
            image = prepare_image(image_decoded)

            # Classify the input image and then initialize the list
            # of predictions to return to the client
            with graph.as_default():
                preds = model.predict(image)
            results = decode_predictions(preds)
            
            data['results'] = []
            for result in results:
                label, prob = result
                data['results'].append({
                    "label": label,
                    "probability": float(prob)
                })

            print(data['results'])

            # indicate that the request was a success
            data["success"] = True

    # return the data dictionary as a JSON response
    return flask.jsonify(data)


if __name__=="__main__":
    print(('* loading Keras model and Flask starting server'))
    create_model(MODEL_FILE)
    app.run(host = '0.0.0.0', port = 16000, threaded=False)