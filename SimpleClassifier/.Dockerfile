FROM ubuntu:18.04
# FROM nvidia/cuda:11.4.2-runtime-ubuntu20.04
RUN apt-get update && apt-get upgrade -y && apt-get install -y \
    python3-pip libgl1-mesa-dev libglib2.0-0 \
    && pip3 install pip --upgrade \
    && pip3 install opencv-python flask tensorflow gevent
COPY ./models/efficientnet_model.h5 /classifier/model.h5
COPY ./classifier.py /classifier/classifier.py
WORKDIR /classifier
EXPOSE 16000
ENTRYPOINT ["python3"]
CMD [ "classifier.py" ]