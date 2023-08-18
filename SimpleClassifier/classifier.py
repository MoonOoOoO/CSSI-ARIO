import cv2
import flask
import warnings
import numpy as np
import tensorflow.keras.backend as K
from flask import Flask, request
from gevent.pywsgi import WSGIServer
from tensorflow.keras.models import load_model
from tensorflow.keras.applications.efficientnet import preprocess_input as preprocess_input_eff

print("Loading model...")

app = Flask(__name__)
warnings.filterwarnings("ignore")
CLASSES = ["DWG", "GPS", "IRR", "MEAS", "NON", "SGN", "WAT", "BCP", "BOV", "CD0", "CD1", "CDM", "CDR",
           "CPCOL", "CPWAL", "LOCEX", "LOCIN", "ODM", "ODS", "OVCAN", "OVFRT"]


def f_beta(y_true, y_pred, threshold_shift=0):
    beta = 2
    y_pred = K.clip(y_pred, 0, 1)
    y_pred_bin = K.round(y_pred + threshold_shift)
    tp = K.sum(K.round(y_true * y_pred_bin)) + K.epsilon()
    fp = K.sum(K.round(K.clip(y_pred_bin - y_true, 0, 1)))
    fn = K.sum(K.round(K.clip(y_true - y_pred, 0, 1)))
    precision = tp / (tp + fp)
    recall = tp / (tp + fn)
    beta_squared = beta ** 2
    return (beta_squared + 1) * (precision * recall) / (beta_squared * precision + recall + K.epsilon())


def precision(y_true, y_pred):
    true_positives = K.sum(K.round(K.clip(y_true * y_pred, 0, 1)))
    predicted_positives = K.sum(K.round(K.clip(y_pred, 0, 1)))
    precision = true_positives / (predicted_positives + K.epsilon())
    return precision


def recall(y_true, y_pred):
    true_positives = K.sum(K.round(K.clip(y_true * y_pred, 0, 1)))
    possible_positives = K.sum(K.round(K.clip(y_true, 0, 1)))
    recall = true_positives / (possible_positives + K.epsilon())
    return recall


def specificity(y_true, y_pred):
    y_pred_pos = K.round(K.clip(y_pred, 0, 1))
    y_pred_neg = 1 - y_pred_pos
    y_pos = K.round(K.clip(y_true, 0, 1))
    y_neg = 1 - y_pos
    tn = K.sum(y_neg * y_pred_neg)
    fp = K.sum(y_neg * y_pred_pos)
    tnr = tn / (tn + fp + K.epsilon())
    return tnr


def dummy_weighted_categorical_loss(y_true, y_pred):
    y_pred /= K.sum(y_pred, axis=-1, keepdims=True)
    y_pred = K.clip(y_pred, K.epsilon(), 1 - K.epsilon())
    loss = y_true * K.log(y_pred)
    loss = -K.sum(loss, -1)
    condition = K.greater(K.sum(y_true), 0)
    return K.switch(condition, loss, K.zeros_like(loss))


def dummy_weighted_loss(y_true, y_pred):
    return K.mean((K.binary_crossentropy(y_true, y_pred)))


def prepare_image(raw_image):
    image = cv2.resize(raw_image, dsize=(299, 299))
    image = np.expand_dims(image, axis=0)
    image = preprocess_input_eff(image)
    return image


def decode_predictions(prediction_batch):
    if len(prediction_batch.shape) != 2 or prediction_batch.shape[1] != len(CLASSES):
        raise ValueError('`decode_predictions` expects a batch of predictions')
    results = []

    prediction = prediction_batch.copy()
    i = int(np.argmax(prediction[0][:9]))
    prediction[0][:9] = 0
    prediction[0][i] = prediction_batch[0][i]
    #   if BCP: CPDMG, CPTYPE, and LOC
    if CLASSES[i] == 'BCP':
        # CPDMG
        i = np.argmax(prediction[0][9:13]) + 9
        prediction[0][9:13] = 0
        prediction[0][i] = prediction_batch[0][i]
        # CPTYPE
        i = np.argmax(prediction[0][13:15]) + 13
        prediction[0][13:15] = 0
        prediction[0][i] = prediction_batch[0][i]
        # LOC
        i = np.argmax(prediction[0][15:17]) + 15
        prediction[0][15:17] = 0
        prediction[0][i] = prediction_batch[0][i]
        # wipe BOV predictions
        prediction[0][17:21] = 0
    # if BOV: OVDMG, OVANG, and LOC
    elif CLASSES[i] == 'BOV':
        # OVDMG
        i = np.argmax(prediction[0][17:19]) + 17
        prediction[0][17:19] = 0
        prediction[0][i] = prediction_batch[0][i]
        # OVANG
        i = np.argmax(prediction[0][19:21]) + 19
        prediction[0][19:21] = 0
        prediction[0][i] = prediction_batch[0][i]
        # LOC
        i = np.argmax(prediction[0][15:17]) + 15
        prediction[0][15:17] = 0
        prediction[0][i] = prediction_batch[0][i]
        # wipe BOV predictions
        prediction[0][9:15] = 0
    else:  # if not BCP or BOV, wipe all predictions
        prediction[0][9:] = 0

    for preds in prediction:
        for index, result in enumerate(preds):
            if result >= 0.5 and CLASSES[index] != "BOV" and CLASSES[index] != "BCP":
                results.append((CLASSES[index], result))
    return results


@app.route("/predict", methods=["POST"])
def predict():
    data = {"success": False}
    # new version
    if request.method == 'POST':
        image_file = request.files['file'].read()
        if image_file:
            image_array = np.fromstring(image_file, np.uint8)
            image_decode = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
            image = prepare_image(image_decode)
            raw_prediction = model.predict(image)
            raw_prediction = np.concatenate(raw_prediction, axis=1)
            results = decode_predictions(raw_prediction)

            data['results'] = []
            for result in results:
                label, prob = result
                data['results'].append({
                    "label": label,
                    "probability": float(prob)
                })
            print(data['results'])
            data["success"] = True
    return flask.jsonify(data)


if __name__ == '__main__':
    model = load_model("model.h5",
                       custom_objects={
                           'fbeta': f_beta,
                           'recall': recall,
                           'precision': precision,
                           'specificity': specificity,
                           "loss": dummy_weighted_categorical_loss,
                           "weighted_loss": dummy_weighted_loss
                       })
    model.summary()
    print("Model loaded, classification server listening at http://localhost:16000/predict")
    WSGIServer(('0.0.0.0', 16000), app).serve_forever()
